'use strict';

const connectPort = process.env.CONNECT_PORT || 8001;
const httpProxyPort = process.env.HTTP_PROXY_PORT || 9001;
const httpsProxyPort = process.env.HTTPS_PROXY_PORT || 9002;
const managePort = process.env.MANAGE_PORT || 7001;

const proxyFactory = require('./handlers/proxy');
const manage = require('./handlers/manage');
const connectServer = require('./servers/connect-server');
const proxyServer = require('./servers/proxy-server');
const manageServer = require('./servers/manage-server');

const configServiceFactory = require('./services/config');

const configService = configServiceFactory();

connectServer(connectPort, 'localhost', httpProxyPort, httpsProxyPort);
proxyServer.http(httpProxyPort, proxyFactory, configService);
proxyServer.https(httpsProxyPort, proxyFactory, configService);
manageServer(managePort, manage, configService);
