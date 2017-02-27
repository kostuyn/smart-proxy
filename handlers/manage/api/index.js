'use strict';

const express = require('express');
const router = express.Router();

module.exports = function(log){
	router.get('/hello', function(req, res){
		log.info('Hello from API.');

		res.send('OK');
	});

	return router;
};