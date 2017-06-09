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
|REMOTE_HOST | undefined | set target remote host (override 'X-Forwarded-Host') |

# How to use
## Direct mode
You can do request direct to the Proxy. Set REMOTE_HOST and request "https://{proxy_host}:{HTTPS_PROXY_PORT}/{path}"
```
HTTPS_PROXY_PORT=myrestapi.com npm start
```

Do request to Smart-Proxy, all requests will proxying to the target REMOTE_HOST or return fake response
```
curl https://localhost:9002/rest_api_path?foo=bar --insecure
```

## Proxy mode
You can use Smart-Proxy as proxy. Add this code to your app
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

Start Smart-Proxy
```
npm start
```

Do request to your app, all requests will go through Smart-Proxy
```
curl http://myrestapi.com/rest_api_path?foo=bar
```

# TODO
1. common:
    * ~~add rule~~
    * ~~remove rule~~
    * ~~edit rule~~
    * ~~fake response & headers~~
2. proxy modes
	* ~~PROXY (return fake response or proxy to target)~~
	* ~~CAPTURE (write all target responses to config)~~
	* PLAY (execute every rule only once, in series by timestamp)
	* ~~MOCK (fake server - direct request to proxy)~~ NOTE: while via REMOTE_HOST env
3. matching rules by:
    * ~~path~~
	* query
	* params (/mypath/:params/entity)
	* content
4. more logs - method, headers, content, etc. (Enable/Disable)
5. send logs to UI (socket.io)
6. socket proxy
