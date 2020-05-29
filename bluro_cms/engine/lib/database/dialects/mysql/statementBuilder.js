"use strict";
const baseStatementBuilder = require("../base/statementBuilder");
const driver = require("mysql");
const Model = require("../../model");

const dataTypesDefinition = require("./dataTypesDefinition");
const Op = require("../base/operatorsDefinition");

const ORDER = ["DESC", "ASC"];

class StatementBuilder extends baseStatementBuilder {
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
	 * @param {columnDefinition} columnsDefinition
	 * @returns {StatementBuilder}
	 */
	createTable(tableName, columnsDefinition) {
		if (typeof tableName !== "string") {
			throw new TypeError("String was expected, got " + typeof tableName);
		}

		const columnsDeclaration = this._declareColumns(columnsDefinition);
		const constraintDeclaration = this._declareConstraints(columnsDefinition);
		this.addClause(
			`CREATE TABLE IF NOT EXISTS ${tableName} (\n  ${columnsDeclaration}${
				constraintDeclaration ? "," : ""
			}\n\n  ${constraintDeclaration})`,
		);
		return this;
	}

	/**
	 * @param tableName
	 * @param {columnDefinition[]} columnsDefinition
	 * @returns {StatementBuilder}
	 */
	createColumns(tableName, columnsDefinition) {
		if (typeof tableName !== "string") {
			throw new TypeError("String was expected, got " + typeof tableName);
		}

		let clause = `ALTER TABLE ${this._escapeIdentifiers(tableName)}\n  ADD COLUMN `;
		clause += columnsDefinition
			.map((column) => {
				return this._declareColumn(column);
			})
			.join(",\n  ADD COLUMN ");

		this.addClause(clause);
	}

	_declareColumns(columnsDefinition) {
		return columnsDefinition.map((column) => this._declareColumn(column)).join(",\n  ");
	}

	_declareColumn(columnDefinition) {
		if (typeof columnDefinition.name !== "string") {
			throw new TypeError(
				"Column name string was expected, got " + typeof columnDefinition.tableName,
			);
		}
		if (typeof columnDefinition !== "object") {
			throw new TypeError("Options object was expected, got " + typeof columnDefinition);
		}
		let clause = `${this._escapeIdentifiers(columnDefinition.name)} `;

		if (!columnDefinition.type) {
			throw new Error("The column type have to be specified");
		}
		const dataType = dataTypesDefinition[columnDefinition.type.id](columnDefinition.type);
		if (!dataType) {
			throw new Error("Wrong data type id specified");
		}

		clause += dataType;

		if (columnDefinition.nullable) {
			clause += " NULL";
		} else {
			clause += " NOT NULL";
		}

		if (columnDefinition.autoincrement) {
			clause += " AUTO_INCREMENT";
		}

		if (columnDefinition.default) {
			clause += ` DEFAULT ${this._escapeValue(columnDefinition.default)}`;
		}

		if (columnDefinition.primaryKey) {
			clause += " PRIMARY KEY";
		} else if (columnDefinition.unique) {
			clause += " UNIQUE";
		}

		if (columnDefinition.primaryKey && columnDefinition.foreignKey) {
			throw new Error(
				"Column cannot have the primary key and the foreign key constraint" +
					" in the same time",
			);
		}

		return clause;
	}

	_declareConstraints(columnsDefinition) {
		return this._groupValues(
			columnsDefinition.map((column) => {
				if (column.foreignKey) {
					return this._declareForeignKey(column.name, column.foreignKey) + "\n  ";
				}

				return "";
			}),
		);
	}
	//
	// addConstraint(columnDefinition) {
	//
	// }

	_declareForeignKey(columnName, { tableName, columnName: foreignColumn, constraintName }) {
		if (typeof tableName !== "string") {
			throw new Error("Table name was expected, got " + typeof tableName);
		}

		return `CONSTRAINT ${constraintName} FOREIGN KEY (${this._escapeIdentifiers(
			columnName,
		)}) REFERENCES ${this._escapeIdentifiers(tableName)}(${this._escapeIdentifiers(
			foreignColumn,
		)})`;
	}

