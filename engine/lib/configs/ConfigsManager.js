class ConfigsManager {
	constructor(rootDir) {
		this._configFilePath = rootDir + "\\config.json";
		this.loadConfigFile();
		this.setEntryIfNotExist("root", rootDir);
	}

	loadConfigFile() {
		try {
			this._data = require(this._configFilePath);
		} catch (err) {
			throw new Error("Can't find config file");
		}
	}

	/**
	 * @param {string} key
	 * @returns {*|null}
	 */
	getEntry(key) {
		return this._data[key] || null;
	}

	setEntry(key, value) {
		this._data[key] = value;
	}

	setEntryIfNotExist(key, value) {
		if (this._data[key] !== void 0 && this._data[key] !== null) {
			this._data[key] = value;
		}
	}
}

module.exports = ConfigsManager;
