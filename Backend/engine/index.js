const { initLib } = require("./lib");
const App = require("./app");
const MigrationManager = require("./lib/database/migrationManager/migrationManager");

(async function initEngine() {
	const options = {};
	await initLib(options);
	Logger.logSuccess("Bluro was initialized");
	await startApp(options);
})();

async function startApp(options) {
	const configs = ConfigsManager.getEntry("app");
	const app = new App(configs);
	await connectModules(options.modulesManager, app);
	await app.start();
	Logger.logSuccess("Application started");
}

async function connectModules(modulesManager, app) {
	for (const module of modulesManager.modules) {
		await MigrationManager.makeMigration(module);
		await MigrationManager.applyMigration(module);
		module.routes.map(app.addRoute.bind(app));
		module.rules.map(app.addRule.bind(app));
	}
	Logger.logInfo("Modules were connected");
}
