const DependencyResolver = require("../iocContainer/DependencyResolver");
const ModelDescriptor = require("./modelDescription");
const DATA_TYPES = require("./dialects/base/dataTypes");
const DATA_TYPES_IDS = require("./dialects/base/dataTypesId");
const OPERATORS = require("./dialects/base/operators");

const MODEL_STATES = {
	CREATED: "CREATED", // when save is called then all columns will be saved, if delete is called an exception is thrown
	DELETED: "DELETED", // if save is called then all columns will be saved, if delete is called an exception is thrown
	MODIFIED: "MODIFIED", // when save is called then modified columns will be updated, if delete is called then data will be deleted
	SAVED: "SAVED", // if save is called an exception is thrown, if delete is called then data will be deleted
};

const DEFAULT_OPTIONS = {
	default: null,
	nullable: false,
	protectedProperty: false,
	primaryKey: false,
	unique: false,
	autoincrement: false,
	foreignKey: null,
};

class Model extends DependencyResolver {
	/**
	 * @type {{FLOAT: (function(): {id: string}), TINY_INT: (function(*=, *=): {min: (null|number),
	 *     max: (null|number), id: string}), DECIMAL: (function(number, number): {precision:
	 *     number, scale: number, id: string}), JSON: (function(): {id: string}), TIME:
	 *     (function(): {id: string}), BIT: (function(number=, number=, number=): {min: number,
	 *     size: number, max: number, id: string}), INT: (function(*=, *=): {min: (null|number),
	 *     max: (null|number), id: string}), MEDIUM_INT: (function(*=, *=): {min: (null|number),
	 *     max: (null|number), id: string}), BIG_INT: (function(*=, *=): {min: null, max: null, id:
	 *     string}), DATE: (function(): {id: string}), VARCHAR: (function(number, number=, number=,
	 *     number=): {min: (number), size: number, max: number, id: string, regExp: number}),
	 *     VARBINARY: (function(): {id: string}), DOUBLE: (function(): {id: string}), DATE_TIME:
	 *     (function(): {id: string}), SMALL_INT: (function(*=, *=): {min: (null|number), max:
	 *     (null|number), id: string})}}
	 */
	static DATA_TYPES = DATA_TYPES;
	static OP = OPERATORS;
	static CUSTOM_VALIDATORS_GENERATORS = {
		file: generateFileValidator,
		dateInterval: generateDateIntervalValidator,
	};

	static _models = {};

	/**
	 * @typedef {object} columnDefinition
	 * @property {string} columnName
	 * @property {string} [verboseName]
	 * @property {*[]} [possibleValues] - list of possible values
	 * @property {boolean} protectedProperty - do not serialize it on toObject is called
	 * @property {string} type
	 * @property {any} [default] - default value
	 * @property {boolean} [nullable] - are null value permitted, if no, then default value
	 * or value have to be specified
	 * @property {boolean} [autoincrement]
	 * @property {boolean} [primaryKey] - at least one column have to be primary key or
	 * 		additional will be generated, primary keys are immutable columns
	 * @property {object} [foreignKey]
	 * @property {Model} foreignKey.model - referenced module
	 * @property {string} foreignKey.table - referenced table (module name)
	 * @property {string} foreignKey.columnName - referenced column
	 * @property {string} foreignKey.onDelete
	 * @property {string} foreignKey.onUpdate
	 * @property {boolean} [unique] - is unique constraint have to be specified
	 * @property {function|function[]} [validators] - validators will be given a new
	 *     column value and column definition and if at least on of them return object with
	 *     property fail true, then an exception will be trowed. Additionally property description
	 *     can be specified to describe the exception
	 * @property {function|function[]} [convertIn] - converters will be called in a chain when a new
	 * value will be set and given the value, returned value will be stored
	 * @property {function|function[]} [convertOut] - converters will be called in a chain when a
	 * value will be gotten and given the value, converted value will be returned from a getter
	 */

