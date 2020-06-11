const BaseConnectionManager = require("../base/connectionManager");
const driver = require("mysql");

class ConnectionManager extends BaseConnectionManager {
	static async connect(config) {
		super.connect(config);
		ConnectionManager.connection = driver.createConnection(config);
		const tries = config.dbConnectionTries;
		const dbConnectionTryDelay = config.dbConnectionTryDelay;
		const res = await this._tryConnect(null, tries, dbConnectionTryDelay);

		if (res.failure) {
			Logger.logError("Connection failed", {
				config: "db",
				error: res.error,
				obj: { host: config.host, db: config.database },
			});
		} else {
			let message = `Connected to a database, ${config.host}`;
			Logger.logInfo(message, { config: "db" });
		}
	}

	static async _tryConnect(error, tries, dbConnectionTryDelay) {
		if (tries <= 0) {
			return { failure: true, error };
		}
		error = null;

		try {
			await new Promise((resolve, reject) => {
				ConnectionManager.connection.connect((err, result) => {
					if (err) {
						reject(err);
					}

					resolve(result);
				});
			});
		} catch (e) {
			error = e;
			tries--;
			Logger.logError("Connection failed, tries left: " + tries, {
				config: "db",
				error: error,
			});

			return await new Promise((resolve) => {
				setTimeout(async () => {
					const res = await this._tryConnect(error, tries, dbConnectionTryDelay);
					resolve(res);
				}, dbConnectionTryDelay);
			});
		}

		return { failure: false };
	}

	/**
	 *
	 * @param {string} query
	 * @return {Promise}
	 */
	query(query) {
		Logger.logInfo(query, { prefix: "QUERY_REQUEST", config: "db" });

		return new Promise((resolve, reject) => {
			this.connection.query(query, (error, result, fields) => {
				if (error) {
					Logger.logError(query, { prefix: "QUERY_ERR", error, config: "db" });
					reject(error);
				} else {
					Logger.logSuccess(query, { prefix: "QUERY_RES", obj: result, config: "db" });

					resolve({ result, fields });
				}
			});
		});
	}

	disconnect() {
		return new Promise((resolve, reject) => {
			this.connection.end((err) => {
				if (err) {
					reject(err);
				}

				resolve();
			});
		});
	}
}

module.exports = ConnectionManager;
