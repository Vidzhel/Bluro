const mailer = require("nodemailer");
const Notification = require("./Notification");

class NotificationService {
	constructor() {
		const service = ConfigsManager.getEntry("mailService");
		const user = ConfigsManager.getEntry("mailUser");
		const pass = ConfigsManager.getEntry("mailPass");
		this.subject = ConfigsManager.getEntry("mailSubject");

		this.transport = mailer.createTransport({
			service,
			auth: {
				user,
				pass,
			},
		});
	}

	async sendMessage(sender, receiver, text, title) {
		await this._sendNotification(sender.verbose, receiver.verbose, text, title);
		await this._sendMail(sender.email, receiver.email, text, title);
	}

	async _sendNotification(senderId, receiverId, text, title) {
		const notification = new Notification();
		notification.sender = senderId;
		notification.receiver = receiverId;
		notification.message = text;
		notification.title = title;
		notification.status = Notification.STATUS.SENT;
		notification.date = new Date();

		await notification.save();
	}

	_sendMail(from, to, text, title) {
		const mailOptions = {
			from,
			to,
			subject: this.subject + " - " + title,
			text,
		};

		return new Promise((resolve, reject) => {
			this.transport.sendMail(mailOptions, (error, info) => {
				if (error) {
					reject(error);
				}

				resolve(info);
			});
		});
	}
}

DependencyResolver.registerDependency({
	dependency: NotificationService,
	singleton: true,
});

module.exports = NotificationService;
