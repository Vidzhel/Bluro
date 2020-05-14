const { initLib } = require("./lib");
const App = require("./server");

(function initEngine() {
	const options = {};
	initLib(options);
	Logger.logSuccess("Bluro was initialized");
	startApp(options);
})();

function startApp(options) {
	const configs = ConfigsManager.getEntry("app");
	const app = new App(configs);
	connectModules(options.modulesManager, app);
	app.start();
}

function connectModules(modulesManager, app) {
	for (const module of modulesManager.modules) {
		module.routes.map(app.addRoute.bind(app));
		module.rules.map(app.addRule.bind(app));
	}
	Logger.logInfo("Modules were connected");
}
