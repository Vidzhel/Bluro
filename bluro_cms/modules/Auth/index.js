const User = require("./User");
const Follower = require("./Follower");
const controllers = require("./controllers");

module.exports = function initAuth(options) {
	const manager = options.modulesManager;
	const {
		getProfileController,
		signupController,
		loginController,
		updateProfileController,
		getFollowersController,
		unfollowUserController,
		getFollowingsController,
		authRule,
		requireAuthorizationRule,
		getProfilesController,
		followUserController,
		deleteProfileController,
		isUsersFollower,
	} = controllers;

	DependencyResolver.registerType({ dependency: requireAuthorizationRule });
	DependencyResolver.registerType({ dependency: User });
	DependencyResolver.registerType({ dependency: Follower });
	FilesManager.createDir("profiles");
	FilesManager.createDir("profiles/img");

	manager.connectModel(User);
	manager.connectModel(Follower);

	manager.connectRule("all", "/", authRule, { sensitive: false });
	manager.connectRule(["put", "delete"], "/profiles/{verbose}", requireAuthorizationRule);
	manager.connectRule(["post", "delete"], "/profiles/{user}/followers", requireAuthorizationRule);

	manager.connectRoute("post", "/login", loginController);
	manager.connectRoute("post", "/signup", signupController);

	manager.connectRoute("get", "/profiles", getProfilesController);
	manager.connectRoute("get", "/profiles/{verbose}", getProfileController);
	manager.connectRoute("put", "/profiles/{verbose}", updateProfileController);
	manager.connectRoute("delete", "/profiles/{verbose}", deleteProfileController);

	manager.connectRoute("post", "/profiles/{user}/followers", followUserController);
	manager.connectRoute("delete", "/profiles/{user}/followers", unfollowUserController);
	manager.connectRoute("get", "/profiles/{user}/followers", getFollowersController);
	manager.connectRoute("get", "/profiles/{user}/followings", getFollowingsController);
	manager.connectRoute("get", "/profiles/{user}/followers/{follower}", isUsersFollower);

	manager.onInit(addRootUser);
};

async function addRootUser() {
	const set = await User.selector.filter({ email: ConfigsManager.getEntry("rootEmail") }).fetch();

	if (set.length) {
		return;
	}

	const user = new User();

	user.userName = ConfigsManager.getEntry("rootUserName");
	user.email = ConfigsManager.getEntry("rootEmail");
	user.pass = ConfigsManager.getEntry("rootPassword");
	user.verbose = ConfigsManager.getEntry("rootVerbose");
	user.about = "";

	user.role = User.ROLES.ADMIN;
	user.img = "default.jpg";
	user.followers = 0;
	user.following = 0;

	await user.save();
}
