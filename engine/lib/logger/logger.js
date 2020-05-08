const colors = require("colors");
const fs = require("fs");
const PATH_REGEXP = /^[a-z]:((\\|\/)[a-z0-9]+)+\.[a-z0-9]+$/i;

const _loggingLevels = {
	debugInfo: "DEBUG_INFO",
	debugError: "DEBUG_ERROR",
	debugSuccess: "DEBUG_SUCCESS",
	debug: "DEBUG",
	info: "INFO",
	success: "SUCCESS",
	warn: "WARN",
	error: "ERROR",
	critical: "CRITICAL",
};

const _loggingIds = {};
for (const [idx, level] of Object.entries(Object.keys(_loggingLevels))) {
	_loggingIds[idx] = level;
}

const _colors = {
	[_loggingLevels.debugInfo]: colors.cyan,
	[_loggingLevels.debugError]: colors.red,
	[_loggingLevels.debugSuccess]: colors.green,
	[_loggingLevels.success]: colors.green,
	[_loggingLevels.info]: colors.cyan,
	[_loggingLevels.warn]: colors.yellow,
	[_loggingLevels.error]: colors.red,
	[_loggingLevels.critical]: colors.red,
};

const _defaultFormatters = {
	time: (info) => `[${info.date.getHours()}:${info.date.getMinutes()}:${info.date.getSeconds()}]`,
	date: (info) => `[${info.date.getFullYear()}:${info.date.getMonth()}:${info.date.getDate()}]`,
	dateTime: (info) =>
		`[${info.date.getFullYear()}:${info.date.getMonth()}:${info.date.getDate()} ${info.date.getHours()}:${info.date.getMinutes()}:${info.date.getSeconds()}]`,
	message: (info) => `[${info.message}]`,
	level: (info) => `[${info.level}]`,
	location: (info) => `[${info.location}]`,
	prefix: (info) => `[${info.prefix ? info.prefix : "NO PREFIX"}]`,
	newLine: () => `\n`,
	objToString: (info) => info.obj ? JSON.stringify(info.obj) : "",
};

const DEFAULT_CONFIGS = [
	{
		level: "CRITICAL",
		formatters: [
			_defaultFormatters.level,
			_defaultFormatters.dateTime,
			_defaultFormatters.message,
		],
		targets: {
			console: true,
			files: {path: ConfigsManager.getEntry("root") + "/logs/db.log", verbose: "db"},
		},
	},
	{
		level: "CRITICAL",
		formatters: [
			_defaultFormatters.level,
			_defaultFormatters.dateTime,
			_defaultFormatters.prefix,
			_defaultFormatters.message,
			_defaultFormatters.newLine,
			_defaultFormatters.newLine,
			_defaultFormatters.location,
		],
		targets: {
			console: true,
			files: {path: ConfigManager.getEntry("root") + "/logs/errors.log", verbose: "errors"},
		},
	}, {
		level: "DEBUG",
		formatters: [
			_defaultFormatters.level,
			_defaultFormatters.dateTime,
			_defaultFormatters.prefix,
			_defaultFormatters.message,
			_defaultFormatters.newLine,
			_defaultFormatters.objToString,
			_defaultFormatters.newLine,
			_defaultFormatters.newLine,
			_defaultFormatters.location,
		],
		targets: {
			console: true,
		},
	},
];

class Logger {
	static levels = _loggingLevels;
	levels = _loggingLevels;

	static formatters = _defaultFormatters;
	formatters = _defaultFormatters;

	constructor(useDefaultConfigs = true) {
		this._configs = [];

		if (useDefaultConfigs) {
			this.addConfigs(DEFAULT_CONFIGS);
		}
	}

	addConfigs(configs) {
		if (typeof configs[Symbol.iterator] === "function" && typeof configs !== "string") {
			for (const config of configs) {
				this._configs.push(this._processConfig(config));
			}
		} else if (typeof configs === "object") {
			this._configs.push(this._processConfig(configs));
		} else {
			throw new Error(
				"Wrong config format specified, expected object or array of objects, got " +
				typeof configs
			);
		}
	}

	_processConfig(config) {
		const processedConfig = {};
		if (!Object.values(_loggingLevels).includes(config.level)) {
			throw new Error(
				"Wrong logging level specified, expected one of " +
				Object.keys(_loggingLevels) +
				", got " +
				config.level
			);
		}
		processedConfig.levelId = _loggingIds[config.level];
		this._extractFormatters(processedConfig, config);
		this._extractDestination(processedConfig, config);
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

		const files = targets.files;
		if (
			files &&
			typeof files !== "object" &&
			typeof files !== "string" &&
			typeof files[Symbol.iterator] === "function"
		) {
			for (const file of files) {
				if (!PATH_REGEXP.test(file.path)) {
					throw new Error("Invalid path, " + file.path);
				}
				if (typeof file.verbose !== "string") {
					throw new Error(
						"Expected file verbose to be a string, got " + typeof file.verbose
					);
				}
			}
			processedConfig.files = files;
		} else if (files && typeof files === "object") {
			if (!PATH_REGEXP.test(files.path)) {
				throw new Error("Invalid path, " + path.path);
			}
			if (typeof files.verbose !== "string") {
				throw new Error("Expected file verbose to be a string, got " + typeof file.verbose);
			}

			processedConfig.files = [files];
		}
	}

	/**
	 *
	 * @param message
	 * @param level
	 * @param fileToLog
	 * @param {object} options
	 * @property {string} options.prefix
	 */
	log(message, level, fileToLog = null, options = {}) {
		const levelId = _loggingIds[level];
		const info = {
			message,
			level,
			levelId,
			date: new Date(),
			location: this._getLocation(),
			...options,
		};

		const configs = this._findConfigs(levelId);
		for (const config of configs) {
			const msg = config.format(info);

			if (config.console) {
				console.log(_colors[level](msg));
			}
			if (config.files) {
				for (const file of config.files) {
					if (fileToLog && file.verbose !== fileToLog) {
						continue;
					}

					this._logFile(file.path, msg);
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

for (const level of Object.keys(_loggingLevels)) {
	const name = "log" + level.charAt(0).toUpperCase() + level.substring(1);

	Object.defineProperty(Logger.prototype, name, {
		value: function (message, options = {}) {
			Logger.prototype.log(message, level, options.file, options);
		},
	});
}

module.exports = Logger;
