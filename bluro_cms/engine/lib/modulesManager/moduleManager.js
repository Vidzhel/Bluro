const Model = require("../database/model");

class ModuleManager {
	modules = [];
	general = {
		routes: [],
		rules: [],
	};
	currentModule = null;
	isGeneralInit = false;

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

	startGeneralInit() {
		this.currentModule = {
			routes: [],
			rules: [],
		};
		this.isGeneralInit = true;
	}

	endModuleInit() {
		if (this.currentModule === null) {
			throw new Error("You need to start the module initialization first");
		}
		if (!this.isGeneralInit) {
			this.modules.push(this.currentModule);
		} else {
			this.general = this.currentModule;
			this.isGeneralInit = false;
		}

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
	 * @param {"all"|"post"|"put"|"delete"|"get"|"options"|string[]} methods - HTTP methods
	 * @param {string} mountingPath - if an existing mounting point is specified, the previous
	 *     handler will be overwritten
	 * @param {routeHandler} handler
	 * @param {object} [options] - additional props that will be passed to route
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
	 *  NOTE: if handler specified with 4 parameters (error in the beginning) it will be defined as
	 *  error handler and won't be called except the situation when an exception was occurred in
	 * previous rules
	 *
	 *	If a rule returns true, further rules will be ignored
	 *
	 * @param {"all"|"post"|"put"|"delete"|"options"|"get"|string[]} methods - HTTP methods
	 * @param {string} mountingPath - if an existing mounting point is specified, the previous
	 *     handler will be overwritten
	 * @param {ruleHandler} handlers
	 * @param {object} [options]
	 * @param {boolean} options.sensitive
	 */
	connectRule(methods, mountingPath, handlers, options) {
		if (this.currentModule === null) {
			throw new Error("You need to start the module initialization first");
		}

		this.currentModule.rules.push({ methods, mountingPath, handlers, options });
	}
}

module.exports = ModuleManager;
