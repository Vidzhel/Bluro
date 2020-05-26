const dependencyResolver = require("./iocContainer/DependencyResolver");
const initConfig = require("./configs");

module.exports.initLib = async function (options = {}) {
	options.dependencyResolver = dependencyResolver;

	initConfig(options);

	const initFileManager = require("./fileManager");
	const loggerInit = require("./logger");
	const initDialect = require("./database");

	initFileManager(options);
	loggerInit(options);
	await initDialect(options);

	const initModules = require("./modulesManager");
	initModules(options);
};
