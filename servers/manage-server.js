'use strict';

const serverFactory = require('./server-factory');

const log = console;

module.exports = function(port, manageFactory, configService){
	const manage = manageFactory(configService, log);
	const server = serverFactory.listenHttp(port, log);
	server.on('request', manage);
};
