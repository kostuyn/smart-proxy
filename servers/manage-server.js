'use strict';

const serverFactory = require('./server-factory');

const log = console;

module.exports = function(port, manageFactory, rulesService){
	const manage = manageFactory(rulesService, log);
	const server = serverFactory.listenHttp(port, log);
	server.on('request', manage);
};
