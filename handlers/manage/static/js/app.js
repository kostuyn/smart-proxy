'use strict';

var SwitchMode = React.createClass({
	onSelect: function(e) {
		var curMode = e.target.value;
		if(this.props.mode == curMode) {
			return;
		}

		this.props.onChangeMode(curMode);
	},
	render: function() {
		return (
			<div className="panel panel-primary">
				<div className="panel-body">
					<div className="btn-group pull-right" data-toggle="buttons">
						<label
							className={'btn btn-primary ' + (this.props.mode == 'PROXY' ? 'active' : '')}>
							<input type="radio" name="options" value="PROXY"
							       onChange={this.onSelect}/>
							PROXY
						</label>
						<label
							className={'btn btn-primary ' + (this.props.mode == 'CAPTURE' ? 'active' : '')}>
							<input type="radio" name="options" value="CAPTURE"
							       onChange={this.onSelect}/>
							CAPTURE
						</label>
						<label
							className={'btn btn-primary ' + (this.props.mode == 'DISABLE' ? 'active' : '')}>
							<input type="radio" name="options" value="DISABLE"
							       onChange={this.onSelect}/>
							DISABLE
						</label>
					</div>
				</div>
			</div>
		);
	}
});

var UploadForm = React.createClass({
	getInitialState: function() {
		return {
			noFileUpload: true
		}
	},
	onSelectFile: function(e) {
		var file = e.target.files[0];
		if(!file) {
			return;
		}

		this.setState({
			file: file,
			noFileUpload: false
		});
	},
	onUpload: function(e) {
		e.preventDefault();

		var domFile = ReactDOM.findDOMNode(this.refs.file);
		domFile.value = '';

		this.props.onUploadRules(this.state.file);
		this.setState({
			noFileUpload: true
		});
	},
	render: function() {
		return (
			<form className="panel panel-primary">
				<div className="panel-heading">
					<h4 className="panel-title">Upload config</h4>
				</div>
				<div className="panel-body">
					<div className="form-group">
						<input onChange={this.onSelectFile} ref="file" type="file" accept=".json"
						       className="form-control"/>
					</div>
					<button onClick={this.onUpload} disabled={this.state.noFileUpload}
					        className="btn btn-success pull-right">Upload
					</button>
				</div>
			</form>
		);
	}
});

var RuleElement = React.createClass({
	onRemove: function(e) {
		this.props.onRemoveRule(this.props.rule.id);
	},
	onEdit: function(e) {
		this.props.onEditRule(this.props.rule);
	},
	render: function() {
		function prettyStr(str, length) {
			if(!str) {
				return;
			}

			if(str.length <= length) {
				return str;
			}

			var subStr = str.substr(0, length - 1);
			subStr += '...';
			return subStr;
		}

		var rule = this.props.rule;
		var index = this.props.index;
		return (
			<tr className={this.props.rule.isEdit ? 'warning': ''}>
				<td>{index}</td>
				<td>{rule.method}</td>
				<td>{rule.path}</td>
				<td>{rule.statusCode}</td>
				<td>{prettyStr(rule.response, 50)}</td>
				<td>
					<button onClick={this.onRemove}
					        disabled={this.props.rule.isEdit}
					        className="btn btn-danger">Remove
					</button>
					<button onClick={this.onEdit}
					        disabled={this.props.rule.isEdit}
					        className='btn btn-warning'>
						Edit
					</button>
				</td>
			</tr>
		);
	}
});

var RulesList = React.createClass({
	onRefresh: function() {
		this.props.onRefreshRules();
	},
	onClear: function(){
		this.props.onClearRules();
	},
	render: function() {
		var self = this;
		var rulesElements = this.props.rules.map(function(rule, index) {
			return (
				<RuleElement rule={rule}
				             index={index+1}
				             onEditRule={self.props.onEditRule}
				             onRemoveRule={self.props.onRemoveRule}/>
			);
		});

		return (
			<div className="panel panel-primary">
				<div className="panel-heading">
					<div className="panel-title">
						<h4>
							<small className="badge">{this.props.mode}</small>
							Rules list
							<small>
								<button onClick={this.onClear}
								        className="btn btn-danger pull-right">
									Clear
								</button>
								<button onClick={this.onRefresh}
								        className="btn btn-success pull-right">
									Refresh
								</button>
							</small>
						</h4>
					</div>
				</div>
				<div className="panel-body">
					<table className="table table-striped">
						<thead>
						<tr>
							<th>#</th>
							<th>Method</th>
							<th>Path</th>
							<th>StatusCode</th>
							<th>Body</th>
							<th>Action</th>
						</tr>
						</thead>
						<tbody>{rulesElements}</tbody>
					</table>
				</div>
			</div>
		);
	}
});

