'use strict';

const express = require('express');
const net = require('net');
const url = require('url');
const zlib = require('zlib');
const compression = require('compression');

const Route = require('route-parser');
const _ = require('lodash');

module.exports = function(proxy, configService, log) {
	const app = express();

	app.disable('x-powered-by');
	app.disable('etag');

	app.use(compression());

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

		for(let i = 0; i < rules.length; i++) {
			const rule = rules[i];

			const route = new Route(rule.path);
			const params = route.match(pathName);
			if(params && req.method == rule.method) {
				log.info('apply rule:', {path: rule.path, method: rule.method});
				const headers = Object.assign({'X-Proxy-Response': true}, rule.headers);
				const preparedHeaders = _.omit(headers, ['transfer-encoding', 'content-encoding']); // omit 'bad' headers
				res.set(preparedHeaders);
				res.status(rule.statusCode);

				return res.send(rule.response);
			}
		}

		next();
	});

	app.use(function(req, res, next) {
		if(res.locals.mode == configService.modes.CAPTURE) {
			return next();
		}

		log.info('Hello from Proxy.');
		proxy(req, res);
	});

	app.use(function(req, res, next) {
		log.info('Hello from Capture.');
		proxy(req, res, function(err, response) {
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

				//console.log('New rule:', rule);

				configService.add(rule);
				res.send();
			});
			pp.on('error', function(err) {
				log.error('Response error:', err);
				//res.sendStatus(500);
			});
		});
	});

	return app;
};
