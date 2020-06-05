const Notification = require("./Notification");
const NotificationService = require("./NotificationService");
const controllers = require("./controllers");

module.exports = function initAuth(options) {
	const manager = options.modulesManager;
	const requireAuthorization = DependencyResolver.getDependency(null, "requireAuthorization");

	manager.connectModel(Notification);

	const {
		readNotification,
		deleteNotification,
		createNotification,
		getUsersNotificationsRule,
		notifyFollowers,
	} = controllers;

	manager.connectRule("all", "/", getUsersNotificationsRule, { sensitive: false });
	manager.connectRule("post", "/profiles/{receiver_verbose}/notifications", requireAuthorization);
	manager.connectRule(
		"post",
		"/profiles/{receiver_verbose}/followers/notifications",
		requireAuthorization,
	);
	manager.connectRule(
		["delete", "put"],
		"/profiles/{receiver_verbose}/notifications/{notificationId}",
		requireAuthorization,
	);

	manager.connectRoute("post", "/profiles/{receiver_verbose}/notifications", createNotification);
	manager.connectRoute(
		"post",
		"/profiles/{receiver_verbose}/followers/notifications",
		notifyFollowers,
	);
	manager.connectRoute(
		"put",
		"/profiles/{receiver_verbose}/notifications/{notificationId}",
		readNotification,
	);
	manager.connectRoute(
		"delete",
		"/profiles/{receiver_verbose}/notifications/{notificationId}",
		deleteNotification,
	);
};
