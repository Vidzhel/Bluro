const Article = require("./Article");
// const controllers = require("./controllers");

module.exports = function initAuth(options) {
	const manager = options.modulesManager;

	manager.connectModel(Article);
};
