'use strict';

window.ee = new EventEmitter();

var UploadForm = React.createClass({
	onSelectFile: function(e){
		this.setState({
			file: e.target.files[0]
		});
	},
	onUpload: function(e){
		ee.emit('uploadRules', this.state.file);
	},
	render: function(){
		return (
			<div>
				<div>
					<label>Upload</label>
					<input onChange={this.onSelectFile} ref="file" type="file" />
				</div>
				<div>
					<button onClick={this.onUpload}>Upload</button>
				</div>
			</div>
		);
	}
});

var RulesList = React.createClass({
	render: function() {
		var rulesTemplate = this.props.rules.map(function(rule) {
			return (
				<li key={rule.id}>{rule.data.method} {rule.data.path} {rule.data.statusCode}</li>
			);
		});

		return (
			<div>
				<ul>
					{rulesTemplate}
				</ul>
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
		var isCorrectVal = /^\d+$/.test(e.target.value);
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
			<div>
				<div>
					<label>Method</label>
					<select ref="method">
						<option selected="true">GET</option>
						<option>POST</option>
					</select>
				</div>
				<div>
					<label>Path</label>
					<input onChange={this.onPathChange} ref="path"/>
				</div>
				<div>
					<label>StatusCode</label>
					<input onChange={this.onStatusCodeChange} ref="statusCode"/>
				</div>
				<div>
					<button disabled={this.state.pathIsEmpty || this.state.statusCodeIsEmpty}
					        onClick={this.onAddRule}>Add
					</button>
				</div>
			</div>
		);
	}
});

var App = React.createClass({
	getInitialState: function() {
		return {rules: []};
	},
	componentDidMount: function() {
		var self = this;
		window.ee.on('uploadRules', function(file){
			console.log(file);
			fetch('/api/upload', {
				method: 'POST',
				body: file
			}).then(function(response) {
				return response.json();
			}).then(function(body){
				console.log(body);
				self.setState({
					rules: body
				});
			}).catch(function(err){
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
			}).then(function(res){
				self.setState({
					rules: [rule].concat(self.state.rules)
				});
			}).catch(function(err){
				console.log(err);
			});
		});
		fetch('/api/rules')
			.then(function(response) {
				return response.json();
			})
			.then(function(body) {
				self.setState({rules: body});
			});
	},
	render: function() {
		var rules = this.state.rules;
		return (
			<div>
				<h3>Proxy</h3>
				<a href="/api/download">download</a>
				<UploadForm />
				<RuleForm />
				<RulesList rules={rules} />
			</div>
		);
	}
});

ReactDOM.render(<App />, document.getElementById('root'));