'use strict';

const express = require('express');
const net = require('net');
const url = require('url');
const Route = require('route-parser');

module.exports = function(proxy, configService, log) {
	const app = express();

	app.disable('x-powered-by');
	app.disable('etag');

	app.use(function(req, res, next) {
		if(configService.getMode() != configService.modes.PROXY) {
			return next();
		}

		const parsedUrl = url.parse(req.url);
		const pathName = parsedUrl.pathname.replace(/\/$/, "");
		const rules = configService.getAllRules();

		for(let i = 0; i < rules.length; i++) {
			const rule = rules[i];

			const route = new Route(rule.path);
			const params = route.match(pathName);
			if(params) {
				log.info('apply rule:', rule);
				const headers = Object.assign({'X-Proxy-Response': true}, rule.headers);
				res.set(headers);
				res.status(rule.statusCode);
				return res.send(rule.response); // TODO: array of responses
			}
		}

		next();
	});

	app.use(function(req, res, next) {
		if(configService.getMode() != configService.modes.PROXY) {
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
			let body = '';
			response.on('data', function(chunk) {
				body += chunk;
			});
			response.on('end', function() {
				rule.response = body;

				//console.log('New rule:', rule);

				configService.add(rule);
				res.send();
			});
			response.on('error', function(err) {
				log.error('Response error:', err);
				res.sendStatus(500);
			});
		});
	});

	return app;
};
