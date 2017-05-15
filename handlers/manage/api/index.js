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

		const rule = configService.add(req.body);
		res.send(rule);
	});

	router.put('/rules/:id', function(req, res){
		log.info('edit rule:', req.body);

		const rule = configService.edit(req.params.id, req.body);
		res.send(rule);
	});
	
	router.delete('/rules/:id', function(req, res){
		log.info('delete rule:', req.params.id);

		configService.remove(req.params.id);
		res.send();
	});

	router.post('/upload', function(req, res){
		//log.info('config:', req.body); // to large response

		configService.load(req.body);
		const config = configService.getConfig();
		res.send(config);
	});

	router.get('/download', function(req, res){
		const config = configService.getConfig();

		res.attachment('proxy-config.json');
		res.send(JSON.stringify(config, null, '   '));
	});

	router.put('/mode', function(req, res){
		log.info('switch mode to', req.body.mode);
		
		var mode = configService.switchMode(req.body.mode);
		res.send({mode});
	});

	return router;
};

