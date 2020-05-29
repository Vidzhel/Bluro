const dependencyResolver = require("./iocContainer/DependencyResolver");
const initConfig = require("./configs");

module.exports.initLib = async function (options = {}) {
	options.dependencyResolver = dependencyResolver;

	initConfig(options);

	const initFilesManager = require("./filesManager");
	const loggerInit = require("./logger");
	const initDialect = require("./database");

	initFilesManager(options);
	loggerInit(options);
	await initDialect(options);

	const initModules = require("./modulesManager");
	initModules(options);
};
