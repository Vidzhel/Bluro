const Notification = require("./Notification");
const User = DependencyResolver.getDependency(null, "User");
const NotificationService = DependencyResolver.getDependency(null, "NotificationService");
const Follower = DependencyResolver.getDependency(null, "Follower");

async function getUsersNotificationsRule(req, res, data) {
	if (data.session) {
		const receiver = data.session.verbose;
		const set = await Notification.selector.filter({ receiver }).fetch();

		res.setNotifications(await set.getList());
	}
}

async function createNotification(req, res, data) {
	const receiver_verbose = data.params.receiver_verbose;

	const receiverSet = await User.selector.filter({ verbose: receiver_verbose }).fetch();
	const receiver = receiverSet.get(0);
	const text = data.reqData.message;
	const title = data.reqData.title;

	if (!text || text > 600) {
		res.error("Notification text has to be specified and be no more than 600 symbols");
		res.code(res.CODES.BadReq);
		return;
	}

	if (!title || title > 50) {
		res.error("Notification title has to be specified and be no more than 50 symbols");
		res.code(res.CODES.BadReq);
		return;
	}

	if (!receiver) {
		res.error("User doesn't exist");
		res.code(res.CODES.NotFound);
		return;
	}

	await NotificationService.sendMessage(data.session, receiver, text, title);
}

async function notifyFollowers(req, res, data) {
	const text = data.reqData.message;
	const title = data.reqData.title;

	if (!text || text > 600) {
		res.error("Notification text has to be specified and be no more than 600 symbols");
		res.code(res.CODES.BadReq);
		return;
	}

	if (!title || title > 50) {
		res.error("Notification title has to be specified and be no more than 50 symbols");
		res.code(res.CODES.BadReq);
		return;
	}

	if (!receiver) {
		res.error("User doesn't exist");
		res.code(res.CODES.NotFound);
		return;
	}

	const sender = data.session;
	const set = await Follower.selector.filter({ user: sender.verbose }).fetch();

	for (const follow of set) {
		await NotificationService.sendMessage(sender, follow.follower, text, title);
	}
}

async function readNotification(req, res, data) {
	const receiver_verbose = data.params.receiver_verbose;
	const notificationId = data.params.notificationId;

	if (!(await checkNotification(receiver_verbose, notificationId, data))) {
		return;
	}

	await Notification.update({ status: Notification.STATUS.READ }, { id: notificationId });
}

async function deleteNotification(req, res, data) {
	const receiver_verbose = data.params.receiver_verbose;
	const notificationId = data.params.notificationId;

	if (!(await checkNotification(receiver_verbose, notificationId, data))) {
		return;
	}

	await Notification.del({ id: notificationId });
}

async function checkNotification(receiver_verbose, notificationId, data) {
	if (data.session.verbose !== receiver_verbose) {
		res.error("You are not allowed to read someones messages");
		res.code(res.CODES.Forbidden);
		return;
	}

	const usersSet = await User.selector.filter({ verbose: receiver_verbose }).fetch();
	const receiver = usersSet.get(0);

	if (!receiver) {
		res.error("User doesn't exist");
		res.code(res.CODES.NotFound);
		return;
	}

	const notificationSet = await Notification.selector.filter({ id: notificationId }).fetch();
	const notification = notificationSet.get(0);

	if (!notification) {
		res.error("Notification doesn't exist");
		res.code(res.CODES.NotFound);
		return;
	}

	return true;
}

exports.getUsersNotificationsRule = getUsersNotificationsRule;
exports.createNotification = createNotification;
exports.deleteNotification = deleteNotification;
exports.readNotification = readNotification;
exports.notifyFollowers = notifyFollowers;
