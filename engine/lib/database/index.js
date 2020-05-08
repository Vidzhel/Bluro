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

	options.dependencyResolver.registerDependency({
		dependency: require(base + "/connectionManager"),
		name: "_ConnectionManager",
		singleton: true,
	}, dbConfigs);
	options.dependencyResolver.registerDependency({
		dependency: require(base + "/statementBuilder"),
		name: "_sqlStatementBuilder",
	});
	options.dependencyResolver.registerDependency({
		dependency: require(base + "/statement"),
		name: "_sqlStatement",
	});
};