	/**
	 * @param {columnDefinition[]} schema
	 */
	static init(schema) {
		this._validateCall();
		this._defaultData = {};
		/**
		 *
		 * @type {{ColumnDefinition}}
		 * @private
		 */
		this._columns = {};
		this.tableName = this.name;
		this.primaryKey = null;
		this.foreignKeys = [];

		/** @type {Statement}*/
		this.statementBuilder = null;
		this.requireDependency(null, "_sqlStatement", "statementBuilder");
		this.resolveDependencies();
		this.ACTIONS = this.statementBuilder.BUILD_ACTIONS;

		this._initColumns(schema);

		/**
		 * @type {QuerySet}
		 */
		this.selector = null;
		const querySet = this.getDependency(null, "_querySet");
		this.selector = new querySet(this);

		if (Model._models[this.tableName]) {
			throw new Error(`Ambiguous table names are forbidden (${this.tableName})`);
		}
		Model._models[this.tableName] = this;
	}

	static _validateCall() {
		if (!(this.prototype instanceof Model)) {
			throw Error("Callee have to be subclass of Model");
		}
		if (Object.is(this, Model)) {
			throw new Error("Callee can't be Model itself, but subclass of Model");
		}
	}

	static _initColumns(columns) {
		for (const column of columns) {
			if (this._defaultData[column.columnName]) {
				throw new Error(
					`Columns with ambiguous names aren't allowed (${column.columnName})`,
				);
			}

			const columnDefinition = this._validateConfig(column);
			this._checkPrimaryKey(columnDefinition);
			this._checkForeignKey(columnDefinition);
			this._checkValue(columnDefinition);
			this._applyValidators(columnDefinition);
		}

		// Declare additional column for primary key
		if (!this.primaryKey) {
			this._declarePrimaryKey();
		}
	}

	static _validateConfig(column) {
		// Prevent ambiguous names in queries
		column.name = column.columnName;
		column.columnName = this.getFullColumnName(column.columnName);

		const columnDefinition = Object.assign({}, DEFAULT_OPTIONS, column);
		const { name, autoincrement, value, default: _default, converters } = columnDefinition;

		if (!converters) {
			columnDefinition.converters = [];
		} else if (typeof converters[Symbol.iterator] !== "function") {
			columnDefinition.converters = [converters];
		}

		this._columns[name] = columnDefinition;

		if (autoincrement && (_default || value)) {
			throw new Error("Autoincrement column can't have default or value parameters");
		}

		return columnDefinition;
	}

	static getFullColumnName(columnName) {
		return `${this.tableName}.${columnName}`;
	}

	static _checkPrimaryKey(columnDefinition) {
		const { primaryKey, nullable, name } = columnDefinition;

		if (primaryKey && !this.primaryKey) {
			this.primaryKey = name;
		} else if (primaryKey && this.primaryKey) {
			throw new Error(`Model ${this.tableName} can't have more than one primary key`);
		}

		if (primaryKey && nullable) {
			throw new Error("Primary key columnDefinition can't be nullable");
		}
	}

	static _checkForeignKey({ name, foreignKey, type }) {
		if (foreignKey) {
			const { table, model, columnName } = foreignKey;
			if (!model && !table) {
				throw new Error(
					"'table' or 'model' property have to be specified to create foreign key",
				);
			}

			const referenceTableName = table || model.tableName;
			const referencedModel = Model._models[referenceTableName];
			const referencedColumnType =
				referencedModel && referencedModel._columns[columnName].type.id;

			if (referenceTableName && typeof referenceTableName !== "string") {
				throw new Error("Table name was expected, got " + typeof referenceTableName);
			} else if (referencedModel && !(referencedModel.prototype instanceof Model)) {
				throw new Error("Model was expected, got " + referencedModel);
			}

			if (!referencedModel.hasColumn(columnName)) {
				throw new Error(
					`Referenced model '${referenceTableName}' doesn't have referenced column '${columnName}'`,
				);
			}
			if (referencedColumnType !== type.id) {
				throw new Error(
					`Referenced column '${columnName}' had different type '${referencedColumnType}', this column '${name}', type '${type}'`,
				);
			}

			foreignKey.tableName = referenceTableName;
			foreignKey.constraintName = `FK_${this.tableName}_${referenceTableName}`;
			this.foreignKeys.push(name);
		}
	}

