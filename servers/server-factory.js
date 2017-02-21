'use strict';

const http = require('http');
const https = require('https');


exports.listenHttp = function(port, log){
	const server = http.createServer();
	server.on('error', _onError(port, log));
	server.on('listening', _onListening(port, log));

	server.listen(port);
	
	return server;
};

exports.listenHttps = function(port, options, log){
	const server = https.createServer(options);	
	server.on('error', _onError(port, log));
	server.on('listening', _onListening(port, log));
	server.listen(port);
	
	return server;
};

function _onError(port, log) {
	return function(error) {
		if(error.syscall !== 'listen') {
			throw error;
		}

		var bind = 'Port ' + port;

		switch(error.code) {
			case 'EACCES':
				log.error(bind + ' requires elevated privileges');
				process.exit(1);
				break;
			case 'EADDRINUSE':
				log.error(bind + ' is already in use');
				process.exit(1);
				break;
			default:
				throw error;
		}
	};
}

function _onListening(port, log) {
	return function(){
		var bind = 'port ' + port;
		log.info('Listening on ' + bind);
	}
}

// class ServerFactory{
// 	constructor(log){
// 		this.log = log;
// 	}
//
// 	createHttp(port, app){
// 		const server = http.createServer(app);
// 		server.listen(port);
// 		server.on('error', _onError.call(this, port));
// 		server.on('listening', _onListening.call(this, port));
//
// 		return server;
// 	}
//
// 	createHttps(port, options, app){
// 		const server = https.createServer(options, app);
// 		server.listen(port);
// 		server.on('error', _onError.call(this, port));
// 		server.on('listening', _onListening.call(this, port));
//
// 		return server;
// 	}
// }
//
// module.exports = function(log){
// 	return new ServerFactory(log);
// };
//
// function _onError(port) {
// 	const self = this;
// 	return function(error) {
// 		if(error.syscall !== 'listen') {
// 			throw error;
// 		}
//
// 		var bind = 'Port ' + port;
//
// 		switch(error.code) {
// 			case 'EACCES':
// 				self.log.error(bind + ' requires elevated privileges');
// 				process.exit(1);
// 				break;
// 			case 'EADDRINUSE':
// 				self.log.error(bind + ' is already in use');
// 				process.exit(1);
// 				break;
// 			default:
// 				throw error;
// 		}
// 	};
// }
//
// function _onListening(port) {
// 	const self = this;
// 	return function(){
// 		var bind = 'port ' + port;
// 		self.log.info('Listening on ' + bind);
// 	}
// }

