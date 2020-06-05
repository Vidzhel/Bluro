const DependencyResolver = require("../iocContainer/DependencyResolver");
const OP = require("./dialects/base/operators");

class Statement extends DependencyResolver {
	_tables = [];
	_columnsDefinition = [];
	_selectClause = [];
	_valuesClause = [];
	_whereClause = [];
	_database = null;
	_setClause = null;
	_insertClause = null;
	_orderByClause = null;
	_limitClause = null;

	/**
	 * @enum {string}
	 */
	BUILD_ACTIONS = {
		SELECT: "SELECT",
		INSERT: "INSERT",
		UPDATE: "UPDATE",
		DELETE: "DELETE",
		CREATE_TABLE: "CREATE_TABLE",
		DROP_TABLE: "DROP_TABLE",
		ADD_COLUMN: "ADD_COLUMN",
		DROP_COLUMN: "DROP_COLUMN",
		CREATE_DATABASE: "CREATE_DATABASE",
		DROP_DATABASE: "DROP_DATABASE",
	};

	constructor() {
		super();
		/** @type {StatementBuilder}*/
		this.builder = null;
		/** @type {ConnectionManager}*/
		this.connectionManager = null;
		this.requireDependency(null, "_sqlStatementBuilder", "builder");
		this.requireDependency(null, "_ConnectionManager", "connectionManager");
		this.resolveDependencies();

		this.cachedStatement = null;
		this.cachedAction = null;
	}

	/**
	 *
	 * @param {BUILD_ACTIONS} action
	 */
	execute(action) {
		const statement = this.build(action);
		return this.connectionManager.query(statement);
	}

	logQuery(error, result, fields) {
		if (error) {
			const msg = `Error "${error.sqlMessage || error.message}" ocurred, error code: ${
				error.code || "none"
			}, error no: ${error.errno || "none"}, is fatal${
				error.fatal === undefined ? "none" : error.fatal
			} in \n\n"${error.sql || "none"}"`;
			Logger.logError(msg, { file: "db" });
		} else {
			const msg = `"${this.statement}" was successfully executed`;
			Logger.debugSuccess(msg, { file: "db", obj: { result, fields } });
		}
	}

	/**
	 *
	 * @param {BUILD_ACTIONS} action
	 */
	build(action) {
		let statement;

		if (this.cachedStatement && action === this.cachedAction) {
			statement = this.cachedStatement;
		} else {
			try {
				switch (action) {
					case this.BUILD_ACTIONS.SELECT: {
						this._buildSelect();
						break;
					}
					case this.BUILD_ACTIONS.INSERT: {
						this._buildInsert();
						break;
					}
					case this.BUILD_ACTIONS.UPDATE: {
						this._buildUpdate();
						break;
					}
					case this.BUILD_ACTIONS.DELETE: {
						this._buildDelete();
						break;
					}
					case this.BUILD_ACTIONS.CREATE_DATABASE: {
						this._buildCreateDatabase();
						break;
					}
					case this.BUILD_ACTIONS.DROP_DATABASE: {
						this._buildDropDatabase();
						break;
					}
					case this.BUILD_ACTIONS.CREATE_TABLE: {
						this._buildCreateTable();
						break;
					}
					case this.BUILD_ACTIONS.DROP_TABLE: {
						this._buildDropTable();
						break;
					}
					case this.BUILD_ACTIONS.DROP_COLUMN: {
						this._buildDropColumns();
						break;
					}
					case this.BUILD_ACTIONS.ADD_COLUMN: {
						this._buildAddColumns();
						break;
					}
					default: {
						throw new Error(`The given build action doesn't exist (${action})`);
					}
				}

				statement = this.builder.build();
			} finally {
				this.cachedStatement = statement;
				this.cachedAction = action;

				this.builder.clear();
				this._clear();
			}
		}

		return statement;
	}

	_buildInsert() {
		if (this._tables.length === 0 || this._tables.length > 1) {
			throw new Error("A table is required to build insert statement");
		}
		if (this._valuesClause.length === 0) {
			throw new Error("Values clauses are required to build insert statement");
		}

		this.builder.insertInto(...this._tables, this._valuesClause);
	}

