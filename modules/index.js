module.exports = function initModules(options) {
	const modulesToInit = ConfigsManager.getEntry("modules");

	for (const moduleName of modulesToInit) {
		const modulePath = "./" + moduleName;
		const module = require(modulePath);
		options.modulesManager.startModuleInit(moduleName, require.resolve(modulePath));
		module(options);
		options.modulesManager.endModuleInit();

		Logger.logInfo(`Module ${moduleName} was initialized`);
	}
};
