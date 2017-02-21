'use strict';

const fs = require('fs');
const serverFactory = require('./server-factory');

const log = console;

module.exports = function(port, proxyFactory){
	const options = {
		key: fs.readFileSync(__dirname + '/localhost.key'),
		cert: fs.readFileSync(__dirname + '/localhost.cert')
	};
	
	const httpProxy = serverFactory.httpsProxy(log);
	const proxy = proxyFactory(httpProxy, log);
	
	const server = serverFactory.listenHttps(port, options, log);
	server.on('request', proxy);
};
