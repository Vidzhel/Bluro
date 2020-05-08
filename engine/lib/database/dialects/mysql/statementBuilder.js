"use strict";
const baseStatementBuilder = require("../base/statementBuilder");
const driver = require("mysql");

const dataTypesDefinition = require("./dataTypesDefinition");
const {DEFINITIONS: Op} = require("../base/operatorsDefinition");

const ORDER = ["DESC", "ASC"];

class StatementBuilder extends baseStatementBuilder {
	TYPES = dataTypesDefinition;

	constructor() {
		super();
	}

	createDatabase(name) {
		if (typeof name !== "string") {
			throw new TypeError("String was expected, got " + typeof name);
		}

		this.addClause(`CREATE DATABASE IF NOT EXISTS ${this._escapeIdentifiers(name)}`);
		return this;
	}

	dropDatabase(name) {
		if (typeof name !== "string") {
			throw new TypeError("String was expected, got " + typeof name);
		}

		this.addClause(`DROP DATABASE IF EXISTS ${this._escapeIdentifiers(name)}`);
		return this;
	}

	/**
	 * @param {string} tableName
	 * @param {object} columnsDefinition
	 * @property {string} columnDefinition.columnName
	 * @property {string} columnDefinition.type
	 * @property {object} columnDefinition.columnDefinition
	 * @property {any} columnDefinition.columnDefinition.default - default value
	 * @property {boolean} columns.columnDefinition.nullable - are null value permitted
	 * @property {boolean} columns.columnDefinition.unique - is unique constraint have to be
	 *     specified
	 * @returns {StatementBuilder}
	 */
	createTable(tableName, columnsDefinition) {
		if (typeof tableName !== "string") {
			throw new TypeError("String was expected, got " + typeof tableName);
		}

		const columnsDeclaration = this._groupValues(columnsDefinition.map((column) => this._declareColumn(column) + "\n"))
		this.addClause(`CREATE TABLE IF NOT EXISTS ${tableName} (${columnsDeclaration})`);
		return this;
	}

	_declareColumn(columnDefinition) {
		if (typeof columnName !== "string") {
			throw new TypeError("Column name string was expected, got " + typeof tableName);
		}
		if (typeof columnDefinition !== "object") {
			throw new TypeError("Options object was expected, got " + typeof columnDefinition);
		}
		let clause = `${this._escapeIdentifiers(columnName)} `;

		if (!columnDefinition.type) {
			throw new Error("The column type have to be specified")
		}
		const dataType = dataTypesDefinition[columnDefinition.type];
		if (!dataType) {
			throw new Error("Wrong data type id specified");
		}

		clause += dataType;

		if (columnDefinition.nullable) {
			clause += " NULL";
		} else {
			clause += " NOT NULL";
		}

		if (columnDefinition.default) {
			clause += ` DEFAULT ${columnDefinition.default}`;
		}

		if (columnDefinition.unique) {
			clause += " UNIQUE";
		}

		return clause;
	}

	dropTable(tableName) {
		if (typeof tableName !== "string") {
			throw new TypeError("String was expected, got " + typeof tableName);
		}

		this.addClause(`DROP TABLE IF EXISTS ${this._escapeIdentifiers(tableName)}`);
		return this;
	}

	/**
	 * @param {string|string[]|null} columns - one column, multiple columns or null for any
	 *     column
	 */
	select(columns) {
		if (columns && (typeof columns !== "string" || typeof columns[Symbol.iterator] !== "function" || typeof columns[0] !== "string")) {
			throw new TypeError(`Expected null, string or array of strings, got ${typeof columns}[${typeof columns[0]}]`);
		}
		if (!columns) {
			columns = "*";
		}

		this.addClause(`SELECT ${this._escapeIdentifiers(this._groupValues(columns))}`);
		return this;
	}

	/**
	 *
	 * @param {string} table
	 * @param {object|object[]} values
	 */
	insertInto(table, values) {
		if (typeof table !== "string") {
			throw new TypeError("Expected table name to have string type, got " + typeof table);
		}
		let clause = "INSERT INTO ";
		const columnsOrder = Object.keys(values);
		const columns = this._escapeIdentifiers();

		clause += this._escapeIdentifiers(table);

		if (columns) {
			clause += ` (${this._groupValues(this._escapeIdentifiers(columns))})`;
		}
		this.addClause(clause);

		this._values(values, columnsOrder);
		return this;
	}

	_values(values, columnsOrder) {
		let clause = "VALUES";
		if (typeof values[Symbol.iterator] !== "function") {
			values = [values];
		}

		for (const value of values) {
			clause += " (";
			for (const column of columnsOrder) {
				clause += `${this._escapeIdentifiers(column)} = ${this._escapeValue(value[column])}`;
			}
			clause += ")";
		}

		this.addClause(clause);
	}

