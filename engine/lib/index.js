const dependencyResolver = require("./iocContainer/DependencyResolver");
const configsInit = require("./configs");
const loggerInit = require("./logger");

module.exports = function intLib(options) {
	options.dependencyResolver = dependencyResolver;

	configsInit(options);
	loggerInit(options);
};
