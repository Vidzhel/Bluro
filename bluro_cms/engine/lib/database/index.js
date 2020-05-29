const DATA_TYPES = require("./dialects/base/dataTypes");
const OPERATORS = require("./dialects/base/operators");
const REGISTERED_DRIVERS = {
	mysql: "./dialects/mysql",
};

module.exports = async function initDialect(options, dialect = "mySql") {
	dialect = dialect.toLowerCase();
	if (!Object.keys(REGISTERED_DRIVERS).includes(dialect)) {
		throw new Error(`Given driver isn't registered (${dialect})`);
	}

	const base = REGISTERED_DRIVERS[dialect];
	const dbConfigs = {
		host: ConfigsManager.getEntry("dbhost"),
		database: ConfigsManager.getEntry("database"),
		user: ConfigsManager.getEntry("user"),
		password: ConfigsManager.getEntry("password"),
		connectTimeout: ConfigsManager.getEntry("connectTimeout"),
	};

	const connectionManager = require(base + "/connectionManager");
	await connectionManager.connect(dbConfigs);

	const { registerDependency, registerType } = options.dependencyResolver;

	registerType({
		dependency: require("./querySet"),
		name: "_querySet",
	});
	registerDependency({
		dependency: connectionManager,
		name: "_ConnectionManager",
		singleton: true,
	});
	registerDependency({
		dependency: require(base + "/statementBuilder"),
		name: "_sqlStatementBuilder",
	});
	registerDependency({
		dependency: require("./statement"),
		name: "_sqlStatement",
	});

	const Model = require("./model");
	registerType({
		dependency: DATA_TYPES,
		name: "DATA_TYPES",
		setAsGlobal: true,
	});
	registerType({
		dependency: OPERATORS,
		name: "OPERATORS",
		setAsGlobal: true,
	});
	registerType({
		dependency: Model,
		name: "Model",
		setAsGlobal: true,
	});

	Logger.logInfo("Initialized db module");
};
