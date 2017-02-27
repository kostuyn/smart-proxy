'use strict';

const express = require('express');
const router = express.Router();

module.exports = function(rulesService, log){
	router.get('/rules', function(req, res){
		const rules = rulesService.getAll();
		res.send(rules);
	});

	router.post('/rules', function(req, res) {
		log.info('Add rule:', req.body);
		rulesService.add(req.body.data);
		res.send();
	});

	return router;
};
