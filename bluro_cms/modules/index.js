const path = require("path");

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
		modulePath = path.dirname(modulePath);

		options.modulesManager.startModuleInit(moduleName, modulePath);
		module(options);
		options.modulesManager.endModuleInit();

		Logger.logInfo(`Module ${moduleName} was initialized`, { prefix: "MODULES_MANAGER" });
	}
};

// General configs
function cors(req, res, data) {
	const allowedOrigins = ConfigsManager.getEntry("allowedOrigins");
	const allowCredentials = ConfigsManager.getEntry("allowCredentials");

	// Always required headers
	if (allowedOrigins) {
		if (
			typeof allowedOrigins[Symbol.iterator] === "function" &&
			typeof allowedOrigins !== "string"
		) {
			if (allowedOrigins.includes(req.headers["origin"])) {
				res.setHeader("Access-Control-Allow-Origin", req.headers["origin"]);
			}
		} else {
			if (allowedOrigins === req.headers["origin"]) {
				res.setHeader("Access-Control-Allow-Origin", req.headers["origin"]);
			}
		}
	}

	if (allowCredentials) {
		res.setHeader("Access-Control-Allow-Credentials", allowCredentials);
	}

	// Required on option method
	if (req.method === "OPTIONS") {
		const allowedHeaders = ConfigsManager.getEntry("allowedHeaders");
		const exposedHeaders = ConfigsManager.getEntry("exposedHeaders");
		const permissionAge = ConfigsManager.getEntry("permissionAge");
		const allowedMethods = ConfigsManager.getEntry("allowedMethods");

		if (allowedHeaders.length) {
			res.setHeader("Access-Control-Allow-Headers", allowedHeaders.join(", "));
		}

		if (allowedMethods.length) {
			res.setHeader("Access-Control-Allow-Methods", allowedMethods.join(", "));
		}

		if (exposedHeaders.length) {
			res.setHeader("Access-Control-Expose-Headers", exposedHeaders.join(", "));
		}

		if (permissionAge) {
			res.setHeader("Access-Control-Max-Age", permissionAge);
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
		data.files = {};
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
