'use strict';

const express = require('express');
const router = express.Router();

module.exports = function(configService, log){
	router.get('/rules', function(req, res){
		const config = configService.getConfig();
		res.send(config);
	});

	router.post('/rules', function(req, res) {
		log.info('Add rule:', req.body);
		const rule = configService.add(req.body.data);
		res.send(rule);
	});

	router.post('/upload', function(req, res){
		log.info('file:');
		log.info(req.body);

		configService.load(req.body);
		const config = configService.getConfig();
		res.send(config);
	});

	router.get('/download', function(req, res){
		const config = configService.getConfig();
		res.attachment('proxy-rules.json');
		res.send(JSON.stringify(config, null, '   '));
	});
	return router;
};

