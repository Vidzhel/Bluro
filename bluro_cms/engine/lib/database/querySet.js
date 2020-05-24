const Model = require("./model");
const DependencyResolver = require("../iocContainer/DependencyResolver");
const OP = require("./dialects/base/operators");

class QuerySet extends DependencyResolver {
	/**
	 * @param {Model} model
	 * @param {null|any[]} data
	 */
	constructor(model, data = null) {
		super();
		/**@type {Statement}*/
		this.statementBuilder = null;

		this.requireDependency(null, "_sqlStatement", "statementBuilder");
		this.resolveDependencies();

		this._data = [];
		this._populated = false;
		this._model = model;
		this.tableName = model.tableName;
		this.actions = this.statementBuilder.BUILD_ACTIONS;

		if (data && data.length && data.length !== 0) {
			if (data instanceof Model) {
				this._data.push(data);
				this._populated = true;
			} else if (typeof data[Symbol.iterator] === "function" && typeof data !== "string") {
				for (const model of data) {
					if (!(model instanceof Model)) {
						throw new TypeError("Expected model, got " + model);
					}
					this._data.push(model);
					this._populated = true;
				}
			} else {
				throw new TypeError("Expected model or iterable of models, got " + data);
			}
		}
	}

	// async all() {
	// 	if (!this._populated) {
	// 		const data = await this.statementBuilder
	// 		Logger.logInfo(data, {obj: data});
	// 	}
	//
	// 	return this;
	// }

	/**
	 * Returns models that matched the specified options
	 * @param {object|Function} options - if an object is specified, column value will be
	 * checked on each resulting model, if a function is specified, then it'll be given model as
	 * a parameter and in case the function return true the model will be added to the resulting
	 * set
	 */
	filter(options) {
		if (typeof options === "function") {
			this._filterFunction(options, false);
		} else if (typeof options === "object") {
			this._filterOptions(options, false);
		} else {
			throw new TypeError("Expected function or object, got " + typeof options);
		}

		return this;
	}

	/**
	 *
	 * @param options
	 * @param {boolean} exclude - reverses filter
	 * @private
	 */
	_filterOptions(options, exclude) {
		if (this._populated) {
			this._data = this._data.filter(function (model) {
				for (const [key, expectedVal] of Object.entries(options)) {
					const val = model[key];
					if (val === void 0) {
						throw new Error(`A Model doesn't have column named "${key}"`);
					}

					if (!exclude && val !== expectedVal) {
						return false;
					} else if (exclude && val === expectedVal) {
						return false;
					}
				}

				return true;
			});
		} else {
			this.statementBuilder.where(this._configureWhereClause(options));
		}
	}

	_filterFunction(func, exclude) {
		if (this._populated) {
			this._data = this._data.filter((model) => (exclude ? !func(model) : func(model)));
			return this;
		} else {
			this.statementBuilder.table(this.tableName).where(this._configureWhereClause(options));
		}
	}

	_configureWhereClause(options, exclude) {
		const where = [];

		for (const [field, value] of Object.entries(options)) {
			if (!this._model.hasColumn(field)) {
				throw new Error(`Model ${this.tableName} doesn't have column ${field}`);
			}

			where.push({
				firstValue: field,
				operator: exclude ? OP.ne : OP.eq,
				secondValue: value,
			});
		}

		return where;
	}

	/**
	 * Exclude every model that doesn't match the specified options
	 * @param {object|Function} options - if an object is specified, column value will be
	 * checked on each resulting model, if a function is specified, then it'll be given model as
	 * a parameter and in case the function return true the model will be added to the resulting
	 * set
	 */
	exclude(options) {
		if (typeof options === "function") {
			this._filterFunction(options, true);
		} else if (typeof options === "object") {
			this._filterOptions(options, true);
		} else {
			throw new TypeError("Expected function or object, got " + typeof options);
		}

		return this;
	}

	orderBy(options) {
		if (!this._populated) {
			this.statementBuilder.orderBy(options);
		}

		return this;
	}

	// reverse() {
	// 	if (this._populated) {
	// 	}
	// 	return this;
	// }

	// distinct() {
	// }

	limit(count) {
		if (this._populated) {
			this._data = this._data.slice(count + 1);
			return this;
		}
	}

	fetch() {
		if (!this._populated) {
			return this.statementBuilder
				.select()
				.table(this.tableName)
				.execute(this.actions.SELECT)
				.then((data) => {
					this._data = [];
					for (const result of data.result) {
						this._data.push(new this._model(result));
					}
					return this;
				});
		}

		return this;
	}

	// selectRelated() {
	// }

	slice(start, end) {
		this._data = this._data.slice(start, end);
		return this;
	}

	*[Symbol.iterator]() {
		for (const entry of this._data) {
			yield entry;
		}
	}

	get(idx) {
		if (typeof idx !== "number") {
			throw new Error("Index was expected, got " + typeof idx);
		}
		return this._data[idx];
	}

	get length() {
		return this._data.length;
	}
}

module.exports = QuerySet;
