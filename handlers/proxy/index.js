'use strict';

const express = require('express');
const net = require('net');
const url = require('url');

module.exports = function(httpsProxy, rulesService, log) {
	const app = express();

	app.disable('x-powered-by');

	app.use(function(req, res, next) {
		const rules = rulesService.getAll();		

		for(let i = 0; i < rules.length; i++) {
			const rule = rules[i];

			const parsedUrl = url.parse(req.url);
			const pathName = parsedUrl.pathname.replace(/\/$/, "");

			const params = rule.route.match(pathName);
			if(params) {
				log.info('apply rule:', rule.data);
				res.setHeader('X-Proxy-Response', true);
				res.status(rule.data.statusCode);
				return res.send();
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
