'use strict';

const proxyFactory = require('./handlers/proxy');
const manage = require('./handlers/manage');
const connectServer = require('./servers/connect-server');
const proxyServer = require('./servers/proxy-server');
const manageServer = require('./servers/manage-server');

const config = require('./config.json');
const rulesFactory = require('./services/rules');

const rulesService = rulesFactory();
rulesService.load(config);

const httpProxyPort = 9001;
const httpsProxyPort = 9002;

connectServer(8001, 'localhost', httpProxyPort, httpsProxyPort);
proxyServer.http(httpProxyPort, proxyFactory, rulesService);
proxyServer.https(httpsProxyPort, proxyFactory, rulesService);
manageServer(7001, manage, rulesService);


const request = require('request');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
setTimeout(function() {
	request({
		//url:'https://ott.local/_api/conditions/getBundleConditions/?type=bundles_presearch',
		url: 'https://module.sletat.ru/Main.svc/GetTourOperators?townFromId=1264&countryId=40',
		//url: 'https://ott.local/_api/searching/startSync2/?route=2705IEVLON3005&ad=1&cn=0&in=0&cs=E&currency=RUB&source=Spasibo&showProfitParts=true',
		proxy: 'http://localhost:8001',
		proxyHeaderWhiteList: ['X-Forwarded-Host', 'X-Forwarded-Prot'],
		tunnel: true,
		headers: {
			host: 'bla-bla',
			'X-Forwarded-Host': 'module.sletat.ru',
			'X-Forwarded-Prot': 'https'
		}
	}, function(err, response) {
		if(err) {
			return console.log(err);
		}

		console.log('Client!!!!!!!!!!');
		console.log(response.body);
	});
}, 500);