	static _checkValue(columnDefinition) {
		const { name, default: _default, value } = columnDefinition;

		if (value) {
			this.this._defaultData[name] = value;
		} else if (_default) {
			this._defaultData[name] = _default;
		} else {
			this._defaultData[name] = null;
		}
	}

	static _declarePrimaryKey() {
		const name = "id";
		const columnName = this.getFullColumnName(name);
		this.primaryKey = name;

		if (this._columns[name]) {
			throw new Error(
				"Column 'id' is reserved for primary key in case you didn't specify PK",
			);
		}
		this._columns[name] = {
			...DEFAULT_OPTIONS,
			columnName,
			name,
			type: DATA_TYPES.INT(),
			nullable: false,
			autoincrement: true,
			primaryKey: true,
			protectedProperty: true,
		};

		this._defaultData[name] = null;
	}

	static _applyValidators(columnDefinition) {
		let {
			nullable,
			validators,
			verboseName,
			name,
			type,
			possibleValues,
			autoincrement,
		} = columnDefinition;
		const columnName = verboseName ? verboseName : name;

		const autogeneratedValidators = [];

		autogeneratedValidators.forEach((validator) => {
			if (typeof validator !== "function") {
				throw new Error("Validator is expected to be of function type");
			}
		});

		if (!nullable && !autoincrement) {
			autogeneratedValidators.push(generateNullValidator(columnName));
		}

		const typeId = type.id;

		if (typeId === DATA_TYPES_IDS.DATE || typeId === DATA_TYPES_IDS.DATE_TIME) {
			autogeneratedValidators.push(generateDateValidator(columnName));
		} else if (typeId === DATA_TYPES_IDS.VARCHAR) {
			autogeneratedValidators.push(generateTextValidator(columnName, type.min, type.max));

			if (type.regExp) {
				autogeneratedValidators.push(generateRegExpValidator(columnName, type.regExp));
			}
		} else if (
			typeId === DATA_TYPES_IDS.TINY_INT ||
			typeId === DATA_TYPES_IDS.SMALL_INT ||
			typeId === DATA_TYPES_IDS.MEDIUM_INT ||
			typeId === DATA_TYPES_IDS.INT ||
			typeId === DATA_TYPES_IDS.BIG_INT ||
			typeId === DATA_TYPES_IDS.BIT
		) {
			autogeneratedValidators.push(generateIntValidator(columnName, type.min, type.max));
		} else if (
			typeId === DATA_TYPES_IDS.DATE_TIME ||
			typeId === DATA_TYPES_IDS.TIME ||
			typeId === DATA_TYPES_IDS.DATE_TIME
		) {
			autogeneratedValidators.push(generateDateValidator(columnName));
		}

		if (possibleValues) {
			if (typeof possibleValues[Symbol.iterator] !== "function") {
				throw new Error("List of possible values was expected");
			}

			autogeneratedValidators.push(generateEnumValidator(columnName, possibleValues));
		}

		if (!validators) {
			columnDefinition.validators = autogeneratedValidators;
		} else if (typeof validators[Symbol.iterator] !== "function") {
			autogeneratedValidators.push(validators);
			columnDefinition.validators = autogeneratedValidators;
		} else {
			columnDefinition.validators = autogeneratedValidators.concat(validators);
		}
	}

	/**
	 *
	 * @param data - data to fill in
	 * @param isCreated - defines whether you create data or fill with already saved data
	 */
	constructor(data = null, isCreated = true) {
		super();
		this.statementBuilder = this.constructor.statementBuilder;
		this.ACTIONS = this.constructor.ACTIONS;

		this.tableName = this.constructor.tableName;
		this.primaryKey = this.constructor.primaryKey;
		this.foreignKeys = this.constructor.foreignKeys;
		this._columns = this.constructor._columns;

		this._state = !isCreated ? MODEL_STATES.SAVED : MODEL_STATES.CREATED;
		this._modifiedColumns = [];

		for (const column of Object.values(this._columns)) {
			this._declareColumnProperty(column);
		}

		if (isCreated) {
			this._data = Object.assign({}, this.constructor._defaultData);
			for (const [field, val] of Object.entries(data)) {
				this[field] = val;
			}
		} else {
			if (!data) {
				throw Error("Data have to be specified");
			}
			this._data = Object.assign({}, this.constructor._defaultData, data);
		}

		this._validateValues();
	}

