module.exports = function initModules(options) {
	const modulesToInit = ConfigsManager.getEntry("modules");

	for (const moduleName of modulesToInit) {
		const moduleRelativePath = "./" + moduleName;
		const module = require(moduleRelativePath);
		let modulePath = require.resolve(moduleRelativePath);
		// Get folder name without index.js
		modulePath = modulePath.substring(0, modulePath.lastIndexOf("\\"));

		options.modulesManager.startModuleInit(moduleName, modulePath);
		module(options);
		options.modulesManager.endModuleInit();

		Logger.logInfo(`Module ${moduleName} was initialized`);
	}
};
