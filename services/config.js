'use strict';

const uuid = require('uuid').v4;
const _ = require('lodash');

class Store {
	constructor(){
		this._config = {rules: {}};
	}

	load(config) {
		const rules = _.reduce(config.rules, function(rules, item) {
			rules[item.id] = item;
			return rules;
		}, {});

		this._config = {title: config.title, rules};
	}

	getAllRules() {
		return _.map(this._config.rules);
	}

	getConfig(){
		return {
			title: this._config.title,
			rules: _.chain(this._config.rules).orderBy('timestamp', ['desc']).value()
		};
	}

	add(ruleData){
		const id = uuid();
		const timestamp = Date.now();

		const rule = Object.assign({id, timestamp}, ruleData);
		this._config.rules[id] = rule;

		return rule;
	}

	remove(id){
		console.log(this._config);
		delete this._config.rules[id];
	}
}

module.exports = function(){
	return new Store();
};
