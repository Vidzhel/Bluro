const {OP} = require("./operators");
const TYPES = require("./dataTypes");
const requiredMethods = [
	"createDatabase",
	"dropDatabase",
	"createTable",
	"createColumn",
	"dropTable",
	"select",
	"insertInto",
	"deleteFrom",
	"update",
	"set",
	"where",
	"from",
	"limit",
	"orderBy",
];

class StatementBuilder {
	/**
	 *
	 * @type {{regexp: symbol, col: symbol, values: symbol, lt: symbol, fullJoin, substring:
	 *     symbol, not: symbol, rightJoin, and: symbol, gte: symbol, notIn: symbol, join: symbol,
	 *     lte: symbol, between: symbol, all: symbol, notILike: symbol, or: symbol, innerJoin:
	 *     symbol, in: symbol, like: symbol, notBetween: symbol, is: symbol, eq: symbol, gt:
	 *     symbol, any: symbol, outerJoin: symbol, overlap: symbol, ne: symbol, endsWith: symbol,
	 *     leftJoin, startsWith: symbol}}
	 */
	OP = OP
	/**
	 *
	 * @type {{date: symbol, dateTime: symbol, mediumInt: symbol, double: symbol, varchar: symbol,
	 *     tinyInt: symbol, bit: symbol, float: symbol, int: symbol, smallInt: symbol, varBinary:
	 *     symbol, json: symbol, time: symbol, decimal: symbol, bigInt: symbol}|{date, dateTime,
	 *     mediumInt: symbol, double, varchar, tinyInt: symbol, bit: symbol, float: symbol, int:
	 *     symbol, smallInt: symbol, varBinary, json, time, decimal, bigInt: symbol}}
	 */
	TYPES = TYPES

	constructor() {
		this._clauses = [];
		this.cached_statement = null;
		this._checkRequiredMethods();
	}

	_checkRequiredMethods() {
		for (const method of requiredMethods) {
			if (this[method] === void 0) {
				throw new Error(`${method} must be defined on Statement object`);
			}
		}
	}

	addClause(clause) {
		this.cached_statement = null;
		this._clauses.push(clause);
	}

	_groupValues(values) {
		let resultingString;
		if (typeof values === "string") {
			resultingString = values;
		} else if (typeof values[Symbol.iterator] === "function") {
			resultingString = values.join(", ");
		} else {
			throw new Error("Expected string or iterable, got " + typeof values);
		}

		return resultingString;
	}

	build() {
		let statement;
		if (this.cached_statement) {
			statement = this.cached_statement;
		} else {
			this._clauses.join(" ");
		}

		this.clear();
		return statement;
	}

	clear() {
		this._clauses = [];
	}
}

module.exports = StatementBuilder;