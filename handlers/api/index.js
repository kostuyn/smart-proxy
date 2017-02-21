'use strict';

const express = require('express');

module.exports = function(log){
	const app = express();

	app.use(function(req, res, next){
		log.info('Hello from API.');

		res.send('OK');
	});

	return app;
};
