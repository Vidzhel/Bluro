const Model = require("../database/model");

class ModuleManager {
	modules = [];
	currentModule = null;

	startModuleInit(name, path) {
		/**
		 * @type {{routes: [], models: [], rules: []}}
		 */
		this.currentModule = {
			name,
			path,
			routes: [],
			rules: [],
			models: [],
		};
	}

	endModuleInit() {
		if (this.currentModule === null) {
			throw new Error("You need to start the module initialization first");
		}
		this.modules.push(this.currentModule);
		this.currentModule = null;
	}

	connectModel(model) {
		if (this.currentModule === null) {
			throw new Error("You need to start the module initialization first");
		}
		if (!(model.prototype instanceof Model)) {
			throw new TypeError("The given model has to be a subclass of Model class");
		}

		this.currentModule.models.push(model);
	}

	/**
	 *
	 * @param {"all"|"post"|"put"|"delete"|"get"} methods - HTTP methods
	 * @param {string} mountingPath - if an existing mounting point is specified, the previous
	 *     handler will be overwritten
	 * @param {routeHandler} handler
	 * @param {object?} options - additional props that will be passed to route
	 * controller, will be overwritten by the data that is filled by rules
	 */
	connectRoute(methods, mountingPath, handler, options = null) {
		if (this.currentModule === null) {
			throw new Error("You need to start the module initialization first");
		}

		this.currentModule.routes.push({ methods, mountingPath, handler, options });
	}

	/**
	 *
	 * @param {"all"|"post"|"put"|"delete"|"get"} methods - HTTP methods
	 * @param {string} mountingPath - if an existing mounting point is specified, the previous
	 *     handler will be overwritten
	 * @param {ruleHandler} handlers
	 */
	connectRule(methods, mountingPath, handlers) {
		if (this.currentModule === null) {
			throw new Error("You need to start the module initialization first");
		}

		this.currentModule.rules.push({ methods, mountingPath, handlers });
	}
}

module.exports = ModuleManager;
