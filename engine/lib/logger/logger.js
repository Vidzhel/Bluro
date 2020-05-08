const colors = require("colors");
const fs = require("fs");
const PATH_REGEXP = /^[a-z]:((\\|\/)[a-z0-9]+)+\.[a-z0-9]+$/i;

const loggingLevels = { debug: "debug", info: "info", warn: "warn", error: "error", crit: "crit" };
const loggingIds = {
	[loggingLevels.debug]: 0,
	[loggingLevels.info]: 1,
	[loggingLevels.warn]: 2,
	[loggingLevels.error]: 3,
	[loggingLevels.crit]: 4,
};
const COLORS = {
	[loggingLevels.debug]: colors.green,
	[loggingLevels.info]: colors.cyan,
	[loggingLevels.warn]: colors.yellow,
	[loggingLevels.error]: colors.red,
	[loggingLevels.crit]: colors.red,
};
const defaultFormatters = {
	time: (info) => `[${info.date.getHours()}:${info.date.getMinutes()}:${info.date.getSeconds()}]`,
	date: (info) => `[${info.date.getFullYear()}:${info.date.getMonth()}:${info.date.getDate()}]`,
	dateTime: (info) =>
		`[${info.date.getFullYear()}:${info.date.getMonth()}:${info.date.getDate()} ${info.date.getHours()}:${info.date.getMinutes()}:${info.date.getSeconds()}]`,
	message: (info) => `[${info.message}]`,
	level: (info) => `[${info.level}]`,
	location: (info) => `[${info.location}]`,
	newLine: (info) => `\n`,
};

class Logger {
	static levels = loggingLevels;
	levels = loggingLevels;

	static formatters = defaultFormatters;
	formatters = defaultFormatters;

	constructor() {
		this._configs = [];
	}

	addConfig(configs) {
		if (typeof config[Symbol.iterator] === "function" && typeof configs !== "string") {
			for (const config of configs) {
				this._configs.push(_processConfig(config));
			}
		} else if (typeof configs === "object") {
			this._configs.push(_processConfig(configs));
		} else {
			throw new Error(
				"Wrong config format specified, expected object or array of objects, got " +
					typeof configs
			);
		}
	}

	_processConfig(config) {
		const processedConfig = {};
		if (!Object.values(loggingLevels).includes(config.level)) {
			throw new Error(
				"Wrong logging level specified, expected one of " +
					Object.keys(loggingLevels) +
					", got " +
					config.level
			);
		}
		processedConfig.levelId = loggingIds[config.level];
		_extractFormatters(processedConfig, config);
		_extractDestination(processedConfig, config);
	}

	_extractFormatters(processedConfig, config) {
		const formatters = config.formatters;

		if (typeof formatters[Symbol.iterator] === "function" && typeof formatters !== "string") {
			for (const formatter of formatters) {
				if (typeof formatter !== "function") {
					throw new Error("Expected formatter function, got " + typeof formatter);
				}
			}

			processedConfig.format = this._combineFormatters(...formatters);
		} else if (typeof formatters === "function") {
			processedConfig.format = this._combineFormatters(formatters);
		} else {
			throw new Error(
				"Expected an array of formatters or a formatter function, got " + typeof formatters
			);
		}
	}

	_extractDestination(processedConfig, config) {
		const targets = config.targets;

		if (targets.console) {
			processedConfig.console = true;
		}

		const paths = targets.files;
		if (paths && typeof paths !== "string" && typeof paths[Symbol.iterator] === "function") {
			for (const path of paths) {
				if (!PATH_REGEXP.test(path)) {
					throw new Error("Invalid path, " + path);
				}
			}
			processedConfig.files = paths;
		} else if (paths && typeof paths === "string") {
			if (!PATH_REGEXP.test(paths)) {
				throw new Error("Invalid path, " + path);
			}
			processedConfig.files = [paths];
		}
	}

	log(message, level) {
		const levelId = loggingIds[level];
		const info = {
			message,
			level,
			levelId,
			date: new Date(),
			location: this._getLocation(),
			prefix,
		};

		const configs = this._findConfigs(levelId);
		for (const config of configs) {
			const msg = config.format(info);

			if (config.console) {
				console.log(COLORS[level](msg));
			}
			if (config.files) {
				for (const filePath of config.files) {
					_logFile(filePath, msg);
				}
			}
		}
	}

	_getLocation() {
		let stackTrace;
		try {
			throw new Error("Get log location");
		} catch (error) {
			try {
				stackTrace = error.stack
					.split("\n")
					.slice(2)
					.map((str) => str.trim());
			} catch (error) {
				stackTrace = "";
			}
		}

		return stackTrace;
	}

	_findConfigs(levelId) {
		const configs = [];

		for (const config of this._configs) {
			if (config.levelId >= levelId) {
				configs.push(config);
			}
		}

		return configs;
	}

	/**
	 * Takes a list of functions that will be given info object (contains data about log)
	 * and which will return string that will be a part of a log
	 *
	 * @param  {...any} formatters
	 */
	_combineFormatters(...formatters) {
		return function formatter(info) {
			formatters.reduce((prevRes, current) => {
				return `${prevRes} ${current(info)}`;
			});
		};
	}

	_logFile(filePath, msg) {
		fs.writeFile(filePath, msg);
	}
}

for (const level of Object.values(loggingLevels)) {
	const name = "log" + level.charAt(0).toUpperCase() + level.substring(1);

	Object.defineProperty(Logger.prototype, name, {
		value: function (message) {
			Logger.prototype.log(message, level);
		},
	});
}

module.exports = Logger;
