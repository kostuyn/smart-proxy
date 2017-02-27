'use strict';

const express = require('express');
const apiRoute = require('./api');

module.exports = function(log) {
	const app = express();
	app.disable('x-powered-by');
	
	app.use('/', express.static(__dirname + '/static'));
	app.use('/api', apiRoute(log));

	return app;
};
