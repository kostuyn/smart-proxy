'use strict';

const http = require('http');
const https = require('https');

exports.listenHttp = function(port, log) {
	const server = http.createServer();
	server.on('error', _onError(port, log));
	server.on('listening', _onListening(port, log));

	server.listen(port);

	return server;
};

exports.listenHttps = function(port, options, log) {
	const server = https.createServer(options);
	server.on('error', _onError(port, log));
	server.on('listening', _onListening(port, log));
	server.listen(port);

	return server;
};

exports.httpProxy = function(configService, log) {
	return function(req, res, callback) {
		callback = callback || function() {
			};

		const remoteHost = configService.getRemoteHost();
		const options = _createOptions(req, remoteHost);

		const proxyReq = http.request(options, function(response) {
			res.writeHead(response.statusCode, response.headers);
			response.pipe(res);
			callback(null, response);
		});

		req.pipe(proxyReq);

		proxyReq.on('error', function(error) {
			log.error('Http proxy', error);
		});
	}
};

exports.httpsProxy = function(configService, log) {
	return function(req, res, callback) {
		callback = callback || function() {
			};

		const remoteHost = configService.getRemoteHost();
		const options = _createOptions(req, remoteHost);

		log.info('PROXY', options.method, options.hostname + ':' + options.port + options.path);

		const proxyReq = https.request(options, function(response) {
			res.writeHead(response.statusCode, response.headers);
			response.pipe(res);
			callback(null, response);
		});

		req.pipe(proxyReq);

		proxyReq.on('error', function(error) {
			log.error('Https proxy', error);
		});
	}
};

function _createOptions(req, remoteHost) {
	const protocol = req.headers['x-forwarded-prot'] || 'https';
	const parsedHost = remoteHost || req.headers['x-forwarded-host'] || req.hostname;
	const splitHost = parsedHost.split(':');

	const hostName = splitHost[0];

	const port = parseInt(splitHost[1], 10) || (protocol == 'https' ? 443 : 80);

	return {
		hostname: hostName,
		port: port,
		path: req.url,
		method: req.method,
		headers: req.headers
	};
}

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
	return function() {
		var bind = 'port ' + port;
		log.info('Listening on ' + bind);
	}
}
