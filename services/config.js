'use strict';

const _ = require('lodash');

class Store {
	constructor(){
		this._config = {rules: {}};
		this._count = 0;
	}

	load(config) {
		const rules = _.reduce(config.rules, function(rules, item, index) {
			rules[index] = Object.assign({id: index}, item);
			return rules;
		}, {});

		this._config = {title: config.title, rules};
		this._count = config.rules.length;
	}

	getAllRules() {
		return _.map(this._config.rules);
	}

	getConfig(){
		return {
			title: this._config.title,
			rules: _.map(this._config.rules)
		};
	}

	add(ruleData){
		const index = this._count;
		const rule = Object.assign({id: index}, ruleData);
		this._config.rules[index] = rule;
		this._count++;

		return rule;
	}

	edit(id, params) {

	}

	remove(id){

	}
}

module.exports = function(){
	return new Store();
};
