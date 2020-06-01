const Notification = require("./Notification");
const controllers = require("./controllers");

module.exports = function initAuth(options) {
	const manager = options.modulesManager;

	manager.connectModel(Notification);
	const {
		readNotification,
		deleteNotification,
		createNotification,
		getUsersNotificationsRule,
	} = controllers;

	manager.connectRule("all", "/", getUsersNotificationsRule, { sensitive: false });

	manager.connectRoute("post", "profiles/{receiver_verbose}/notifications", createNotification);
	manager.connectRoute(
		"put",
		"profiles/{receiver_verbose}/notifications/{notificationId}",
		readNotification,
	);
	manager.connectRoute(
		"delete",
		"profiles/{receiver_verbose}/notifications/{notificationId}",
		deleteNotification,
	);
};