	deleteFrom(tableNames) {
		let clause = "DELETE FROM ";

		clause += this._groupValues(this._escapeIdentifiers(tableNames));
		this.addClause(clause);

		return this;
	}

	/**
	 *
	 * @param {string} tableName
	 * @returns {StatementBuilder}
	 */
	update(tableName) {
		let clause = "UPDATE ";

		clause += this._escapeIdentifiers(tableName);
		this.addClause(clause);

		return this;
	}

	/**
	 * @param {object} values
	 */
	set(values) {
		let clause = "SET ";

		for (let [key, value] of Object.entries(values)) {
			clause += ` ${key} = ${value},`;
		}

		clause.splice(clause.length - 1, 1);
		this.addClause(clause);
		return this;
	}

	/**
	 * @param {object|objects[]} where
	 * @param {string} where.firstValue
	 * @param {Symbol} where.operator
	 * @param {any} where.secondValue
	 * @param {object} where.innerCondition
	 * @returns {StatementBuilder}
	 */
	where(where) {
		let clause = "WHERE ";

		clause += this._configure(where, this._whereCondition);

		this.addClause(clause);
		return this;
	}

	_configure(configs, configurator) {
		let resultingString = "";

		if (typeof configs[Symbol.iterator] === "function" && typeof configs !== "string") {
			const resultingArray = [];
			for (const condition of configs) {
				if (typeof condition !== "object") {
					throw new TypeError("Expected object, got " + typeof condition);
				}
				resultingArray.push(configurator(condition));
			}
			resultingString = resultingArray.join(" AND ");
		} else if (typeof configs === "object") {
			resultingString = configurator(configs);
		} else {
			throw new Error("Expected object or array of objects, got " + typeof configs);
		}

		return resultingString;
	}

	_whereCondition(cond) {
		if (cond.secondValue && typeof cond.innerCondition === "object") {
			throw new Error("Condition value and inner condition can not be specified at once");
		}

		if (
			cond.firstValue &&
			(cond.secondValue || cond.innerCondition) &&
			Object.keys(Op).includes(cond.operator)
		) {
			return ` ${this._escapeIdentifiers(cond.firstValue)} ${cond.operator} ${
				cond.secondValue || "(" + this._whereCondition(cond.innerCondition) + ")"
			}`;
		} else {
			throw new Error(
				"Condition column, operator and value have to be specified in where condition"
			);
		}
	}

	// from(from) {
	// 	let clause = "FROM ";
	//
	// 	if (
	// 		typeof from !== "string" ||
	// 		(typeof from[Symbol.iterator] === "function" && typeof from[0] === "string")
	// 	) {
	// 		clause += this._groupValues(from);
	// 	} else {
	// 		clause += this._configure(from, this._fromCondition);
	// 	}
	//
	// 	this.addClause(clause);
	// 	return this;
	// }
	//
	// _fromCondition(cond) {
	// 	let resultingString = "";
	//
	// 	if (typeof cond.innerCondition === "object") {
	// 		if (typeof cond.innerCondition !== "object") {
	// 			throw new Error(
	// 				"Inner condition have to be specified in from clause, expected object, got "
	// + typeof cond.innerCondition ); } if (!JOINS.includes(cond.join)) { throw new
	// Error("Expected join operator, got " + cond.join); }  resultingString =
	// _whereCondition(cond.innerCondition); } else { throw new Error("Expected object, got " +
	// typeof cond); }  return resultingString; }

	limit(limit) {
		this.addClause(`LIMIT ${limit}`);
		return this;
	}

	orderBy(order) {
		let clause = "ORDER BY";
		for (let [key, value] of Object.entries(order)) {
			if (typeof key === "string") {
				value = value.toUpperCase();
				if (!ORDER.includes(value)) {
					throw new Error("Expected DESC or ASC as order determiner, got " + value);
				}
				clause += ` ${key} ${value},`;
			}
		}
		clause.splice(clause.length, 1);
		this.addClause(clause);
		return this;
	}

	_escapeIdentifiers(ids) {
		if (typeof ids[Symbol.iterator] === "function" && typeof ids !== "string") {
			return ids.map(driver.escapeId);
		} else {
			return driver.escapeId(ids);
		}
	}

	_escapeValue(values) {
		if (typeof ids[Symbol.iterator] === "function" && typeof ids !== "string") {
			return values.map(driver.escape);
		} else {
			return driver.escape(values);
		}
	}
}

module.exports = StatementBuilder;
