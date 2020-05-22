const User = require("./User");
const controllers = require("./controllers");
const authRule = require("./authRule");

module.exports = function initAuth(options) {
	const manager = options.modulesManager;

	manager.connectModel(User);

	manager.connectRule("all", "/", authRule);

	manager.connectRoute(["post", "get"], "/login", controllers.loginPage);
	manager.connectRoute(["post", "get"], "/signup", controllers.signupPage);
};
