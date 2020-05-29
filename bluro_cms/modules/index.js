module.exports = function initModules(options) {
	const modulesToInit = ConfigsManager.getEntry("modules");

	// General
	options.modulesManager.startGeneralInit();
	options.modulesManager.connectRule("all", "/", cors, {
		sensitive: false,
	});
	options.modulesManager.connectRule("all", "/", receivedDataHandler, {
		sensitive: false,
	});
	options.modulesManager.connectRoute("get", "/files/{module}/{type}/{item}", serveContent, {
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

	// Always required headers
	if (cors.allowedOrigins.length) {
		res.setHeader("Access-Control-Allow-Origin", cors.allowedOrigins.join(", "));
	}

	if (cors.allowCredentials) {
		res.setHeader("Access-Control-Allow-Credentials", cors.allowCredentials);
	}

	// Required on option method
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

function receivedDataHandler(req, res, data) {
	if (req.isFromReq) {
		data.files = {};
		data.reqData = {};

		for (const [fieldName, field] of Object.entries(req.formData)) {
			if (field.type === "FILE") {
				data.files[fieldName] = field.val;
			} else {
				data.reqData[fieldName] = field.val;
			}
		}
	} else {
		data.reqData = req.json();
	}
}

async function serveContent(req, res, data) {
	const module = data.params.module;
	const type = data.params.type;
	const item = data.params.item;
	const relPath = `${module}/${type}/${item}`;

	const exists = await FilesManager.resourceExists(relPath, false);
	if (exists) {
		await res.setFile(FilesManager.getFilePath(relPath, false));
	} else {
		res.code(res.CODES.NotFound);
		res.error("Resource wasn't found");
	}
}
