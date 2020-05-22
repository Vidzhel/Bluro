const BaseConnectionManager = require("../base/connectionManager");
const driver = require("mysql");

class ConnectionManager extends BaseConnectionManager {
	static connect(config) {
		super.connect(config);
		ConnectionManager.connection = driver.createConnection(config);

		return new Promise((resolve, reject) => {
			ConnectionManager.connection.connect((err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		})
			.then((result) => {
				let message = `Connected to a database, ${config.host}`;
				Logger.logInfo(message, { config: "db", obj: result });
				Logger.logInfo(message, { obj: result });
			})
			.catch((err) => {
				Logger.logError("Connection failed", {
					config: "db",
					error: err,
					obj: { host: config.host, db: config.database },
				});
			});
	}

	/**
	 *
	 * @param {string} query
	 * @return {Promise}
	 */
	query(query) {
		Logger.logInfo(query, { prefix: "QUERY_REQUEST" });

		return new Promise((resolve, reject) => {
			this.connection.query(query, (error, result, fields) => {
				if (error) {
					Logger.logError(query, { prefix: "QUERY_ERR", error });
					reject(error);
				} else {
					Logger.logSuccess(query, { prefix: "QUERY_RES", obj: result });

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
