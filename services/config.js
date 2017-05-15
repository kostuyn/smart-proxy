'use strict';

const uuid = require('uuid').v4;
const _ = require('lodash');

const MODES = {
	PROXY: 'PROXY',
	CAPTURE: 'CAPTURE',
	PLAY: 'PLAY',
	MOCK: 'MOCK'
};

class Store {
	constructor() {
		this.modes = MODES;
		this._config = {rules: {}, mode: MODES.PROXY};
	}

	load(config) {
		const rules = _.reduce(config.rules, function(rules, item) {
			rules[item.id] = item;
			return rules;
		}, {});

		this._config = {title: config.title, mode: config.mode, rules};
	}

	getAllRules() {
		return _.map(this._config.rules);
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

		const rule = Object.assign({id, timestamp}, ruleData);
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

	switchMode(mode){
		this._config.mode = MODES[mode] || MODES.PROXY;
	}

	getMode() {
		return this._config.mode;
	}
}

module.exports = function() {
	return new Store();
};
