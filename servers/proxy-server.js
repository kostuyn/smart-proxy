'use strict';

const fs = require('fs');
const serverFactory = require('./server-factory');

const log = console;

exports.http = function(port, proxyFactory, rulesService){
	const httpProxy = serverFactory.httpProxy(log);
	const proxy = proxyFactory(httpProxy, rulesService, log);
	
	const server = serverFactory.listenHttp(port, log);
	server.on('request', proxy);
};

exports.https = function(port, proxyFactory, rulesService){
	const options = {
		key: fs.readFileSync(__dirname + '/localhost.key'),
		cert: fs.readFileSync(__dirname + '/localhost.cert')
	};

	const httpProxy = serverFactory.httpsProxy(log);
	const proxy = proxyFactory(httpProxy, rulesService, log);

	const server = serverFactory.listenHttps(port, options, log);
	server.on('request', proxy);
};
