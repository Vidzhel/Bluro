const logger = require("./logger");

module.exports = function initLogger(options) {
	/**
	 * @type {logger}
	 * @global
	 */
	global.Logger = null;

	options.dependencyResolver.registerDependency({
		dependency: logger,
		setAsGlobal: true,
		singleton: true,
		name: "Logger",
	});
	return logger;
};
