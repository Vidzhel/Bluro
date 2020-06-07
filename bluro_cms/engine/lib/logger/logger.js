const colors = require("colors");
const fs = require("fs");
const PATH_REGEXP = /^([a-z]:)?((\\|\/)[a-z_0-9]+)+\.[a-z0-9]+$/i;
const ROOT = ConfigsManager.getEntry("root");

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
for (const [level, idx] of Object.entries(Object.values(_loggingLevels))) {
	_loggingIds[idx] = level;
}

const _colors = {
	[_loggingLevels.debugInfo]: colors.blue,
	[_loggingLevels.debugError]: colors.red,
	[_loggingLevels.debugSuccess]: colors.green,
	[_loggingLevels.success]: colors.green,
	[_loggingLevels.info]: colors.blue,
	[_loggingLevels.warn]: colors.yellow,
	[_loggingLevels.error]: colors.red,
	[_loggingLevels.critical]: colors.red,
};

const _defaultFormatters = {
	time: (info) => `[${info.date.getHours()}:${info.date.getMinutes()}:${info.date.getSeconds()}]`,
	date: (info) => `[${info.date.getFullYear()}:${info.date.getMonth()}:${info.date.getDate()}]`,
	dateTime: (info) =>
		`[${info.date.getFullYear()}:${info.date.getMonth()}:${info.date.getDate()} ${info.date.getHours()}:${info.date.getMinutes()}:${info.date.getSeconds()}]`,
	message: (info) => `${info.message}`,
	level: (info) => `[${info.level}]`,
	location: (info) => `${info.location}`,
	prefix: (info) => (info.prefix ? `[${info.prefix}]` : ""),
	newLine: () => `\n  `,
	objToString: (info) => (info.obj ? JSON.stringify(info.obj) : ""),
	errorStack: (info) => (info.error ? info.error.stack : ""),
};

