'use strict';

const net = require('net');
const serverFactory = require('./server-factory');

const log = console;

module.exports = function(port, proxyHost, proxyPort){
	const server = serverFactory.listenHttp(port, log);

	server.on('connect', onConnect);
	
	function onConnect(req, clientSocket, head) {
		log.info('(CONNECT) Receiving reverse proxy request for:' + req.url);

		var proxySocket = net.connect(proxyPort, proxyHost, function() {
			clientSocket.write(
				'HTTP/1.1 200 Connection Established\r\n' +
				'Proxy-agent: Smart-Proxy\r\n' +
				'\r\n');

			proxySocket.write(head);
			proxySocket.pipe(clientSocket);
			clientSocket.pipe(proxySocket);
		});

		clientSocket.on('error', function(e) {
			console.error('socket error', e);
		});
	}
};

// const ServerBase = require('./server-base');
//
// const serverHelperFactory = require('./server-helper');
//
// class ConnectServer extends ServerBase{
// 	constructor(port, serverFactory, log){
// 		this._server = serverFactory.createHttp(port);
// 	}
//
// 	start(port, proxyHost, proxyPort){
// 		this._server.listen();
//		
// 		const server = http.createServer(port);
// 		server.on('connect', onConnect);
//
// 		function onConnect(req, clientSocket, head) {
// 			console.log('(CONNECT) Receiving reverse proxy request for:' + req.url);
//
// 			var proxySocket = net.connect(proxyPort, proxyHost, function() {
// 				clientSocket.write(
// 					'HTTP/1.1 200 Connection Established\r\n' +
// 					'Proxy-agent: Smart-Proxy\r\n' +
// 					'\r\n');
//
// 				proxySocket.write(head);
// 				proxySocket.pipe(clientSocket);
// 				clientSocket.pipe(proxySocket);
// 			});
//
// 			clientSocket.on('error', function(e) {
// 				console.error('socket error', e);
// 			});
// 		}
//		
//		
// 		server.listen(this._port);
// 		server.on('connect', onConnect);
// 		server.on('error', this._onError);
// 		server.on('listening', this._onListening);
//
// 		function onConnect(req, clientSocket, head) {
// 			console.log('(CONNECT) Receiving reverse proxy request for:' + req.url);
//
// 			var proxySocket = net.connect(proxyPort, proxyHost, function() {
// 				clientSocket.write(
// 					'HTTP/1.1 200 Connection Established\r\n' +
// 					'Proxy-agent: Smart-Proxy\r\n' +
// 					'\r\n');
//
// 				proxySocket.write(head);
// 				proxySocket.pipe(clientSocket);
// 				clientSocket.pipe(proxySocket);
// 			});
//
// 			clientSocket.on('error', function(e) {
// 				console.error('socket error', e);
// 			});
// 		}
// 	}
// }
//
// module.exports = function(port){
// 	return new ConnectServer(port);
// };

// module.exports = function(proxyHost, proxyPort) {
// 	const serverHelper = serverHelperFactory();
// 	const port = serverHelper.normalizePort(process.env.CONNECT_PORT || 9001);
//
// 	const server = http.createServer();
// 	server.listen(port);
// 	server.on('connect', onConnect);
// 	server.on('error', serverHelper.onError);
// 	server.on('listening', serverHelper.onListening);
//
// 	function onConnect(req, clientSocket, head) {
// 		console.log('(CONNECT) Receiving reverse proxy request for:' + req.url);
//
// 		var proxySocket = net.connect(proxyPort, proxyHost, function() {
// 			clientSocket.write(
// 				'HTTP/1.1 200 Connection Established\r\n' +
// 				'Proxy-agent: Smart-Proxy\r\n' +
// 				'\r\n');
//
// 			proxySocket.write(head);
// 			proxySocket.pipe(clientSocket);
// 			clientSocket.pipe(proxySocket);
// 		});
//
// 		clientSocket.on('error', function(e) {
// 			console.error('socket error', e);
// 		});
// 	}
// };
