class ConfigsManager {
	constructor(rootDir) {
		this._configFilePath = rootDir + "\\config.json";
		this.loadConfigFile();
	}

	loadConfigFile() {
		try {
			this._data = require(this._configFilePath);
		} catch (err) {
			throw new Error("Can't find config file");
		}
	}

	getEntry(key) {
		return this._data[key] || null;
	}
}

module.exports = ConfigsManager;
