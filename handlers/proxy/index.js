'use strict';

const express = require('express');
const net = require('net');
const url = require('url');

module.exports = function(httpsProxy, rulesService, log) {
	const app = express();

	app.disable('x-powered-by');
	app.disable('etag');

	app.use(function(req, res, next) {
		const rules = rulesService.getAll();

		for(let i = 0; i < rules.length; i++) {
			const rule = rules[i];

			const parsedUrl = url.parse(req.url);
			const pathName = parsedUrl.pathname.replace(/\/$/, "");

			const params = rule.route.match(pathName);
			if(params) {
				log.info('apply rule:', rule.data);
				const headers = Object.assign({'X-Proxy-Response': true}, rule.data.headers);
				res.set(headers);
				res.status(rule.data.statusCode);
				return res.send(rule.data.content);
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
