const Model = require("./model");
const DependencyResolver = require("../iocContainer/DependencyResolver");
const OP = require("./dialects/base/operators");

class QuerySet extends DependencyResolver {
	/**
	 * @param {typeof Model} model
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
		} else if (typeof options === "object" || typeof options[Symbol.iterator] === "function") {
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
			this.statementBuilder.where(options);
		}
	}

	_filterFunction(func, exclude) {
		if (this._populated) {
			this._data = this._data.filter((model) => (exclude ? !func(model) : func(model)));
			return this;
		} else {
			this.statementBuilder.table(this.tableName).where(options);
		}
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

	/**
	 *
	 * @param {object} options - object with columns as fields and 'ASC' or 'DESC' as values
	 * @return {QuerySet}
	 */
	orderBy(options) {
		if (!this._populated) {
			this.statementBuilder.orderBy(options);
		}

		return this;
	}

	/**
	 * @param [offset]
	 * @param count
	 * @return {QuerySet}
	 */
	limit(offset, count) {
		if (this._populated) {
			this._data = this._data.slice(offset, count + 1);
			return this;
		}

		this.statementBuilder.limit(offset, count);

		return this;
	}

	async fetch() {
		if (!this._populated) {
			const data = await this.statementBuilder
				.select()
				.table(this.tableName)
				.execute(this.actions.SELECT);

			this._data = [];
			for (const result of data.result) {
				this._data.push(new this._model(result, false));
			}
			return this;
		}

		return this;
	}

	/**
	 *
	 * @param {Model} thisModel
	 * @param {string} [columnName] - this table reference key column
	 * @param {Model} [parentModel] - a table that has foreignKey column that references thisModel
	 */
	fetchRelated({ thisModel, columnName, parentTable }) {
		if (!columnName && !parentTable) {
			throw new Error("Column name or table name have to be specified");
		}

		if (columnName) {
			const foreignKey = this._model._columns[columnName].foreignKey;
			if (!foreignKey) {
				throw Error(
					`Column '${columnName}' isn't foreign key, table '${this._model.tableName}'`,
				);
			}

			const model = this._model.getModel(foreignKey.tableName);
			const referenceColumn = foreignKey.columnName;

			return model.selector
				.filter({
					[referenceColumn]: thisModel._data[columnName],
				})
				.fetch();
		} else {
			// const model = this._model.getModel(parentTable);
			// if (!model) {
			// 	throw Error(`Table with name '${parentTable}' doesn't exist`);
			// }
			//
			// let foreignKey;
			// for (const foreignKey of model.foreignKeys) {
			// 	if (model._columns[foreignKey].foreignKey.tableName === thisModel.tableName) {
			// 		foreignKey = model._columns[foreignKey].foreignKey;
			// 	}
			// }
			//
			// if (!foreignKey) {
			// 	throw new Error(`Table '${parentTable}' doesn't reference table ${thisModel.tableName}`);
			// }
			//
			// thisModel.selector.
			// foreignKey.columnName
		}
	}

	processFilterParameters(params) {
		const filter = [];

		for (const [name, val] of Object.entries(params)) {
			if (this._model.hasColumn(name)) {
				filter.push({
					firstValue: name,
					operator: this._model.OP.like,
					secondValue: `%${val}%`,
				});
			}
		}

		return filter;
	}

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

	async getList(extract) {
		const result = [];

		for (const model of this._data) {
			const object = await model.toObject(extract);
			result.push(object);
		}

		return result;
	}
}

module.exports = QuerySet;
