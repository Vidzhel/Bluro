const BaseConnectionManager = require("../base/connectionManager");
const driver = require("mysql");

class ConnectionManager extends BaseConnectionManager {
	connect(config) {
		super.connect(config);
		this.connection = driver.createConnection(config);

		return new Promise((resolve, reject) => {
			this.connection.connect((err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	/**
	 *
	 * @param {string} query
	 * @return {Promise}
	 */
	query(query) {
		Logger.logInfo(query, { prefix: "DB manager" });

		return new Promise((resolve, reject) => {
			// TODO uncomment
			// this.connection.query(query, (error, result, fields) => {
			// 	this.logQuery(error, result, fields);
			// 	if (error) {
			// 		reject(error);
			// 	}
			//
			// 	resolve({ result, fields });
			// });
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
