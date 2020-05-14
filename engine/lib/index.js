const dependencyResolver = require("./iocContainer/DependencyResolver");
const initConfig = require("./configs");

module.exports.initLib = function (options = {}) {
	options.dependencyResolver = dependencyResolver;

	initConfig(options);

	const loggerInit = require("./logger");
	const initDialect = require("./database");

	loggerInit(options);
	initDialect(options);

	const initModules = require("./modulesManager");
	initModules(options);
};
