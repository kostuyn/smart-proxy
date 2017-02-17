'use strict';

// var http = require('http'),
// 	https = require('https'),
// 	httpProxy = require('http-proxy');
// // //
// // // Create your proxy server and set the target in the options.
// // //
// // var proxy = httpProxy.createProxyServer({target:'http://localhost:9000'}); // See (†)
// // proxy.listen(8111);
// //
// //
// //
// //
// // Create your target server
// //
// http.createServer(function (req, res) {
// 	console.log('Success!!!');
// 	console.log(JSON.stringify(req.headers, true, 2));
// 	res.writeHead(200, { 'Content-Type': 'text/plain' });
// 	res.write('request successfully proxied!' + '\n' + JSON.stringify(req.headers, true, 2));
// 	res.end();
// }).listen(9000);
//
//
// //
// // Create a proxy server with custom application logic
// //
// var proxy = httpProxy.createProxyServer({});
//
// //
// // Create your custom server and just call `proxy.web()` to proxy
// // a web request to the target passed in the options
// // also you can use `proxy.ws()` to proxy a websockets request
// //
// var server = http.createServer(function(req, res) {
// 	// You can define here your custom logic to handle the request
// 	// and then proxy the request.
// 	console.log('This is Proxy1!' +  JSON.stringify(req.headers, true, 2));
// 	proxy.web(req, res, { target: 'http://127.0.0.1:9000' });
// });
//
// server.on('connect', function(req, cltSocket, head){
// 	console.log('This is Proxy1!' +  JSON.stringify(req.headers, true, 2));
// 	proxy.web(req, res, { target: 'http://127.0.0.1:9000' });
// });
//
// console.log("listening on port 8111");
// server.listen(8111);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var http = require('http'),
	https = require('https'),
	net = require('net'),
	httpProxy = require('http-proxy'),
	url = require('url'),
	request = require('request'),
	fs = require('fs');

console.log(__dirname);

const httpsOptions = {
	key: fs.readFileSync(__dirname + '/localhost.key'),
	cert: fs.readFileSync(__dirname + '/localhost.cert')
};



var proxy = httpProxy.createServer();

var server = http.createServer(function(req, res) {
	console.log('Receiving reverse proxy request for:' + req.url);
	//console.log(JSON.stringify(req.headers, null, '   '));
	var serverUrl = url.parse(req.url);
	const remoteUrl = url.format({
		protocol: serverUrl.protocol,
		hostname: serverUrl.hostname,
		port: serverUrl.port
	});
	console.log(remoteUrl);
	console.log(req.body);
	proxy.web(req, res, {target: remoteUrl, secure: false});
}).listen(8111, 'localhost', () => {

	var srv2 = https.createServer(httpsOptions, function(req, res) {
		console.log('Proxy http srv2:' + req.url);
		console.log(JSON.stringify(req.headers, null, '   '));
		var serverUrl = url.parse(req.url);
		const remoteUrl = url.format({
			protocol: 'https',
			hostname: req.headers.host,
			port: 443
		});
		console.log(remoteUrl);


		var body = [];
		req.on('data', function(chunk) {
			body.push(chunk);
		}).on('end', function() {
			body = Buffer.concat(body).toString();
			console.log('rec');
			console.log(body);
			// at this point, `body` has the entire request body stored in it as a string
		});


		proxy.web(req, res, {target: remoteUrl, secure: false}, function(){
			console.log('arguments');
			console.log(arguments);
			console.log('arguments');
		});
	}).listen(8100, 'localhost', () => {

// ********************************************* CLIENT REQUEST *********************************************
		request({
			//url:'https://ott.local/_api/conditions/getBundleConditions/?type=bundles_presearch',
			url: 'https://module.sletat.ru/Main.svc/GetTourOperators?townFromId=1264&countryId=40',
			//url: 'https://ott.local/_api/searching/startSync2/?route=2705IEVLON3005&ad=1&cn=0&in=0&cs=E&currency=RUB&source=Spasibo&showProfitParts=true',
			proxy: 'http://localhost:8111',
			tunnel: true
		}, function(err, response){
			if(err){
				return console.log(err);
			}

			console.log('Client!!!!!!!!!!');
			console.log(response.body);
		});
// ********************************************* CLIENT REQUEST *********************************************

	});

	// srv2.on('connection', function(socket){
	// 	console.log('srv2 connection');
	// 	// socket.pipe(process.stdout);
	// });
	//
	// srv2.on('connect', function(req, socket, head) {
	// 	console.log('Proxy CONNECT server:' + req.url);
	// 	console.log(req.headers);
	// 	console.log(req.method);
	//
	// 	var srvSocket = net.connect(8100, 'localhost', function() {
	// 		socket.write('HTTP/1.1 200 Connection Established\r\n' +
	// 			'Proxy-agent: Node-Proxy\r\n' +
	// 			'\r\n');
	//
	// 		srvSocket.write(head);
	// 		srvSocket.pipe(socket);
	// 		socket.pipe(srvSocket);
	// 		//
	// 		//socket.pipe(process.stdout);
	// 	});
	// });
	//
	// srv2.on('error', function(e){
	// 	console.log('srv2 error', e);
	// });

});

server.on('connect', function(req, socket, head) {
	console.log('(CONNECT) Receiving reverse proxy request for:' + req.url);
	console.log(req.headers);
	console.log(req.method);
	// console.log(head);

	var serverUrl = url.parse('https://' + req.url);
	// console.log(serverUrl);

	//socket.pipe(process.stdout);
	// socket.on('data', (chunk) => {
	// 	console.log(chunk.toString());
	// });

	// var srvSocket = net.connect(serverUrl.port, serverUrl.hostname, function() {
	var srvSocket = net.connect(8100, 'localhost', function() {
		socket.write('HTTP/1.1 200 Connection Established\r\n' +
			'Proxy-agent: Node-Proxy\r\n' +
			'\r\n');

		srvSocket.write(head);
		srvSocket.pipe(socket);
		socket.pipe(srvSocket);
		//
		// socket.pipe(process.stdout);
	});
	//
	// srvSocket.on('error', function(e){
	// 	console.log('srvSocket error', e);
	// });

	socket.on('error', function(e){
		console.log('socket error', e);
	});
});

server.on('error', function(e){
	console.log('server error', e);
});


