const requiredMethods = [
	"createDatabase",
	"dropDatabase",
	"createTable",
	"dropTable",
	"selectFrom",
	"insertInto",
	"deleteFrom",
	"update",
	"set",
	"where",
	"limit",
	"orderBy",
];

class StatementBuilder {
	constructor() {
		this._clauses = [];
		this.cached_statement = null;
		this._checkRequiredMethods();
	}

	_checkRequiredMethods() {
		for (const method of requiredMethods) {
			if (this[method] === void 0) {
				throw new Error(`"${method}" must be defined on Statement object`);
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
			values = values.filter((str) => {
				return !!str;
			});
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
			statement = this._clauses.join(" ");
		}

		this.clear();
		return statement;
	}

	clear() {
		this._clauses = [];
	}
}

module.exports = StatementBuilder;
