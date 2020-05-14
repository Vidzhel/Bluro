const logger = require("./logger");

module.exports = function initLogger(options) {
	options.dependencyResolver.registerDependency({
		dependency: logger,
		setAsGlobal: true,
		singleton: true,
		name: "Logger",
	});

	function logGlobalErr(err) {
		const msg = `Fatal error occurred ${err}`;
		Logger.logCritical(msg, { error: err, config: "errors", prefix: "Unhandled error" });
	}

	process.on("uncaughtException", logGlobalErr);
	process.on("unhandledRejection", logGlobalErr);

	Logger.logInfo("Initialized logger");
};
