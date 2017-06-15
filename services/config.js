'use strict';

const uuid = require('uuid').v4;
const _ = require('lodash');

const MODES = {
	PROXY: 'PROXY',
	CAPTURE: 'CAPTURE',
	DISABLE: 'DISABLE'
};

class Store {
	constructor() {
		this.modes = MODES;
		this._config = {rules: {}, mode: MODES.PROXY};
	}

	load(config) {
		const rules = _.reduce(config.rules, function(rules, item) {
			rules[item.id] = Object.assign({}, item, {count: 0});
			return rules;
		}, {});

		this._config = {title: config.title, mode: config.mode, rules};
	}

	getAllRules() {
		return _.chain(this._config.rules).orderBy('timestamp', ['desc']).value();
	}

	getConfig() {
		return {
			title: this._config.title,
			mode: this._config.mode,
			rules: _.chain(this._config.rules).orderBy('timestamp', ['desc']).value()
		};
	}

	add(ruleData) {
		const id = uuid();
		const timestamp = Date.now();

		const rule = Object.assign({id, timestamp, count: 0}, ruleData);
		this._config.rules[id] = rule;

		return rule;
	}

	edit(id, rule){
		const oldRule = this._config.rules[id];
		const newRule = Object.assign({}, oldRule, rule);

		this._config.rules[id] = newRule;

		return newRule;
	}

	remove(id) {
		delete this._config.rules[id];
	}

	clearRules(){
		this._config = Object.assign({}, this._config, {rules: {}});
		return this.getAllRules();
	}

	switchMode(mode){
		const modeName = MODES[mode] || MODES.PROXY;
		this._config.mode = modeName;
		
		return modeName;
	}

	getMode() {
		return this._config.mode;
	}

	getRemoteHost(){
		return process.env.REMOTE_HOST;
	}
}

module.exports = function() {
	return new Store();
};
