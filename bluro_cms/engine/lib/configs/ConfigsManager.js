const fs = require("fs");
const path = require("path");
const os = require("os");
const INT_REGEXP = /^\d+$/;
const FLOAT_REGEXP = /^\d+.\d+$/;

const CONFIG_NAME = "config.json";

class ConfigsManager {
	constructor() {
		const root = this._findConfig();

		this._configFilePath = root + "/" + CONFIG_NAME;

		this.loadConfigFile();
		this.setEntry("root", root);
	}

	_findConfig() {
		let location = module.path;
		let found = false;
		const sysRoot = os.platform.name === "win32" ? location.split(path.sep)[0] + "\\" : "/";

		while (!found) {
			found = true;

			try {
				fs.accessSync(location + "/" + CONFIG_NAME, fs.constants.F_OK);
			} catch (e) {
				found = false;
				if (location === sysRoot) {
					throw new Error(
						`No config file found, create ${CONFIG_NAME} in the root of your project`,
					);
				}
				location = path.resolve(location, "../");
			}
		}

		return location;
	}

	loadConfigFile() {
		try {
			this._data = require(this._configFilePath);
		} catch (err) {
			throw new Error("Can't find config file");
		}
	}

	/**
	 * Tries to get entry from environment, if fails, returns config file variable
	 *
	 * @param {string} key
	 * @returns {*|null}
	 */
	getEntry(key) {
		const env = process.env[key];

		if (env) {
			if (INT_REGEXP.test(env)) {
				return parseInt(env);
			}

			if (FLOAT_REGEXP.test(env)) {
				return parseFloat(env);
			}

			return env;
		}

		return this._data[key] || null;
	}

	setEntry(key, value) {
		this._data[key] = value;
	}

	setEntryIfNotExist(key, value) {
		if (this._data[key] === void 0 || this._data[key] === null) {
			this._data[key] = value;
		}
	}
}

module.exports = ConfigsManager;