var RuleForm = React.createClass({
	getInitialState: function() {
		return {
			pathIsEmpty: true,
			statusCodeIsEmpty: true,
			headerError: false
		};
	},
	componentWillReceiveProps: function(nextProps) {
		var statusCodeIsCorrect = /^\d{3}$/.test(nextProps.rule.statusCode);
		var pathIsEmpty = nextProps.rule.path.length == 0;

		this.setState({
			pathIsEmpty: pathIsEmpty,
			statusCodeIsEmpty: !statusCodeIsCorrect
		});
	},
	onMethodChange: function(e) {
		this.props.onFieldChange('method', e.target.value);
	},
	onPathChange: function(e) {
		var value = e.target.value.trim();
		this.props.onFieldChange('path', value);
	},
	onStatusCodeChange: function(e) {
		this.props.onFieldChange('statusCode', e.target.value);
	},
	onResponseChange: function(e) {
		this.props.onFieldChange('response', e.target.value);
	},
	onHeaderChange: function(index, name, value) {
		var headers = _.cloneDeep(this.props.rule.headers);
		var headerError = _.some(headers, function(header, i) {
			return header.name == name && index != i;
		});
		var error = headerError || _.some(headers, function(header, i) {
				return header.error && index != i;
			});

		headers[index] = {name: name, value: value, error: headerError};

		this.props.onFieldChange('headers', headers);
		this.setState({headerError: error});
	},
	onHeaderRemove: function(index) {
		var headers = _.cloneDeep(this.props.rule.headers);
		headers.splice(index, 1);

		this.props.onFieldChange('headers', headers);
	},
	onHeaderAdd: function() {
		var headers = this.props.rule.headers.concat([{name: '', value: ''}]);
		this.props.onFieldChange('headers', headers);
	},
	onAddRule: function(e) {
		e.preventDefault();
		var ruleForm = this.props.rule;

		var headers = _.reduce(ruleForm.headers, function(obj, item) {
			if(!_.trim(item.name) || !_.trim(item.value)) {
				return obj;
			}

			obj[item.name] = item.value;
			return obj;
		}, {});

		var rule = {
			id: ruleForm.id,
			method: ruleForm.method,
			path: ruleForm.path,
			headers: headers,
			statusCode: ruleForm.statusCode,
			response: ruleForm.response
		};

		this.props.onAddRule(rule);
	},
	onUpdateRule: function(e) {
		e.preventDefault();
		var ruleForm = this.props.rule;

		var headers = _.reduce(ruleForm.headers, function(obj, item) {
			if(!_.trim(item.name) || !_.trim(item.value)) {
				return obj;
			}

			obj[item.name] = item.value;
			return obj;
		}, {});

		var rule = {
			id: ruleForm.id,
			method: ruleForm.method,
			path: ruleForm.path,
			headers: headers,
			statusCode: ruleForm.statusCode,
			response: ruleForm.response
		};

		this.props.onUpdateRule(rule);
	},
	onCancelEditRule: function(e) {
		e.preventDefault();
		this.props.onCancelEditRule(this.props.rule);
	},
	render: function() {
		var self = this;

		function getActions(rule) {
			if(rule.isEdit) {
				return (
					<div>
						<button
							onClick={self.onCancelEditRule}
							className="btn btn-danger pull-right">
							Cancel
						</button>
						<button
							disabled={self.state.pathIsEmpty || self.state.statusCodeIsEmpty || self.state.headerError}
							onClick={self.onUpdateRule}
							className="btn btn-success pull-right">
							OK
						</button>
					</div>
				);
			}

			return (
				<div>
					<button
						onClick={self.onCancelEditRule}
						className="btn btn-danger pull-right">
						Cancel
					</button>
					<button
						disabled={self.state.pathIsEmpty || self.state.statusCodeIsEmpty || self.state.headerError}
						onClick={self.onAddRule}
						className="btn btn-success pull-right">
						Add
					</button>
				</div>
			);
		}

		var actions = getActions(this.props.rule);

		return (
			<form className="panel panel-primary">
				<div className="panel-heading">
					<h4 className="panel-title">Add rule</h4>
				</div>
				<div className="panel-body">
					<div className="form-group">
						<label>Method</label>
						<select onChange={this.onMethodChange} value={this.props.rule.method}
						        ref="method"
						        className="form-control">
							<option>GET</option>
							<option>POST</option>
						</select>
					</div>
					<div className="form-group">
						<label>Path</label>
						<input onChange={this.onPathChange} value={this.props.rule.path} ref="path"
						       className="form-control"/>
					</div>
					<div className="form-group">
						<label>Status Code</label>
						<input onChange={this.onStatusCodeChange} value={this.props.rule.statusCode}
						       ref="statusCode"
						       className="form-control"/>
					</div>
					<HeadersList onHeaderChange={this.onHeaderChange}
					             onHeaderAdd={this.onHeaderAdd}
					             onHeaderRemove={this.onHeaderRemove}
					             headers={this.props.rule.headers}/>
					<div className="form-group">
						<label>Response Body</label>
						<textarea onChange={this.onResponseChange} value={this.props.rule.response}
						          className="form-control vresize" rows="5"/>
					</div>
					{actions}
				</div>
			</form>
		);
	}
});

