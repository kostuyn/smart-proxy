'use strict';

const serverFactory = require('./server-factory');

const log = console;

module.exports = function(port, apiFactory){
	const api = apiFactory(log);
	const server = serverFactory.listenHttp(port, log);
	server.on('request', api);
};
