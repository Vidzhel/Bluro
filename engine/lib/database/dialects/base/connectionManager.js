class BaseConnectionManager {
	static connect(config) {
		if (Object.is(this.connect, BaseConnectionManager.prototype.connect)) {
			throw new Error("The function must be implemented in subclasses");
		}
		if (!config.host || !config.user || !config.database) {
			throw new Error("Host, port, user, database are required db configuration parameters");
		}
	}

	constructor() {
		this.connection = this.constructor.connection;
	}

	query(query) {
		if (Object.is(this.query, BaseConnectionManager.prototype.query)) {
			throw new Error("The function must be implemented in subclasses");
		}
	}

	disconnect() {
		if (Object.is(this.disconnect, BaseConnectionManager.prototype.disconnect)) {
			throw new Error("The function must be implemented in subclasses");
		}
	}

	delete() {
		this.disconnect();
	}
}

module.exports = BaseConnectionManager;
