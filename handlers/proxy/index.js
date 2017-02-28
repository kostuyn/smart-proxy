'use strict';

const express = require('express');
const net = require('net');
const url = require('url');
const Route = require('route-parser');

module.exports = function(httpsProxy, configService, log) {
	const app = express();

	app.disable('x-powered-by');
	app.disable('etag');

	app.use(function(req, res, next) {
		const rules = configService.getAllRules();

		for(let i = 0; i < rules.length; i++) {
			const rule = rules[i];

			const parsedUrl = url.parse(req.url);
			const pathName = parsedUrl.pathname.replace(/\/$/, "");

			const route = new Route(rule.path);
			const params = route.match(pathName);
			if(params) {
				log.info('apply rule:', rule);
				const headers = Object.assign({'X-Proxy-Response': true}, rule.headers);
				res.set(headers);
				res.status(rule.statusCode);
				return res.send(rule.content);
			}
		}

		next();
	});

	app.use(function(req, res, next) {
		log.info('Hello from Proxy.');

		httpsProxy(req, res);
	});

	return app;
};
