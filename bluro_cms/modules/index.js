module.exports = function initModules(options) {
	const modulesToInit = ConfigsManager.getEntry("modules");

	// General
	options.modulesManager.startGeneralInit();
	options.modulesManager.connectRule("all", "/", cors, {
		sensitive: false,
	});
	options.modulesManager.endModuleInit();

	// Others
	for (const moduleName of modulesToInit) {
		const moduleRelativePath = "./" + moduleName;
		const module = require(moduleRelativePath);
		let modulePath = require.resolve(moduleRelativePath);
		// Get folder name without index.js
		modulePath = modulePath.substring(0, modulePath.lastIndexOf("\\"));

		options.modulesManager.startModuleInit(moduleName, modulePath);
		module(options);
		options.modulesManager.endModuleInit();

		Logger.logInfo(`Module ${moduleName} was initialized`, { prefix: "MODULES_MANAGER" });
	}
};

// General configs

function cors(req, res, data) {
	const cors = ConfigsManager.getEntry("cors");

	if (cors.allowedOrigins.length) {
		res.setHeader("Access-Control-Allow-Origin", cors.allowedOrigins.join(", "));
	}

	if (req.method === "OPTIONS") {
		if (cors.allowedHeaders.length) {
			res.setHeader("Access-Control-Allow-Headers", cors.allowedHeaders.join(", "));
		}

		if (cors.allowedMethods.length) {
			res.setHeader("Access-Control-Allow-Methods", cors.allowedMethods.join(", "));
		}

		if (cors.exposedHeaders.length) {
			res.setHeader("Access-Control-Expose-Headers", cors.exposedHeaders.join(", "));
		}

		if (cors.permissionAge) {
			res.setHeader("Access-Control-Max-Age", cors.permissionAge);
		}

		return true;
	}
}