	_buildUpdate() {
		if (this._tables.length === 0 || this._tables.length > 1) {
			throw new Error("A table is required to build update statement");
		}
		if (this._valuesClause.length === 0 || this._valuesClause.length > 1) {
			throw new Error("One Values clause is required to build update statement");
		}

		this.builder.update(...this._tables);
		this.builder.set(this._valuesClause[0]);
		if (this._whereClause.length !== 0) this.builder.where(this._whereClause);
		if (this._orderByClause) this.builder.orderBy(this._orderByClause);
		if (this._limitClause) this.builder.limit(this._limitClause);
	}

	_buildDelete() {
		if (this._tables.length === 0 || this._tables.length > 1) {
			throw new Error("A table is required to build delete statement");
		}

		this.builder.deleteFrom(...this._tables);
		if (this._whereClause.length !== 0) this.builder.where(this._whereClause);
		if (this._orderByClause) this.builder.orderBy(this._orderByClause);
		if (this._limitClause) this.builder.limit(this._limitClause);
	}

	_buildSelect() {
		if (this._selectClause.length === 0) {
			throw new Error("Select clause is required to build select statement");
		}
		if (this._tables.length === 0 || this._tables.length > 1) {
			throw new Error("A table is required to build select statement");
		}

		this.builder.selectFrom(this._selectClause, this._tables[0]);
		if (this._whereClause.length !== 0) this.builder.where(this._whereClause);
		if (this._orderByClause) this.builder.orderBy(this._orderByClause);
		if (this._limitClause)
			this.builder.limit(this._limitClause.offset, this._limitClause.limit);
	}

	_buildCreateTable() {
		if (this._tables.length === 0 || this._tables.length > 1) {
			throw new Error("A table is required to build create table statement");
		}
		if (this._columnsDefinition.length === 0) {
			throw new Error("Column definition are required to build create table statement");
		}

		this.builder.createTable(...this._tables, this._columnsDefinition);
	}

	_buildDropTable() {
		if (this._tables.length === 0 || this._tables.length > 1) {
			throw new Error("A table is required to build create table statement");
		}

		this.builder.dropTable(...this._tables);
	}

	_buildCreateDatabase() {
		if (!this._database) {
			throw new Error("A database is required to build create database statement");
		}

		this.builder.createDatabase(this._database);
	}

	_buildDropDatabase() {
		if (!this._database) {
			throw new Error("A database is required to build create database statement");
		}

		this.builder.dropDatabase(this._database);
	}

	_buildAddColumns() {
		if (this._tables.length === 0 || this._tables.length > 1) {
			throw new Error("A table is required to build add columns statement");
		}
		if (this._columnsDefinition.length === 0) {
			throw new Error("Column definition are required to build add columns statement");
		}

		this.builder.createColumns(this._tables[0], this._columnsDefinition);
	}

	_buildDropColumns() {
		if (this._tables.length === 0 || this._tables.length > 1) {
			throw new Error("A table is required to build drop columns statement");
		}
		if (this._columnsDefinition.length === 0) {
			throw new Error(
				"Column names (specify as column definition with only 'columnName' prop) are required to build drop columns statement",
			);
		}

		this.builder.dropColumns(
			this._tables[0],
			this._columnsDefinition.map((column) => column.columnName),
		);
	}

	_clear() {
		this._tables = [];
		this._columnsDefinition = [];
		this._selectClause = [];
		this._valuesClause = [];
		this._whereClause = [];
		this._database = null;
		this._setClause = null;
		this._insertClause = null;
		this._orderByClause = null;
		this._limitClause = null;
	}

	_invalidateCache() {
		this.cachedAction = null;
		this.cachedStatement = null;
	}

	/**
	 * Overrides the previous database name
	 * @param {string} name
	 * @returns {Statement}
	 */
	database(name) {
		this._database = name;
		this._invalidateCache();

		return this;
	}

