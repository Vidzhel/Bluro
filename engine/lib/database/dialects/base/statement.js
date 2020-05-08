const DependencyResolver = require("../../../iocContainer/DependencyResolver");

class Statement extends DependencyResolver {

	_tables = [];
	_columnsDefinition = []
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
		CREATE_DATABASE: "CREATE_DATABASE",
		DROP_DATABASE: "DROP_DATABASE",
	}

	constructor() {
		super();
		/** @type {StatementBuilder}*/
		this.builder = null;
		/** @type {ConnectionManager}*/
		this.connectionManager = null;
		this.requireDependency(null, "_sqlStatementBuilder", "builder");
		this.requireDependency(null, "_ConnectionManager", "connectionManager");

		this.TYPES = this.builder.TYPES;
		this.OP = this.builder.OP;
		this.cachedStatement = null;
		this.cachedAction = null;
	}

	/**
	 *
	 * @param {BUILD_ACTIONS} action
	 */
	execute(action) {
		const statement = this.build(action);

		return new Promise((resolve, reject) => {
			this.connectionManager.connection.query(statement, (error, result, fields) => {
				this.logQuery(error, result, fields);
				if (error) {
					reject(error);
				}

				resolve({result, fields});
			});
		});
	}

	logQuery(error, result, fields) {
		if (error) {
			const msg = `Error "${error.sqlMessage || error.message}" ocurred, error code: ${
				error.code || "none"
			}, error no: ${error.errno || "none"}, is fatal${
				error.fatal === undefined ? "none" : error.fatal
			} in \n\n"${error.sql || "none"}"`;
			Logger.logError(msg, {file: "db"});
		} else {
			const msg = `"${this.statement}" was successfully executed`;
			Logger.debugSuccess(msg, {file: "db", obj: {result, fields}});
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
				default: {
					throw new Error(`The given build action doesn't exist (${action})`);
				}
			}
			statement = this.builder.build();

			this.cachedStatement = statement;
			this.cachedAction = action;

			this._clear();
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
		if (this._valuesClause.length === 0) {
			throw new Error("Values clauses are required to build update statement");
		}

		this.builder.update(...this._tables);
		this.builder.set(this._setClause);
		if (this._whereClause.length !== 0)
			this.builder.where(this._whereClause);
		if (this.orderBy)
			this.builder.orderBy(this._orderByClause);
		if (this._limitClause)
			this.builder.limit(this._limitClause);
	}

	_buildDelete() {
		if (this._tables.length === 0 || this._tables.length > 1) {
			throw new Error("A table is required to build delete statement");
		}

		this.builder.deleteFrom(...this._tables);
		if (this._whereClause.length !== 0)
			this.builder.where(this._whereClause);
		if (this.orderBy)
			this.builder.orderBy(this._orderByClause);
		if (this._limitClause)
			this.builder.limit(this._limitClause);
	}


	_buildSelect() {
		if (this._selectClause.length === 0) {
			throw new Error("Select clause is required to build select statement");
		}
		if (this._tables.length === 0) {
			throw new Error("Tables are required to build select statement");
		}

		this.builder.select(this._selectClause);
		this.builder.from(this._tables);
		if (this._whereClause.length === 0)
			this.builder.where(this._whereClause);
		if (this._limitClause)
			this.builder.limit(this._limitClause);
		if (this.orderBy)
			this.builder.orderBy(this._orderByClause);
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
	 * @param {object|objects[]} columnsDefinition
	 * @property {string} columnDefinition.columnName
	 * @property {string} columnDefinition.type
	 * @property {object} columnDefinition.columnDefinition
	 * @property {object} columnDefinition.autoincrement
	 * @property {object} columnDefinition.primaryKey
	 * @property {object} columns.foreignKey
	 * @property {string} columns.foreignKey.table
	 * @property {string} columns.foreignKey.columnName
	 * @property {any} columnDefinition.columnDefinition.default - default value
	 * @property {boolean} columns.columnDefinition.nullable - are null value permitted
	 * @property {boolean} columns.columnDefinition.unique - is unique constraint have to be
	 *     specified
	 * @returns {Statement}
	 */
	createColumn(columnsDefinition) {
		if (typeof columnsDefinition === "object" || typeof columnsDefinition[Symbol.iterator] === "function") {
			this._columnsDefinition.concat(columnsDefinition);
		} else {
			throw new TypeError("Expected object or array of objects, got " + typeof columnsDefinition);
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

		this._selectClause.concat(columnsNames);
		this._invalidateCache();

		return this;
	}

	/**
	 *
	 * @param {object} values - column-value mapping
	 * @returns {Statement}
	 */
	values(values) {
		this._valuesClause.concat(values);
		this._invalidateCache();

		return this;
	}

	/**
	 * Overrides the previous set clause values
	 * @param values - column-value mapping
	 * @returns {Statement}
	 */
	set(values) {
		this._setClause = values;
		this._invalidateCache();

		return this;
	}

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
	 * @returns {Statement}
	 */
	where(where) {
		this._whereClause.concat(where);
		this._invalidateCache();

		return this;
	}

	/**
	 * Overrides the previous limit clause
	 * @param limit
	 * @returns {Statement}
	 */
	limit(limit) {
		this._limitClause = limit;
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