	dropTable(tableName) {
		if (typeof tableName !== "string") {
			throw new TypeError("String was expected, got " + typeof tableName);
		}

		this.addClause(`DROP TABLE IF EXISTS ${this._escapeIdentifiers(tableName)}`);
		return this;
	}

	/**
	 *
	 * @param {string} tableName
	 * @param {string[]} columnsDefinitions
	 */
	dropColumns(tableName, columnsDefinitions) {
		if (typeof tableName !== "string") {
			throw new TypeError("String was expected, got " + typeof tableName);
		}

		let clause = `ALTER TABLE ${this._escapeIdentifiers(tableName)}\n  DROP COLUMN `;
		clause += columnNames
			.map((columnName) => this._escapeIdentifiers(columnName))
			.join(",  \n DROP COLUMN ");

		this.addClause(clause);
	}

	// _dropConstraints(columnsDefinition) {
	// 	return this._groupValues(
	// 		columnsDefinition.map((column) => {
	// 			if (column.foreignKey) {
	// 				return this._declareForeignKey(column.name, column.foreignKey) + "\n  ";
	// 			}
	//
	// 			return "";
	// 		}),
	// 	);
	// }
	//
	// _dropForeignKey;

	/**
	 * @param {string|string[]|null} columns - one column, multiple columns or null for any
	 *     column
	 * @param {string} table
	 */
	selectFrom(columns, table) {
		if (
			columns &&
			typeof columns !== "string" &&
			typeof columns[Symbol.iterator] !== "function" &&
			typeof columns[0] !== "string"
		) {
			throw new TypeError(
				`Expected null, string or array of strings, got ${typeof columns}[${typeof columns[0]}]`,
			);
		}

		if (typeof table !== "string") {
			throw new Error("Expected string, got " + typeof table);
		}

		if (!columns) {
			columns = "*";
		}

		this.addClause(
			`SELECT ${this._escapeIdentifiers(
				this._groupValues(columns),
			)} FROM ${this._escapeIdentifiers(table)}`,
		);
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
		if (typeof values[Symbol.iterator] !== "function") {
			values = [values];
		}

		let clause = "INSERT INTO ";
		clause += this._escapeIdentifiers(table);

		const columnsOrder = Object.keys(values[0]);
		const columns = this._escapeIdentifiers(columnsOrder);

		clause += ` (${this._groupValues(columns)})`;
		this.addClause(clause);

		this._values(values, columnsOrder);
		return this;
	}

	_values(values, columnsOrder) {
		let clause = "VALUES";

		for (const value of values) {
			const values = columnsOrder
				.map((column) => {
					return `${this._escapeValue(value[column])}`;
				})
				.join(", ");

			clause += `\n  (${values})`;
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

		const set = [];
		for (let [key, value] of Object.entries(values)) {
			set.push(` ${this._escapeIdentifiers(key)} = ${this._escapeValue(value)}`);
		}

		clause += this._groupValues(set);
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

		clause += this._configure(where, this._whereCondition.bind(this));

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
		const operator = Op[cond.operator];

		if (cond.firstValue && (cond.secondValue || cond.innerCondition) && operator) {
			const secondOperand = !cond.innerCondition
				? this._escapeValue(cond.secondValue)
				: "(" + this._whereCondition(cond.innerCondition) + ")";

			return ` ${this._escapeIdentifiers(cond.firstValue)} ${operator} ${secondOperand}`;
		} else {
			throw new Error(
				"Condition column, operator and value have to be specified in where condition",
			);
		}
	}

	limit(offset, limit) {
		this.addClause(`LIMIT ${offset ? offset + ", " + limit : limit}`);
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
				clause += ` ${this._escapeIdentifiers(key)} ${value},`;
			}
		}
		clause = clause.substr(0, clause.length - 1);
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
		if (values && typeof values[Symbol.iterator] === "function" && typeof values !== "string") {
			return values.map(driver.escape);
		} else {
			return driver.escape(values);
		}
	}
}

module.exports = StatementBuilder;