	/**
	 *
	 * @param {string} tableName
	 * @returns {Statement}
	 */
	table(tableName) {
		this._tables.push(tableName);
		this._invalidateCache();

		return this;
	}

	/**
	 *
	 * @param {columnDefinition} columnsDefinition
	 * @returns {Statement}
	 */
	column(columnsDefinition) {
		if (
			typeof columnsDefinition === "object" ||
			typeof columnsDefinition[Symbol.iterator] === "function"
		) {
			this._columnsDefinition = this._columnsDefinition.concat(columnsDefinition);
		} else {
			throw new TypeError(
				"Expected object or array of objects, got " + typeof columnsDefinition,
			);
		}
		this._invalidateCache();

		return this;
	}

	/**
	 * @param {string|string[]|null} columnsNames
	 */
	select(columnsNames = null) {
		if (!columnsNames) {
			columnsNames = "*";
		}

		this._selectClause = this._selectClause.concat(columnsNames);
		this._invalidateCache();

		return this;
	}

	/**
	 *
	 * @param {object} values - column-value mapping
	 * @returns {Statement}
	 */
	values(values) {
		this._valuesClause = this._valuesClause.concat(values);
		this._invalidateCache();

		return this;
	}

	// /**
	//  * Overrides the previous set clause values
	//  * @param values - column-value mapping
	//  * @returns {Statement}
	//  */
	// set(values) {
	// 	this._setClause = values;
	// 	this._invalidateCache();
	//
	// 	return this;
	// }

	/**
	 * If more then one condition will be specified, they'll be concatenated with AND operator
	 *
	 * @param {object|object[]} where
	 * @param {string} where.firstValue
	 * @param {Symbol} where.operator
	 * @param {any} where.secondValue
	 * @param {object} where.innerCondition
	 * @example
	 * // WHERE "Column Name" BETWEEN 10 AND 20
	 * where({
	 *     firstValue: "Column Name",
	 *     operator: Operators.between,
	 *     innerCondition: {
	 *         firstValue: "10",
	 *         operator: Operators.and,
	 *         secondValue: "20"
	 *     }
	 * });
	 * @example
	 * // WHERE "Column Name" = "Hello"
	 * where({
	 *     firstValue: "Column Name",
	 *     operator: Operators.eq,
	 *     secondValue: "Hello"
	 * });
	 * @example
	 * // Shortcut form for columnName != value
	 * where({
	 *     columnName: value
	 *     exclude: true
	 * });
	 * @returns {Statement}
	 */
	where(where) {
		if (typeof where[Symbol.iterator] === "function") {
			for (const condition of where) {
				this._whereClause = this._whereClause.concat(this._configureWhereClause(condition));
			}
		} else {
			this._whereClause = this._whereClause.concat(this._configureWhereClause(where));
		}

		this._invalidateCache();
		return this;
	}

	_configureWhereClause(options) {
		if (
			options.firstValue &&
			(options.secondValue || options.innerCondition) &&
			options.operator
		) {
			return options;
		}

		const where = [];

		for (const [field, value] of Object.entries(options)) {
			if (typeof value === "object") {
				if (!(value.operator && value.value)) {
					throw new Error("Operator and value were expected in filter field expression");
				}

				where.push({
					firstValue: field,
					operator: value.operator,
					secondValue: value,
				});
			} else {
				where.push({
					firstValue: field,
					operator: options.exclude ? OP.ne : OP.eq,
					secondValue: value,
				});
			}
		}

		return where;
	}

	/**
	 * Overrides the previous limit clause
	 * @param offset
	 * @param limit
	 * @returns {Statement}
	 */
	limit(offset, limit) {
		this._limitClause = { offset, limit };
		this._invalidateCache();

		return this;
	}

	/**
	 * Overrides the previous order by clause
	 * @param {object} order - key is a column, value ASC or DESC
	 * @returns {Statement}
	 */
	orderBy(order) {
		this._orderByClause = order;
		this._invalidateCache();

		return this;
	}
}

module.exports = Statement;