	_declareColumnProperty(column) {
		const { validators, name, converters } = column;
		const primaryKeyName = this.constructor.primaryKey;

		Object.defineProperties(this, {
			[name]: {
				get: () => {
					return this._data[name];
				},
				set: (value) => {
					if (name === primaryKeyName) {
						throw new Error("Primary key cannot be changed");
					}

					this._validateValue(validators, value, column);
					value = this._convertValue(converters, value);

					if (this._data[name] !== value) {
						this._modifiedColumns.push(name);
						this._data[name] = value;
						this._setState(MODEL_STATES.MODIFIED);
					}
				},
				enumerable: true,
			},
		});
	}

	_setState(state) {
		if (!(this._state === MODEL_STATES.CREATED && state === MODEL_STATES.MODIFIED)) {
			this._state = state;
		}
	}

	_convertValue(converters, value) {
		return converters.reduce((accum, curr) => {
			return curr(accum);
		}, value);
	}

	_validateValues() {
		for (const [columnName, columnDefinition] of Object.entries(this._columns)) {
			const validators = columnDefinition.validators;
			const value = this._data[columnName];

			if (validators) {
				this._validateValue(validators, value, columnDefinition);
			}
		}
	}

	/**
	 * Returns object with parameter fail set to false if values are valid
	 * @param values
	 * @param omitUndefined
	 * @returns {{fail: boolean, description: (text|undefined)}}
	 */
	static validateValues(values, omitUndefined = false) {
		for (const [columnName, columnDefinition] of Object.entries(this._columns)) {
			const validators = columnDefinition.validators;
			const value = values[columnName];

			if (
				!omitUndefined &&
				value === undefined &&
				!this._columns[columnName].default &&
				!this._columns[columnName].primaryKey
			) {
				throw new Error(`Column '${columnName}' can't be undefined`);
			} else if (omitUndefined && value === undefined) {
				continue;
			}

			if (validators) {
				for (const validator of validators) {
					const res = validator(value, columnDefinition);
					if (res.fail) {
						res.validator = validator.name;
						return res;
					}
				}
			}
		}

		return { fail: false };
	}

	_validateValue(validators, value, columnDefinition) {
		for (const validator of validators) {
			const res = validator(value, columnDefinition);
			if (res.fail) {
				throw new Error(
					`Validation error for value "${value}" in the "${this.tableName}" model, column '${columnDefinition.columnName}', description: ${res.description}`,
				);
			}
		}
	}

	static hasColumn(columnName) {
		this._validateCall();
		return this._columns[columnName];
	}

	static isPrimaryKeyColumn(columnName) {
		this._validateCall();
		return this.primaryKey === columnName;
	}

	static isForeignKeyColumn(columnName) {
		this._validateCall();
		return this.foreignKeys.includes(columnName);
	}

	static getModel(tableName) {
		return this._models[tableName] || null;
	}

