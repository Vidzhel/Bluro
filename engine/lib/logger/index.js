const logger = require("./logger");

module.exports = function initLogger(options) {
	options.dependencyResolver.registerDependency(logger, true, "Logger");
};
