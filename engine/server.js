const routeDispatcher = require("./lib/router/router");

const BYTE = "(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)";
const IP = `^(?:${BYTE}\\.){3}${BYTE}$`;
const PORT = `^(?:[1-9]|[1-5]?[0-9]{2,4}|6[1-4][0-9]{3}|65[1-4][0-9]{2}|655[1-2][0-9]|6553[1-5])$`;
const IP_REGEX = new RegExp(IP);
const PORT_REGEX = new RegExp(PORT);

class App {
	/**\
	 *
	 * @param options
	 * @param {string} options.host
	 * @param {number} options.port
	 * @param {boolean?} options.https - defines whether to use https protocol
	 */
	constructor(options) {
		this.dispatcher = new routeDispatcher();

		this.options = options;
		this.protocol = options.https ? require("https") : require("http");
		this._validateOptions();
		this.server = this.initServer();
	}

	_validateOptions() {
		const { host, port } = this.options;

		if (!(port && PORT_REGEX.test(port.toString()))) {
			throw new Error("Wrong port format was specified");
		}
		if (!(host && IP_REGEX.test(host))) {
			throw new Error("Wrong ip format was specified");
		}
	}

	initServer() {
		return this.protocol.createServer((req, res) => {
			this.dispatcher.dispatch(req, res);
			res.statusCode = 200;
			res.setHeader("Content-Type", "text/plain");
			res.end("Hello World");
		});
	}

	start() {
		const { host, https, port } = this.options;
		this.server.listen(port, host, () => {
			Logger.logInfo(`Server running at ${https ? "https" : "http"}://${host}:${port}/`);
		});
	}

	/**
	 * @callback ruleHandler
	 * @param {Error|null} error
	 * @param {Request} req
	 * @param {Response} res
	 * @param {object} data - the data that will be passed to a rule
	 */
	/**
	 *
	 * @param {"all"|"post"|"put"|"delete"|"get"} methods - HTTP methods
	 * @param {string} mountingPath - if an existing mounting point is specified, the previous
	 *     handler will be overwritten
	 * @param {ruleHandler} handlers
	 */
	addRule({ methods, mountingPath, handlers }) {
		this.dispatcher.defineRule(methods, mountingPath, handlers);
	}

	/**
	 * @callback routeHandler
	 * @param {Request} req
	 * @param {Response} res
	 * @param {object} data - the data that was evaluated by rules
	 */
	/**
	 *
	 * @param {"all"|"post"|"put"|"delete"|"get"} methods - HTTP methods
	 * @param {string} mountingPath - if an existing mounting point is specified, the previous
	 *     handler will be overwritten
	 * @param {routeHandler} handler
	 * @param {object?} options - additional props that will be passed to route
	 * controller, will be overwritten by the data that is filled by rules
	 */
	addRoute({ methods, mountingPath, handler, options = null }) {
		this.dispatcher.defineRoute(methods, mountingPath, handler, options);
	}
}

module.exports = App;
