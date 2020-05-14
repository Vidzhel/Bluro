const DATA_TYPES = require("./dialects/base/dataTypes");
const OPERATORS = require("./dialects/base/operators");
const REGISTERED_DRIVERS = {
	mysql: "./dialects/mysql",
};

module.exports = function initDialect(options, dialect = "mySql") {
	dialect = dialect.toLowerCase();
	if (!Object.keys(REGISTERED_DRIVERS).includes(dialect)) {
		throw new Error(`Given driver isn't registered (${dialect})`);
	}

	const base = REGISTERED_DRIVERS[dialect];
	const dbConfigs = global.ConfigsManager.getEntry("database");
	const { registerDependency, registerType } = options.dependencyResolver;

	registerDependency(
		{
			dependency: require(base + "/connectionManager"),
			name: "_ConnectionManager",
			singleton: true,
		},
		dbConfigs,
	);
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
