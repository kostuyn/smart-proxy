# Smart Proxy
Proxy server for microservices mocking with browser management panel.
Makes fake response by request url or proxies to target url.

# Settings
|ENV|default|description|
|---|---|---|
|CONNECT_PORT | 8001| proxy connection port|
|HTTP_PROXY_PORT | 9001| http sniffer port|
|HTTPS_PROXY_PORT | 9002| https sniffer port|
|MANAGE_PORT | 7001| management panel port|

# How to use
```
const request = require('request');
...
const options = {url: targetUrl};             // options for request module

if(useProxy){                                 // flag if want using smart proxy
		const parsedUrl = url.parse(options.url);

		options.proxy = proxyUrl;             // smart proxy url http://localhost:8001
		options.tunnel = true;                // always tunneling request for http & https
		options.rejectUnauthorized = false;   // to avoid https self signed certificate error
		options.headers['X-Forwarded-Host'] = parsedUrl.host;
		options.headers['X-Forwarded-Prot'] = parsedUrl.protocol.slice(0, -1);  // removed ':' from end of string
	}

request(options, function(err, response){     // do request
  // do enything
});
...
```

# TODO
1. ~~fake content & headers~~
2. proxy modes
	* PROXY (return fake or proxy to target)
	* CAPTURE (write all target response to config)
	* PLAY (execute every rule only once)
	* MOCK (fake server - deirect request without proxying)
3. matching rules by:
	* query
	* params (/mypath/:params/entity)
	* content
4. more logs - method, headers, content, etc. (Enable/Disable)
5. send logs to UI (socket.io)
