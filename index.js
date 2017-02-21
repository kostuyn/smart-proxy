'use strict';

const proxy = require('./handlers/proxy');
const api = require('./handlers/api');
const connectServer = require('./servers/connect-server');
const proxyServer = require('./servers/proxy-server');
const apiServer = require('./servers/api-server');

connectServer(8001, 'localhost', 9001);
proxyServer(9001, proxy);
apiServer(7001, api);
