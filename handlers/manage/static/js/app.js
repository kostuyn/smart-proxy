'use strict';

window.ee = new EventEmitter();

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

		ee.emit('uploadRules', this.state.file);

		this.setState({
			noFileUpload: true
		});
	},
	render: function() {
		return (
			<form className="panel panel-primary">
				<div className="panel-heading">
					<h4 class="panel-title">Upload config</h4>
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
		window.ee.emit('removeRule', this.props.rule.id);
	},
	render: function() {
		var rule = this.props.rule;
		var index = this.props.index;
		return (
			<tr>
				<td>{index}</td>
				<td>{rule.method}</td>
				<td>{rule.path}</td>
				<td>{rule.statusCode}</td>
				<td>
					<button onClick={this.onRemove} className="btn btn-danger">Remove</button>
				</td>
			</tr>
		);
	}
});

var RulesList = React.createClass({
	render: function() {
		var rulesElements = this.props.rules.map(function(rule, index) {
			return (
				<RuleElement rule={rule} index={index+1}/>
			);
		});

		return (
			<div className="panel panel-primary">
				<div className="panel-heading">
					<h4 class="panel-title">Rules list</h4>
				</div>
				<div className="panel-body">
					<table className="table table-striped">
						<thead>
						<tr>
							<th>#</th>
							<th>Method</th>
							<th>Path</th>
							<th>StatusCode</th>
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
			headerError: false,
			headers: [{name: '', value: ''}],
			method: 'GET'
		};
	},
	onMethodChange: function(e) {
		this.setState({method: e.target.value});
	},
	onPathChange: function(e) {
		var isCorrectVal = e.target.value.trim().length > 0;
		this.setState({
			path: e.target.value,
			pathIsEmpty: !isCorrectVal
		});
	},
	onStatusCodeChange: function(e) {
		var isCorrectVal = /^\d{3}$/.test(e.target.value);
		this.setState({
			statusCode: e.target.value,
			statusCodeIsEmpty: !isCorrectVal
		});
	},
	onHeaderChange: function(index, name, value) {
		var headers = _.cloneDeep(this.state.headers);
		var headerError = _.some(headers, function(header, i) {
			return header.name == name && index != i;
		});
		var error = headerError || _.some(headers, function(header, i) {
				return header.error && index != i;
			});

		headers[index] = {name: name, value: value, error: headerError};
		this.setState({headers: headers, headerError: error});
	},
	onHeaderRemove: function(index) {
		var headers = _.cloneDeep(this.state.headers);
		headers.splice(index, 1);
		this.setState({headers: headers});
	},
	onHeaderAdd: function() {
		this.setState({
			headers: this.state.headers.concat([{name: '', value: ''}])
		});
	},
	onAddRule: function(e) {
		e.preventDefault();

		var headers = _.reduce(this.state.headers, function(obj, item) {
			if(!_.trim(item.name) || !_.trim(item.value)){
				return obj;
			}

			obj[item.name] = item.value;
			return obj;
		}, {});

		var rule = {
			data: {
				method: this.state.method,
				path: this.state.path,
				headers: headers,
				statusCode: this.state.statusCode
			}
		};

		this.setState({
			method: 'GET',
			path: '',
			statusCode: '',
			headers: [{name: '', value: ''}],
			pathIsEmpty: true,
			statusCodeIsEmpty: true
		});

		window.ee.emit('addRule', rule);
	},
	render: function() {
		return (
			<form className="panel panel-primary">
				<div className="panel-heading">
					<h4 class="panel-title">Add rule</h4>
				</div>
				<div className="panel-body">
					<div className="form-group">
						<label>Method</label>
						<select onChange={this.onMethodChange} value={this.state.method}
						        ref="method"
						        className="form-control">
							<option>GET</option>
							<option>POST</option>
						</select>
					</div>
					<div className="form-group">
						<label>Path</label>
						<input onChange={this.onPathChange} value={this.state.path} ref="path"
						       className="form-control"/>
					</div>
					<div className="form-group">
						<label>Status Code</label>
						<input onChange={this.onStatusCodeChange} value={this.state.statusCode}
						       ref="statusCode"
						       className="form-control"/>
					</div>
					<HeadersList onHeaderChange={this.onHeaderChange}
					             onHeaderAdd={this.onHeaderAdd}
					             onHeaderRemove={this.onHeaderRemove}
					             headers={this.state.headers}/>
					<div className="form-group">
						<label>Response Body</label>
						<textarea onChange={this.onStatusCodeChange} ref="responseBody"
						          className="form-control vresize" rows="5"/>
					</div>
					<button
						disabled={this.state.pathIsEmpty || this.state.statusCodeIsEmpty || this.state.headerError}
						onClick={this.onAddRule}
						className="btn btn-success pull-right">
						Add
					</button>
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

		console.log('HeaderElement');
		console.log(this.props.header.name, this.props.header.value);
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
		return {config: {rules: []}};
	},
	componentDidMount: function() {
		var self = this;
		window.ee.on('uploadRules', function(file) {
			fetch('/api/upload', {
				method: 'POST',
				body: file
			})
				.then(function(response) {
					return response.json();
				})
				.then(function(config) {
					self.setState({
						config: config
					});
				})
				.catch(function(err) {
					console.log(err);
				});
		});
		window.ee.on('addRule', function(rule) {
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
						config: {
							rules: [rule].concat(self.state.config.rules)
						}
					});
				})
				.catch(function(err) {
					console.log(err);
				});
		});
		window.ee.on('removeRule', function(id) {
			fetch('/api/rules/' + id, {
				method: 'DELETE'
			})
				.then(function() {
					var rules = [];
					self.state.config.rules.forEach(function(rule) {
						if(rule.id == id) {
							return;
						}

						rules.push(rule);
					});

					self.setState({
						config: {
							rules: rules
						}
					});
				})
				.catch(function(err) {
					console.log(err);
				});
		});
		fetch('/api/rules')
			.then(function(response) {
				return response.json();
			})
			.then(function(config) {
				self.setState({config: config});
			})
			.catch(function(err) {
				console.log(err);
			});
	},
	render: function() {
		var rules = this.state.config.rules;
		return (
			<div>
				<h3>Proxy Server
					<small className="pull-right"><a href="/api/download">download config</a>
					</small>
				</h3>

				<UploadForm />
				<RuleForm />
				<RulesList rules={rules}/>
			</div>
		);
	}
});

ReactDOM.render(<App />, document.getElementById('root'));