var HeaderElement = React.createClass({
	onNameChange: function(e) {
		this.props.onHeaderChange(this.props.index, e.target.value, this.props.header.value);
	},
	onValueChange: function(e) {
		this.props.onHeaderChange(this.props.index, this.props.header.name, e.target.value);
	},
	onRemove: function(e) {
		this.props.onHeaderRemove(this.props.index);
	},
	render: function() {
		var self = this;

		function getAddButton(flag) {
			if(!flag) {
				return;
			}

			return (
				<div className="form-group">
					<button onClick={self.props.onHeaderAdd}
					        className="btn btn-success"
					        type="button">
						Add
					</button>
				</div>
			);
		}

		return (
			<div className="form-inline">
				<div className={'form-group ' + (this.props.header.error ? 'has-error': '')}>
					<input onChange={this.onNameChange} value={this.props.header.name}
					       className="form-control" placeholder="Name"/>
				</div>
				<div className="form-group">
					<input onChange={this.onValueChange} value={this.props.header.value}
					       className="form-control" placeholder="Value"/>
				</div>
				<div className="form-group">
					<button onClick={this.onRemove}
					        disabled={this.props.disableRemoveButton}
					        type="button"
					        className="btn btn-danger">
						Remove
					</button>
				</div>
				{getAddButton(this.props.needAddButton)}
			</div>
		);
	}
});

var HeadersList = React.createClass({
	onHeaderChange: function(index, name, value) {
		this.props.onHeaderChange(index, name, value);
	},
	render: function() {
		var self = this;
		var headerList = this.props.headers.map(function(header, index) {
			return (
				<HeaderElement onHeaderChange={self.onHeaderChange}
				               onHeaderRemove={self.props.onHeaderRemove}
				               onHeaderAdd={self.props.onHeaderAdd}
				               disableRemoveButton={self.props.headers.length == 1}
				               needAddButton={index==self.props.headers.length - 1}
				               header={header}
				               index={index}/>
			);
		});

		return (
			<div className="form-group">
				<label>Headers</label>
				{headerList}
			</div>
		);
	}
});