	async save() {
		if (this._state === MODEL_STATES.CREATED || this._state === MODEL_STATES.DELETED) {
			try {
				const { result } = await this.statementBuilder
					.table(this.tableName)
					.values(this._mapChangedColumnsToValues())
					.execute(this.ACTIONS.INSERT);

				this._data[this.primaryKey] = result.insertId;

				Logger.logInfo(`Inserted rows ${result.affectedRows} into '${this.tableName}'`, {
					prefix: "SAVE_MODEL",
					config: "db",
				});
			} catch (e) {
				Logger.logError("Model insertion error", {
					prefix: "SAVE_MODEL",
					error: e,
					config: "db",
				});
			}
		} else if (this._state === MODEL_STATES.MODIFIED) {
			try {
				const { result } = await this.statementBuilder
					.table(this.tableName)
					.set(this._mapChangedColumnsToValues())
					.where({
						firstValue: this.primaryKey,
						operator: Model.OP.eq,
						secondValue: this._columns[this.primaryKey],
					})
					.execute(this.ACTIONS.UPDATE);

				Logger.logInfo(`Updated rows ${result.affectedRows} into ${this.tableName}`, {
					prefix: "SAVE_MODEL",
					config: "db",
				});
			} catch (e) {
				Logger.logError("Model updating error", {
					prefix: "SAVE_MODEL",
					error: e,
					config: "db",
				});
			}
		} else {
			throw new Error(`Nothing to save on '${this.tableName}' model`);
		}

		this._modifiedColumns = [];
		this._setState(MODEL_STATES.SAVED);
	}

	async del() {
		if (this._state === MODEL_STATES.MODIFIED || this._state === MODEL_STATES.SAVED) {
			try {
				const { result } = await this.statementBuilder
					.table(this.tableName)
					.where({
						firstValue: this.primaryKey,
						operator: Model.OP.eq,
						secondValue: this._data[this.primaryKey],
					})
					.execute(this.ACTIONS.DELETE);

				Logger.logInfo(`Deleted rows ${result.affectedRows} from '${this.tableName}'`, {
					prefix: "SAVE_MODEL",
					config: "db",
				});
			} catch (e) {
				Logger.logError("Model deletion error", {
					file: "db",
					prefix: "DELETE_MODEL",
					error: e,
					config: "db",
				});
			}
		} else {
			throw new Error(`Cannot delete model '${this.tableName}' with state '${this._state}'`);
		}

		this._modifiedColumns = [];
		this._setState(MODEL_STATES.DELETED);
	}

	_mapChangedColumnsToValues() {
		const values = {};

		if (this._state === MODEL_STATES.CREATED) {
			for (const [columnName, value] of Object.entries(this._data)) {
				if (!this._columns[columnName].autoincrement) {
					values[columnName] = value;
				}
			}
		} else {
			for (const column of this._modifiedColumns) {
				if (!this._columns[column].autoincrement) {
					values[column] = this._data[column];
				}
			}
		}

		return values;
	}

