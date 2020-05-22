const ModulesManager = require("./moduleManager");

module.exports = function initModules(options) {
	const modulesPath = options.root + "/modules";
	const modulesManager = options.dependencyResolver.registerDependency({
		dependency: ModulesManager,
		singleton: true,
		name: "ModulesManager",
	});
	options.modulesManager = modulesManager;

	require(modulesPath)(options);
	Logger.logInfo("Modules were initialized");
};
