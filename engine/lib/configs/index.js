const manager = require("./ConfigsManager");

module.exports = function initConfigManager(options) {
	options.dependencyResolver.registerDependency({
		dependency: manager,
		singleton: true,
		setAsGlobal: true,
		name: "ConfigsManager",
	});

	options.root = ConfigsManager.getEntry("root");
};
