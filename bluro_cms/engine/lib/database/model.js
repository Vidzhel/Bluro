const DependencyResolver = require("../iocContainer/DependencyResolver");
const ModelDescriptor = require("./modelDescription");
const DATA_TYPES = require("./dialects/base/dataTypes");
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
	primaryKey: false,
	unique: false,
	validators: [],
	autoincrement: false,
	foreignKey: null,
};

class Model extends DependencyResolver {
	static DATA_TYPES = DATA_TYPES;
	static OP = OPERATORS;
	static _models = {};

	/**
	 * @typedef {object} columnDefinition
	 * @property {string} columnName
	 * @property {any} [value] - the value that will be set after initialization
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
	 * @property {boolean} [unique] - is unique constraint have to be specified
	 * @property {function|function[]} [validators] - validators will be given new
	 *     column value and if at least on of them return object with property fail true,
	 *     then an exception will be trowed. Additionally property description can be specified to
	 *     describe the exception
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
		const {
			nullable,
			validators,
			name,
			autoincrement,
			value,
			default: _default,
		} = columnDefinition;

		this._columns[name] = columnDefinition;
		if (nullable) {
			validators.push(nullValidator);
		}

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

			const referenceTableName = table || model.tableName;
			const referencedModel = Model._models[referenceTableName];
			const referencedColumnType =
				referencedModel && referencedModel._columns[columnName].type;

			if (table && typeof table !== "string") {
				throw new Error("Table name was expected, got " + typeof table);
			} else if (model && !(model instanceof Model)) {
				throw new Error("Model was expected, got " + model);
			} else if (!model && !table) {
				throw new Error(
					"'table' or 'model' property have to be specified to create foreign key",
				);
			}

			if (referencedModel) {
				throw new Error(
					`Referenced model '${referenceTableName}' hasn't been initialized yet`,
				);
			}
			if (!referencedModel.hasColumn(columnName)) {
				throw new Error(
					`Referenced model '${referenceTableName}' doesn't have referenced column '${columnName}'`,
				);
			}
			if (referencedColumnType !== type) {
				throw new Error(
					`Referenced column '${columnName}' had different type '${referencedColumnType}', this column '${name}', type '${type}'`,
				);
			}

			foreignKey.tableName = table.tableName;
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
		};

		this._defaultData[name] = null;
	}

	/**
	 *
	 * @param data - data to fill in
	 */
	constructor(data = null) {
		super();

		/** @type {Statement}*/
		this.statementBuilder = null;
		this.requireDependency(null, "_sqlStatement", "statementBuilder");
		this.resolveDependencies();
		this.ACTIONS = this.statementBuilder.BUILD_ACTIONS;

		this.tableName = this.constructor.tableName;
		this.primaryKey = this.constructor.primaryKey;
		this.foreignKeys = this.constructor.foreignKeys;
		this._columns = this.constructor._columns;
		this._data = Object.assign({}, this.constructor._defaultData, data || {});

		this.state = data ? MODEL_STATES.SAVED : MODEL_STATES.CREATED;
		this._modifiedColumns = [];

		for (const column of Object.values(this._columns)) {
			this._declareColumnProperty(column);
		}
	}

	_declareColumnProperty(column) {
		const { validators, name } = column;
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

					this._validateValue(validators, value);

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
		if (!(this.state === MODEL_STATES.CREATED && state === MODEL_STATES.MODIFIED)) {
			this.state = state;
		}
	}

	_validateValues() {
		for (const [columnName, columnDefinition] of Object.entries(this._columns)) {
			const validators = columnDefinition.validators;
			const value = this._data[columnName];

			if (validators) {
				this._validateValue(validators, value);
			}
		}
	}

	_validateValue(validators, value) {
		for (const validator of validators) {
			const res = validator(value);
			if (res.fail) {
				throw new Error(
					`Validation error for value "${value}" in the "${this.tableName}" model, description: ${res.description}`,
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

	async save() {
		if (this.state === MODEL_STATES.CREATED || this.state === MODEL_STATES.DELETED) {
			try {
				this._validateValues();

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
		} else if (this.state === MODEL_STATES.MODIFIED) {
			try {
				const { result } = await this.statementBuilder
					.table(this.tableName)
					.update(this._mapChangedColumnsToValues())
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
		if (this.state === MODEL_STATES.MODIFIED || this.state === MODEL_STATES.SAVED) {
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
			throw new Error(`Cannot delete model '${this.tableName}' with state '${this.state}'`);
		}

		this._modifiedColumns = [];
		this._setState(MODEL_STATES.DELETED);
	}

	_mapChangedColumnsToValues() {
		const values = {};

		if (this.state === MODEL_STATES.CREATED) {
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

function nullValidator(value) {
	if (value === null) {
		return { description: "The column is not nullable", fail: true };
	}

	return { fail: false };
}

module.exports = Model;
