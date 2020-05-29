const User = require("./User");
const controllers = require("./controllers");

module.exports = function initAuth(options) {
	const manager = options.modulesManager;
	DependencyResolver.registerType({ dependency: controllers.requireAuthorizationRule });

	manager.connectModel(User);

	manager.connectRule("all", "/", controllers.authRule, { sensitive: false });
	manager.connectRule(
		["put", "delete"],
		"/profiles/{verbose}",
		controllers.requireAuthorizationRule,
	);

	manager.connectRoute("post", "/login", controllers.loginController);
	manager.connectRoute("post", "/signup", controllers.signupController);

	manager.connectRoute("get", "/profiles", controllers.getProfilesController);
	manager.connectRoute("get", "/profiles/{verbose}", controllers.getProfileController);
	manager.connectRoute("put", "/profiles/{verbose}", controllers.updateProfileController);
	manager.connectRoute("delete", "/profiles/{verbose}", controllers.deleteProfileController);
};
