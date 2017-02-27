'use strict';

var App = React.createClass({
	render: function() {
		console.log('render');
		return (
			<div>
				<h3>Proxy</h3>
			</div>
		);
	}
});

ReactDOM.render(
	<App />,
	document.getElementById('root')
);