var App = React.createClass({
	getInitialState: function() {
		return {
			rules: [],
			mode: 'PROXY',
			ruleForm: {
				headers: [{name: '', value: ''}],
				method: 'GET',
				path: '',
				statusCode: '',
				response: ''
			}
		};
	},
	onRuleFormChange: function(fieldName, value) {
		var ruleForm = _.assign({}, this.state.ruleForm, {[fieldName]: value});
		this.setState({
			ruleForm: ruleForm
		});
	},
	onAddRule: function(rule) {
		var self = this;
		fetch('/api/rules', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(rule)
		})
			.then(function(response) {
				return response.json();
			})
			.then(function(rule) {
				self.setState({
					rules: [rule].concat(self.state.rules),
					ruleForm: {
						headers: [{name: '', value: ''}],
						method: 'GET',
						path: '',
						statusCode: '',
						response: ''
					}
				});
			})
			.catch(function(err) {
				console.error(err);
			});
	},
	onUpdateRule: function(rule) {
		var self = this;

		fetch('/api/rules/' + rule.id, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(rule)
		})
			.then(function(response) {
				return response.json();
			})
			.then(function(rule) {
				var newRule = _.assign({}, rule, {isEdit: false});
				var rules = _update(self.state.rules, rule.id, newRule);
				self.setState({
					rules: rules,
					ruleForm: {
						headers: [{name: '', value: ''}],
						method: 'GET',
						path: '',
						statusCode: '',
						response: ''
					}
				});
			})
			.catch(function(err) {
				console.error(err);
			});
	},
	onCancelEditRule: function(ruleForm) {
		var rules = _update(this.state.rules, ruleForm.id, {isEdit: false});

		this.setState({
			rules: rules,
			ruleForm: {
				headers: [{name: '', value: ''}],
				method: 'GET',
				path: '',
				statusCode: '',
				response: ''
			}
		});
	},
	onEditRule: function(rule) {
		var headers = _.map(rule.headers, function(value, key) {
			var header = {
				name: key,
				value: value
			};
			return header;
		});

		var rules = _update(this.state.rules, rule.id, {isEdit: true});
		rules = _update(rules, this.state.ruleForm.id, {isEdit: false});

		var ruleForm = _.assign({}, rule, {headers: headers, isEdit: true});

		this.setState({
			rules: rules,
			ruleForm: ruleForm
		});
	},
	onRemoveRule: function(id) {
		var self = this;
		fetch('/api/rules/' + id, {
			method: 'DELETE'
		})
			.then(function() {
				var rules = _.filter(self.state.rules, function(rule) {
					return rule.id != id;
				});

				self.setState({
					rules: rules
				});
			})
			.catch(function(err) {
				console.error(err);
			});
	},
	onUploadRules: function(file) {
		var self = this;
		fetch('/api/upload', {
			method: 'POST',
			body: file
		})
			.then(function(response) {
				return response.json();
			})
			.then(function(config) {
				self.setState({
					title: config.title,
					mode: config.mode,
					rules: config.rules,
					ruleForm: {
						headers: [{name: '', value: ''}],
						method: 'GET',
						path: '',
						statusCode: '',
						response: ''
					}
				});
			})
			.catch(function(err) {
				console.error(err);
			});
	},
	onChangeMode: function(mode) {
		var self = this;
		fetch('/api/mode', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({mode: mode})
		})
			.then(function() {
				self.getConfig();
			})
			.catch(function(err) {
				console.error(err);
			});
	},
	onRefreshRules: function() {
		this.getConfig();
	},
	onClearRules: function(){
		var self = this;

		fetch('/api/rules/', {
			method: 'DELETE'
		})
			.then(function(response) {
				return response.json();
			})
			.then(function(rules) {
				self.setState({
					rules: rules
				});
			})
			.catch(function(err) {
				console.error(err);
			});
	},
	getConfig: function() {
		var self = this;
		return fetch('/api/rules')
			.then(function(response) {
				return response.json();
			})
			.then(function(config) {
				self.setState({
					title: config.title,
					mode: config.mode,
					rules: config.rules,
					ruleForm: {
						headers: [{name: '', value: ''}],
						method: 'GET',
						path: '',
						statusCode: '',
						response: ''
					}
				});
			})
			.catch(function(err) {
				console.error(err);
			});
	},
	componentDidMount: function() {
		this.onRuleFormChange = this.onRuleFormChange.bind(this);
		this.onAddRule = this.onAddRule.bind(this);
		this.onUpdateRule = this.onUpdateRule.bind(this);
		this.onCancelEditRule = this.onCancelEditRule.bind(this);

		this.onEditRule = this.onEditRule.bind(this);
		this.onRemoveRule = this.onRemoveRule.bind(this);
		this.onRefreshRules = this.onRefreshRules.bind(this);
		this.onClearRules = this.onClearRules.bind(this);

		this.onUploadRules = this.onUploadRules.bind(this);
		this.onChangeMode = this.onChangeMode.bind(this);

		this.getConfig();
	},
	render: function() {
		return (
			<div>
				<h3>Proxy Server
					<small className="pull-right">
						<a href="/api/download">download config</a>
					</small>
				</h3>

				<SwitchMode onChangeMode={this.onChangeMode}
				            mode={this.state.mode}/>
				<UploadForm onUploadRules={this.onUploadRules}/>
				<RuleForm rule={this.state.ruleForm}
				          onFieldChange={this.onRuleFormChange}
				          onAddRule={this.onAddRule}
				          onUpdateRule={this.onUpdateRule}
				          onCancelEditRule={this.onCancelEditRule}/>
				<RulesList rules={this.state.rules}
				           mode={this.state.mode}
				           onEditRule={this.onEditRule}
				           onRemoveRule={this.onRemoveRule}
				           onRefreshRules={this.onRefreshRules}
				           onClearRules={this.onClearRules}/>
			</div>
		);
	}
});

ReactDOM.render(<App />, document.getElementById('root'));

function _update(items, id, assignProps) {
	if(!id) {
		return items;
	}

	var index = _.findIndex(items, function(item) {
		return item.id == id;
	});

	var item = items[index];

	var newItem = _.assign({}, item, assignProps);

	return items.slice(0, index).concat(newItem).concat(items.slice(index + 1));
}
