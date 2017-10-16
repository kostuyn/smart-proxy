'use strict';

const express = require('express');
const net = require('net');
const url = require('url');
const zlib = require('zlib');
const PassThrough = require('stream').PassThrough;

const compression = require('compression');
const bodyParser = require('body-parser');
const Route = require('route-parser');
const _ = require('lodash');

module.exports = function(proxy, configService, log) {
	const app = express();

	app.disable('x-powered-by');
	app.disable('etag');

	// copy req
	app.use(function(req, res, next){
		const copyReq = new PassThrough();
		Object.assign(copyReq, {headers: req.headers, method: req.method, hostname: req.hostname, url: req.url});

		req.pipe(copyReq);

		res.locals.copyReq = copyReq;
		next();
	});

	app.use(compression());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));

	app.use(function(req, res, next) {
		res.locals.mode = configService.getMode();
		next();
	});

	app.use(function(req, res, next) {
		if(res.locals.mode != configService.modes.PROXY) {
			return next();
		}

		const parsedUrl = url.parse(req.url);
		const pathName = parsedUrl.pathname.replace(/\/$/, "");
		const rules = configService.getAllRules();

		const matchingRules = _.filter(rules, function(rule){
			const route = new Route(rule.path);
			return route.match(pathName) &&
				req.method == rule.method &&
				compareObj(rule.reqBody, req.body);
		});

		for(let i = 0; i < matchingRules.length; i++) {
			const rule = matchingRules[i];
			const nextRule = matchingRules[i+1];

			if(nextRule && rule.count >= nextRule.count){
				continue;
			}

			log.info('apply rule:', {path: rule.path, method: rule.method, reqBody: rule.reqBody});
			const headers = Object.assign({'X-Proxy-Response': true}, rule.headers);
			const preparedHeaders = _.omit(headers, ['transfer-encoding', 'content-encoding']); // omit 'bad' headers

			res.set(preparedHeaders);
			res.status(rule.statusCode);
			rule.count++;

			return res.send(rule.response);
		}

		next();
	});

	app.use(function(req, res, next) {
		if(res.locals.mode == configService.modes.CAPTURE) {
			return next();
		}

		log.info('Hello from Proxy.');
		proxy(res.locals.copyReq, res);
	});

	app.use(function(req, res, next) {
		log.info('Hello from Capture.');
		proxy(res.locals.copyReq, res, function(err, response) {
			const parsedUrl = url.parse(req.url);
			const rule = {
				method: req.method,
				path: parsedUrl.pathname.replace(/\/$/, ""),
				statusCode: response.statusCode,
				headers: response.headers
			};

			let pp = response;
			if(response.headers['content-encoding']) {
				pp = response.pipe(zlib.createUnzip());
			}

			let body = '';
			pp.on('data', function(chunk) {
				body += chunk;
			});
			pp.on('end', function() {
				rule.response = body;

				configService.add(rule);
			});
			pp.on('error', function(err) {
				log.error('Response error:', err);
				res.sendStatus(500);
			});
		});
	});

	return app;
};

function compareObj(reqBodyRule, reqBody) {
	return _.every(reqBodyRule, function(value, key) {
		const bodyValue = reqBody[key];
		if(_.isObject(value) && _.isObject(bodyValue)){
			return compareObj(value, bodyValue)
		}

		return bodyValue === value;
	});
}
