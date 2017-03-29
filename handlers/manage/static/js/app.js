'use strict';

window.ee = new EventEmitter();

var UploadForm = React.createClass({
	getInitialState: function(){
		return {
			noFileUpload: true
		}
	},
	onSelectFile: function(e) {
		var file = e.target.files[0];
		if(!file){
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
					<button onClick={this.onUpload} disabled={this.state.noFileUpload} className="btn btn-success pull-right">Upload
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
			statusCodeIsEmpty: true
		};
	},
	onPathChange: function(e) {
		var isCorrectVal = e.target.value.trim().length > 0;
		this.setState({pathIsEmpty: !isCorrectVal});
	},
	onStatusCodeChange: function(e) {
		var isCorrectVal = /^\d{3}$/.test(e.target.value);
		this.setState({statusCodeIsEmpty: !isCorrectVal});
	},
	onAddRule: function(e) {
		e.preventDefault();

		var domMethod = ReactDOM.findDOMNode(this.refs.method);
		var domPath = ReactDOM.findDOMNode(this.refs.path);
		var domStatusCode = ReactDOM.findDOMNode(this.refs.statusCode);
		var rule = {
			data: {
				method: domMethod.value,
				path: domPath.value,
				statusCode: domStatusCode.value
			}
		};

		domPath.value = '';
		domStatusCode.value = '';

		this.setState({
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
						<select ref="method" className="form-control">
							<option selected="true">GET</option>
							<option>POST</option>
						</select>
					</div>
					<div className="form-group">
						<label>Path</label>
						<input onChange={this.onPathChange} ref="path" className="form-control"/>
					</div>
					<div className="form-group">
						<label>Status Code</label>
						<input onChange={this.onStatusCodeChange} ref="statusCode"
						       className="form-control"/>
					</div>

					<div className="form-group">
						<label>Headers</label>
						<HeaderForm></HeaderForm>
					</div>
					<div className="form-group">
						<label>Response Body</label>
						<textarea onChange={this.onStatusCodeChange} ref="responseBody"
						       className="form-control vresize" rows="5"></textarea>
					</div>
					<button
						disabled={this.state.pathIsEmpty || this.state.statusCodeIsEmpty}
						onClick={this.onAddRule}
						className="btn btn-success pull-right">
						Add
					</button>
				</div>
			</form>
		);
	}
});

var HeaderForm = React.createClass({
	render: function(){
		return (
			<div className="form-inline">
				<div className="form-group">
					<input onChange={this.onStatusCodeChange} ref="statusCode"
					       className="form-control" placeholder="Header"/>
				</div>
				<div className="form-group">
					<input onChange={this.onStatusCodeChange} ref="statusCode"
					       className="form-control" placeholder="Value"/>
				</div>
				<div className="form-group">
					<button className="btn btn-danger">
						Remove
					</button>
				</div>
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