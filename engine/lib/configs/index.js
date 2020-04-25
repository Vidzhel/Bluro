const manager = require("./ConfigsManager");

module.exports = function initConfigManager(options) {
	options.dependencyResolver.registerDependency(manager, true, "ConfigManager", options.root);
};
