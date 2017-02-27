'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const apiRoute = require('./api');

module.exports = function(rulesService, log) {
	const app = express();
	app.disable('x-powered-by');
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());

	app.use('/', express.static(__dirname + '/static'));
	app.use('/api', apiRoute(rulesService, log));

	return app;
};
