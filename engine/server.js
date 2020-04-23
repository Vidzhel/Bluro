const routeDispatcher = require("./lib/router/router");

class Server {
	constructor() {
		this.dispatcher = new routeDispatcher();
	}

	listen(port = null) {
		const http = require("http");
		let hostname = "127.0.0.1";
		port = 8080;

		const server = http.createServer((req, res) => {
			this.dispatcher.dispatch(req, res);
			res.statusCode = 200;
			res.setHeader("Content-Type", "text/plain");
			res.end("Hello World");
		});

		server.listen(port, hostname, () => {
			console.log(`Server running at http://${hostname}:${port}/`);
		});
	}

	// TODO delete and replace with auto loading from file
	addRule(methods, mountingPath, handlers) {
		this.dispatcher.defineRule(methods, mountingPath, handlers);
	}

	addRoute(methods, mountingPath, handler) {
		this.dispatcher.defineRoute(methods, mountingPath, handler);
	}
}

module.exports = Server;

// App.use(methods, mp, processor|controller)
//		.use(...)
// App.get(handler)
// 	   .post(handler)