	static async update(data, where) {
		const filteredData = {};
		for (const [columnName, val] of Object.entries(data)) {
			if (this._columns[columnName] === undefined) {
				throw new Error(
					`Column '${columnName}' is not defined on table '${this.tableName}'`,
				);
			}

			if (val !== undefined) {
				filteredData[columnName] = val;
			}
		}

		try {
			const { result } = await this.statementBuilder
				.table(this.tableName)
				.values(filteredData)
				.where(where)
				.execute(this.ACTIONS.UPDATE);

			Logger.logInfo(`Updated rows ${result.affectedRows} into ${this.tableName}`, {
				prefix: "SAVE_MODEL",
				config: "db",
			});
		} catch (e) {
			Logger.logError("Model updating error", {
				prefix: "SAVE_MODEL",
				error: e,
				config: "db",
			});
		}
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
	static async del(where) {
		try {
			const { result } = await this.statementBuilder
				.table(this.tableName)
				.where(where)
				.execute(this.ACTIONS.DELETE);

			Logger.logInfo(`Deleted rows ${result.affectedRows} from '${this.tableName}'`, {
				prefix: "SAVE_MODEL",
				config: "db",
			});
		} catch (e) {
			Logger.logError("Model deletion error", {
				file: "db",
				prefix: "DELETE_MODEL",
				error: e,
				config: "db",
			});
		}
	}

	/**
	 * @param {typeof Model} model
	 */
	isDependentOn(model) {
		for (const foreignKey of this.constructor.foreignKeys) {
			const columnDefinition = this._columns[foreignKey];

			const thisTableName =
				columnDefinition.foreignKey.table || columnDefinition.foreignKey.model.tableName;
			if (thisTableName !== model.tableName) {
				return true;
			}
		}

		return false;
	}

	async toObject() {
		const res = {};

		for (const [columnName, val] of Object.entries(this._data)) {
			if (this._columns[columnName].protectedProperty) {
				continue;
			}

			if (this._columns[columnName].foreignKey) {
				const related = await this.constructor.selector.fetchRelated({
					thisModel: this,
					columnName,
				});
				const set = await related.getList();

				if (set.length === 1) {
					res[columnName] = set[0];
				} else if (set.length === 0) {
					res[columnName] = null;
				} else {
					res[columnName] = set;
				}
			} else {
				res[columnName] = val;
			}
		}
		return res;
	}

	/**
	 * @return {ModelDescription}
	 */
	static describe() {
		this._validateCall();
		return new ModelDescriptor(this);
	}
	/**
	 * @param {columnDefinition[]} columns
	 */
	static compare(columns) {
		this._validateCall();
		return this.describe().compare(columns);
	}
}

// Validators generators

function generateNullValidator(name) {
	return function nullValidator(newVal) {
		return {
			description: `${name} can't be empty`,
			fail: newVal === null || newVal === undefined,
		};
	};
}

function generateDateValidator(name) {
	return function dateValidator(newVal) {
		if (newVal === null || newVal === undefined) {
			return {
				fail: false,
			};
		}

		return {
			fail: !(newVal instanceof Date && !isNaN(newVal) && !isNaN(newVal.getTime())),
			description: `${name} has wrong date format`,
		};
	};
}

function generateTextValidator(name, min, max) {
	return function textValidator(newVal) {
		if (newVal === null || newVal === undefined) {
			return {
				fail: false,
			};
		}

		return {
			fail: newVal.length < min || newVal > max,
			description: `${name} has to be at least ${min} and no more then ${max} symbols in length`,
		};
	};
}

function generateIntValidator(name, min, max) {
	return function intValidator(newVal) {
		if (newVal === null || newVal === undefined) {
			return {
				fail: false,
			};
		}

		return {
			fail: newVal < min || newVal > max,
			description: `${name} has to be at least ${min} and no more then ${max}`,
		};
	};
}

function generateEnumValidator(name, possibleValues) {
	return function enumValidator(newVal) {
		if (newVal === null || newVal === undefined) {
			return {
				fail: false,
			};
		}

		return {
			fail: !possibleValues.includes(newVal),
			description: `${name} has to be one of ${possibleValues}, got ${newVal}`,
		};
	};
}

function generateRegExpValidator(name, regExp) {
	return function regExpValidator(newVal) {
		if (newVal === null || newVal === undefined) {
			return {
				fail: false,
			};
		}

		return {
			fail: !regExp.test(newVal),
			description: `Invalid value of ${name} was specified`,
		};
	};
}

// Custom validators

function generateFileValidator(isTemp = false) {
	return function fileValidator(newVal, columnDefinition) {
		if (newVal === null || newVal === undefined) {
			return {
				fail: false,
			};
		}

		const name = columnDefinition.verboseName
			? columnDefinition.verboseName
			: columnDefinition.name;

		return {
			fail: !FilesManager.resourceExists(newVal, isTemp),
			description: `${name} can't take non existing file`,
		};
	};
}

/**
 * if neither min nor max are specified, value will be compared with now
 *
 * @param {Date} min
 * @param {Date} max
 */
function generateDateIntervalValidator(min = null, max = null) {
	const minTime = min ? min.getTime() : null;

	if (minTime && minTime > maxTime) {
		throw new Error("Wrong date interval");
	}

	return function dateIntervalValidator(newVal, columnDefinition) {
		if (newVal === null || newVal === undefined) {
			return {
				fail: false,
			};
		}
		const maxTime = max ? max.getTime() : Date.now();

		const name = columnDefinition.verboseName
			? columnDefinition.verboseName
			: columnDefinition.name;
		const valTime = newVal.getTime();
		let failed = false;

		if (minTime && (minTime > valTime || maxTime < valTime)) {
			failed = true;
		} else if (maxTime < valTime) {
			failed = true;
		}

		return {
			fail: failed,
			description: `Invalid date was specified in ${name}`,
		};
	};
}

module.exports = Model;
