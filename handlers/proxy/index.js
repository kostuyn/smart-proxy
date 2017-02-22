'use strict';

const express = require('express');
const net = require('net');
const https = require('https');
const url = require('url');

module.exports = function(httpsProxy, log){
	const app = express();
	//
	// const router=express.Router();
	//
	// config.forEach(function(rule){
	// 	router[rule.method](rule.path, function(req, res){
	// 		res.status(rule.statusCode);
	// 		res.send();
	// 	});
	// });

	app.use(function(req, res, next){
		const protocol = req.headers['x-forwarded-prot'] || 'https';
		const parsedHost = req.headers['x-forwarded-host'] || req.hostname;
		const splitHost = parsedHost.split(':');

		const hostName = splitHost[0];
		const port = parseInt(splitHost[1], 10) || (protocol == 'https' ? 443 : 80);

		res.locals.protocol = protocol;
		res.locals.hostName = hostName;
		res.locals.port = port;

		next();
	});

	app.use(function(req, res, next){
		log.info('Hello from Proxy.');

		const serverUrl = url.parse(req.url);
		const remoteUrl = url.format({
			protocol: res.locals.protocol,
			hostname: res.locals.hostName,
			port: res.locals.port
		});
		console.log(req.url);

		console.log(res.locals);
		console.log(remoteUrl);

		if(serverUrl.pathname == '/_api/searching/startSync2/') {
			res.status(400);
			return res.send();
		}

		const options = {
			hostname: res.locals.hostName,
			port: res.locals.port,
			path: req.url,
			method: req.method
		};

		httpsProxy(req, res, options);


		//proxy.web(req, res, {target: remoteUrl, secure: false});
		// proxy.on('proxyReq', function(proxyReq, req, res, options) {
		// 	proxyReq.setHeader('host',  res.locals.hostName);
		// });
		// proxy.on('error', function(err){
		// 	console.log('proxy', err);
		// });
		// proxy.on('proxyRes', function(proxyRes, req, res) {
		// 	console.log('proxyRes');
		// 	//console.log(req1.body);
		// 	var body = [];
		// 	proxyRes
		// 		.on('data', function(chunk) {
		// 			body.push(chunk);
		// 		})
		// 		.on('end', function() {
		// 			body = Buffer.concat(body).toString();
		// 			console.log('rec');
		// 			console.log(body);
		// 		});
		// 	//proxyRes.pipe(process.stdout);
		// });
	});

	return app;
};