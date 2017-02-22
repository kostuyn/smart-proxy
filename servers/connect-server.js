'use strict';

const url = require('url');
const net = require('net');
const serverFactory = require('./server-factory');

const log = console;

module.exports = function(port, proxyHost, httpProxyPort, httpsProxyPort) {
	const server = serverFactory.listenHttp(port, log);

	server.on('connect', onConnect);

	function onConnect(req, clientSocket, head) {
		log.info('(CONNECT) Receiving reverse proxy request for:' + req.url);

		const splitHost = req.url.split(':');
		const port = parseInt(splitHost[1], 10);
		const protocol = req.headers['x-forwarded-prot'] || (port == '443' ? 'https' : 'http');
		const proxyPort = protocol == 'https' ? httpsProxyPort : httpProxyPort;

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
