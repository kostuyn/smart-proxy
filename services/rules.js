'use strict';

const Route = require('route-parser');
const _ = require('lodash');

class Store {
	constructor(){
		this._rules = {};
		this._rulesArr = {};
	}

	load(config) {
		const self = this;
		self._rules = {};

		config.forEach(function(item, index) {
			self._rules[index] = {
				id: index,
				route: new Route(item.path),
				data: item
			};
		});

		this._rulesArr = _.map(this._rules);
	}

	getAll() {
		return this._rulesArr;
	}

	edit(id, params) {

	}

	remove(id){

	}
}

module.exports = function(){
	return new Store();
};
