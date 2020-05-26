const routeDispatcher = require("./lib/router/router");
const extendRequest = require("./lib/HTTP/extendRequest");
const extendResponse = require("./lib/HTTP/extendResponse");

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

		if (!(
			port && PORT_REGEX.test(port.toString())
		)) {
			throw new Error("Wrong port format was specified");
		}
		if (!(
			host && IP_REGEX.test(host)
		)) {
			throw new Error("Wrong ip format was specified");
		}
	}

	initServer() {
		return this.protocol.createServer((req, res) => {
			try {
				Logger.logInfo(`Request received: ${req.url} (${req.method})`, {
					config: "requests", prefix: "REQUEST",
				});
				extendRequest(req);
				extendResponse(res);

				req.onData(async () => {
					await this.handleData(req, res);
				});
			} catch (e) {
				this.handleError(res, e);
			}
		});
	}

	async handleData(req, res) {
		res.setHeader("Content-Type", "application/json");

		await this.dispatcher.dispatch(req, res);
		res.send();

		Logger.logSuccess(`Request handled: ${req.url} (${req.method})`, {
			config: "requests", prefix: "REQUEST",
		});
	}

	handleError(res, e) {
		res.code(res.CODES.InternalError);
		res.send();

		Logger.logError(`Request handled with error '${e.name}': ${req.url} (${req.method})`, {
			config: "requests", prefix: "REQUEST",
		});
		Logger.logError("Request handled with error", {
			error: e, config: "errors", prefix: "Unhandled error",
		});
	}

	start() {
		return new Promise((resolve) => {
			const {host, https, port} = this.options;
			this.server.listen(port, host, () => {
				Logger.logInfo(`Server running at ${https ? "https" : "http"}://${host}:${port}/`);
				resolve();
			});
		});
	}

	/**
	 *  NOTE: if handler specified with 4 parameters (error in the beginning) it will be defined as
	 *  error handler and won't be called except the situation when an exception was occurred in
	 * previous rules
	 *
	 * @callback ruleHandler
	 * @param {Error|null} [error]
	 * @param {Request} req
	 * @param {Response} res
	 * @param {object} data - the data that will be passed to a rule
	 */

	/**
	 *  NOTE: if handler specified with 4 parameters (error in the beginning) it will be defined as
	 *  error handler and won't be called except the situation when an exception was occurred in
	 *  previous rules
	 *
	 *  If Handler returns true, further rules will be ignored
	 * @param {"all"|"post"|"put"|"delete"|"get"} methods - HTTP methods
	 * @param {string} mountingPath - if an existing mounting point is specified, the previous
	 *     handler will be overwritten
	 * @param {ruleHandler} handlers
	 * @param {object} options
	 */
	addRule({ methods, mountingPath, handlers, options }) {
		this.dispatcher.defineRule(methods, mountingPath, handlers, options);
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
