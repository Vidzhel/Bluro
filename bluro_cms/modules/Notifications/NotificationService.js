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

	async sendMessage(sender, receiver, text) {
		await this._sendNotification(sender.id, receiver.id);
		await this._sendMail(sender.email, receiver.email, text);
	}

	async _sendNotification(senderId, receiverId, text) {
		const notification = new Notification();
		notification.sender = senderId;
		notification.receiver = receiverId;
		notification.message = text;
		notification.status = Notification.STATUS.SENT;
		notification.date = new Date();

		await notification.save();
	}

	_sendMail(from, to, text) {
		const mailOptions = {
			from,
			to,
			subject: this.subject,
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

module.exports = NotificationService;
