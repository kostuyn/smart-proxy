'use strict';

const express = require('express');
const httpProxy = require('http-proxy');
const url = require('url');

module.exports = function(log){
	const app = express();
	const proxy = httpProxy.createProxyServer({});
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
		log.info('Hello from Proxy.');
		log.info(req.headers);
		log.info(req.method);
		const serverUrl = url.parse(req.url);
		const remoteUrl = url.format({
			protocol: 'https',
			hostname: req.headers.host,
			port: 443
		});
		console.log(req.url);

		//console.log(serverUrl);

		if(serverUrl.pathname == '/_api/searching/startSync2/') {
			res.status(400);
			return res.send();
		}

		proxy.web(req, res, {target: remoteUrl, secure: false});
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