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

	router.delete('/rules/:id', function(req, res){
		log.info('delete rule:', req.params.id);

		configService.remove(req.params.id);
		res.send();
	});

	router.post('/upload', function(req, res){
		log.info('config:', req.body);

		configService.load(req.body);
		const config = configService.getConfig();
		res.send(config);
	});

	router.get('/download', function(req, res){
		const config = configService.getConfig();

		res.attachment('proxy-config.json');
		res.send(JSON.stringify(config, null, '   '));
	});

	router.post('/rules/capture', function(req, res){
		log.info('start capture');
		
		configService.startCapture();
		res.send();
	});

	router.delete('/rules/capture', function(req, res){
		log.info('stop capture');

		configService.stopCapture();
		res.send();
	});

	return router;
};

