'use strict';

const express = require('express');
const net = require('net');
const https = require('https');
const url = require('url');

const config = require('./config.json');

module.exports = function(httpsProxy, log){
	const app = express();
	const router = express.Router();
	
	app.disable('x-powered-by');
	
	config.forEach(function(rule){
		router[rule.method](rule.path, function(req, res){
			res.setHeader('X-Proxy-Response', true);
			res.status(rule.statusCode);
			res.send();
		});
	});

	app.use('/', router);

	app.use(function(req, res, next){
		log.info('Hello from Proxy.');

		httpsProxy(req, res);
	});

	return app;
};
