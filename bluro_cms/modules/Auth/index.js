const User = require("./User");
const controllers = require("./controllers");

module.exports = function initAuth(options) {
	const manager = options.modulesManager;

	manager.connectModel(User);

	manager.connectRule("all", "/", controllers.authRule, {sensitive: false});

	manager.connectRoute(["post", "get"], "/login", controllers.loginPage);
	manager.connectRoute(["post", "get"], "/signup", controllers.signupPage);
};