const DEFAULT_CONFIGS = [
	{
		level: _loggingLevels.critical,
		logByName: true,
		name: "db",
		formatters: [
			_defaultFormatters.level,
			_defaultFormatters.dateTime,
			_defaultFormatters.message,
			_defaultFormatters.newLine,
			_defaultFormatters.objToString,
			_defaultFormatters.newLine,
			_defaultFormatters.errorStack,
		],
		targets: {
			console: true,
			files: {
				path: ROOT + "/logs/db.log",
				verbose: "db",
			},
		},
	},
	{
		minLevel: _loggingLevels.info,
		level: _loggingLevels.warn,
		name: "info",
		formatters: [
			_defaultFormatters.level,
			_defaultFormatters.prefix,
			_defaultFormatters.message,
		],
		targets: {
			console: true,
		},
	},
	{
		minLevel: _loggingLevels.error,
		level: _loggingLevels.critical,
		name: "errors",
		formatters: [
			_defaultFormatters.level,
			_defaultFormatters.dateTime,
			_defaultFormatters.prefix,
			_defaultFormatters.message,
			_defaultFormatters.newLine,
			_defaultFormatters.newLine,
			_defaultFormatters.errorStack,
		],
		targets: {
			console: true,
			files: {
				path: ROOT + "/logs/errors.log",
				verbose: "errors",
			},
		},
	},
	{
		level: _loggingLevels.debugInfo,
		name: "debug",
		formatters: [
			_defaultFormatters.level,
			_defaultFormatters.dateTime,
			_defaultFormatters.prefix,
			_defaultFormatters.message,
			_defaultFormatters.newLine,
			_defaultFormatters.objToString,
			_defaultFormatters.newLine,
			_defaultFormatters.newLine,
			_defaultFormatters.errorStack,
		],
		targets: {
			console: true,
		},
	},
	{
		level: _loggingLevels.critical,
		name: "requests",
		logByName: true,
		formatters: [
			_defaultFormatters.level,
			_defaultFormatters.dateTime,
			_defaultFormatters.prefix,
			_defaultFormatters.message,
		],
		targets: {
			console: true,
			files: {
				path: ROOT + "/logs/requests.log",
				verbose: "requests",
			},
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

		const path = ConfigsManager.getEntry("root") + "/logs";
		FilesManager._createDir(path);

		if (useDefaultConfigs) {
			this.addConfigs(DEFAULT_CONFIGS);
		}
	}

	/**
	 *
	 * @param {object[]} configs
	 * @param {string} configs.level - a level of messages that will be logged
	 * @param {string?} configs.minLevelId - a name that can be used to log the message
	 * @param {string[]} configs.formatters - log info formatters
	 * @param {boolean?} configs.logByName - define whether the options.config has to be specified
	 * to use the config (default false)
	 * @param {string?} configs.name - a name that can be used to log the message with a specific
	 *     config
	 */
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
					typeof configs,
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
					config.level,
			);
		}

		processedConfig.levelId = _loggingIds[config.level];
		processedConfig.name = config.name;
		if (config.logByName === null || config.logByName === undefined) {
			processedConfig.logByName = false;
		} else {
			processedConfig.logByName = config.logByName;
		}
		if (!config.minLevel) {
			processedConfig.minLevelId = _loggingIds[_loggingLevels.debugInfo];
		} else {
			processedConfig.minLevelId = _loggingIds[config.minLevel];
		}
		this._extractFormatters(processedConfig, config);
		this._extractDestination(processedConfig, config);

		return processedConfig;
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
				"Expected an array of formatters or a formatter function, got " + typeof formatters,
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
						"Expected file verbose to be a string, got " + typeof file.verbose,
					);
				}
			}
			processedConfig.files = files;
		} else if (files && typeof files === "object") {
			if (!PATH_REGEXP.test(files.path)) {
				throw new Error("Invalid path, " + files.path);
			}
			if (typeof files.verbose !== "string") {
				throw new Error(
					"Expected file verbose to be a string, got " + typeof files.verbose,
				);
			}

			processedConfig.files = [files];
		}
	}
	/**
	 *
	 * @param message
	 * @param level
	 * @param fileToLog
	 * @param configToLog
	 * @param {object} options
	 * @param {string} options.prefix - additional info (module name)
	 * @param {string} options.error - error which stack will be logged
	 * @param {string} options.obj - object to stringify
	 * @param {string} options.config - the name of a config
	 * @param {string} options.file - configs with the given target file will be used
	 *
	 */

	log(message, level, fileToLog = null, configToLog = null, options = {}) {
		const levelId = _loggingIds[level];
		const info = {
			message,
			level,
			levelId,
			date: new Date(),
			location: this._getLocation(),
			...options,
		};

		const configs = this._findConfigs(levelId, configToLog);
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

	_findConfigs(levelId, configName) {
		const configs = [];

		for (const config of this._configs) {
			if (config.minLevelId <= levelId && levelId <= config.levelId) {
				if (
					(config.logByName && configName !== config.name) ||
					(configName && configName !== config.name)
				) {
					continue;
				}

				configs.push(config);
			}
		}

		return configs;
	}

	_getLocation() {
		let stackTrace;
		try {
			throw new Error("Get log location");
		} catch (error) {
			try {
				stackTrace = error.stack
					.split("\n")
					.slice(4)
					.map((str) => str.trim())
					.join("\n    ");
			} catch (error) {
				stackTrace = "";
			}
		}

		return stackTrace;
	}

	/**
	 * Takes a list of functions that will be given info object (contains data about log)
	 * and which will return string that will be a part of a log
	 *
	 * @param  {...any} formatters
	 */
	_combineFormatters(...formatters) {
		return function formatter(info) {
			return formatters
				.reduce((prevRes, current) => {
					prevRes.push(current(info));
					return prevRes;
				}, [])
				.map((str) => str.trim())
				.filter((str) => !!str)
				.join(" ");
		};
	}

	_logFile(filePath, msg) {
		fs.writeFile(filePath, "\n" + msg, { flag: "a" }, (err) => {
			if (err) {
				Logger.logError(err);
			}
		});
	}
}

for (const levelName of Object.keys(_loggingLevels)) {
	const name = "log" + levelName.charAt(0).toUpperCase() + levelName.substring(1);

	Object.defineProperty(Logger.prototype, name, {
		value: function (message, options = {}) {
			Logger.prototype.log.call(
				this,
				message,
				_loggingLevels[levelName],
				options.file,
				options.config,
				options,
			);
		},
	});
}

module.exports = Logger;
