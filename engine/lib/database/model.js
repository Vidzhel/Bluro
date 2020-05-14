const DependencyResolver = require("../iocContainer/DependencyResolver");
const DATA_TYPES = require("./dialects/base/dataTypes");
const OPERATORS = require("./dialects/base/operators");
const QuerySet = require("./querySet");

const MODEL_STATES = {
	CREATED: "CREATED",
	MODIFIED: "MODIFIED",
	SAVED: "SAVED",
};

const DEFAULT_OPTIONS = {
	default: null,
	nullable: true,
	primaryKey: false,
	unique: false,
	validators: [],
};

class Model extends DependencyResolver {
	static DATA_TYPES = DATA_TYPES;
	static OP = OPERATORS;
	static selector = new QuerySet(this, this._data);

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
	 * additional will be generated
	 * @property {object} [foreignKey]
	 * @property {Model} foreignKey.model
	 * @property {string} foreignKey.table
	 * @property {boolean} [unique] - is unique constraint have to be specified
	 * @property {function|function[]} [validators] - validators will be given a new
	 *     column value and if at least on of them return false, then exception will be trowed
	 */

	/**
	 *
	 * @param {columnDefinition[]} columns
	 */
	constructor(columns) {
		super();

		/** @type {Statement}*/
		this.statementBuilder = null;
		this.requireDependency(null, "_sqlStatement", "statementBuilder");
		this.resolveDependencies();

		this.ACTIONS = this.statementBuilder.BUILD_ACTIONS;

		this._data = {};
		this._columnsDefinitions = {};
		this.tableName = this.constructor.name;
		this.primaryKey = null;
		this.foreignKeys = [];

		this.state = MODEL_STATES.SAVED;
		this._modifiedColumns = [];

		this._initColumns(columns);
	}

	static async up() {
		try {
			await this.statementBuilder
				.table(this.tableName)
				.createColumn(Object.values(this._columnsDefinitions));

			Logger.logError(`Migrated table ${this.tableName}`, {
				file: "db",
				prefix: "UP Migration",
			});
		} catch (e) {
			Logger.logError(e.message, { config: "db", prefix: "UP Migration error", error: e });
		}
	}

	static async down() {
		try {
			await this.statementBuilder.table(this.tableName);
		} catch (e) {
			Logger.logError(e.message, { config: "db", prefix: "DOWN Migration error", error: e });
		}
	}

	_initColumns(columns) {
		let havePrimaryKey = false;

		for (const column of columns) {
			if (this._data[column.columnName]) {
				throw new Error(
					`Columns with ambiguous names aren't allowed (${column.columnName})`,
				);
			}
			const columnDefinition = this._validateConfig(column);
			havePrimaryKey = this._checkPrimaryKey(columnDefinition, havePrimaryKey);
			this._checkForeignKey(columnDefinition);
			this._checkValue(columnDefinition);

			this._declareColumnProperty(columnDefinition);
		}

		// Declare additional column for primary key
		if (!havePrimaryKey) {
			this._declarePrimaryKey();
		}
	}

	_validateConfig(column) {
		// Prevent ambiguous names in queries
		column.name = column.columnName;
		column.columnName = this.getFullColumnName(column.columnName);

		const columnDefinition = Object.assign({}, DEFAULT_OPTIONS, column);
		const { nullable, validators, name } = columnDefinition;

		this._columnsDefinitions[name] = columnDefinition;
		if (nullable) {
			validators.push(nullValidator);
		}

		return columnDefinition;
	}

	getFullColumnName(columnName) {
		return `${this.tableName}.${columnName}`;
	}

	_checkPrimaryKey(columnDefinition, havePrimaryKey) {
		const { primaryKey, nullable, columnName } = columnDefinition;

		if (primaryKey && !havePrimaryKey) {
			havePrimaryKey = true;
			this.primaryKey = columnName;
		} else if (primaryKey && havePrimaryKey) {
			throw new Error(`Model ${this.tableName} can't have more than one primary key`);
		}

		if (primaryKey && nullable) {
			throw new Error("Primary key columnDefinition can't be nullable");
		}

		return havePrimaryKey;
	}

	_checkForeignKey({ name, columnName, foreignKey }) {
		if (foreignKey) {
			const { model, columnName: referencedColumn } = foreignKey;
			if (!(model.prototype instanceof Model)) {
				throw new TypeError(
					`Expected foreign key model reference, got ${model}, in ${this.tableName} ${name} column`,
				);
			}
			if (
				!(model.hasColumn(referencedColumn) && model.isPrimaryKeyColumn(referencedColumn))
			) {
				throw new Error(
					`Referenced model (${model}) has to have referenced primary column ${referencedColumn}`,
				);
			}

			foreignKey.table = model.tableName;
			this.foreignKeys.push(name);
		}
	}

	_checkValue(columnDefinition) {
		const { columnName, nullable, default: _default, value } = columnDefinition;

		if (value) {
			this._data[columnName] = value;
			this.state = MODEL_STATES.CREATED;
		} else if (_default) {
			this._data[columnName] = _default;
		} else if (!nullable) {
			throw new Error(
				"Not nullable columnDefinition has to have default value or value, but not null",
			);
		}
	}

	_declarePrimaryKey() {
		const name = "id";
		const columnName = this.tableName + "." + name;
		this.primaryKey = columnName;

		const columnDefinition = {
			columnName,
			name,
			type: Model.TYPES.INT(),
			nullable: false,
			autoincrement: true,
			primaryKey: true,
			default: 0,
		};
		this._columnsDefinitions[columnName] = columnDefinition;

		this._declareColumnProperty(columnDefinition);
	}

	_declareColumnProperty(column) {
		const { columnName, validators, name } = column;

		Object.defineProperties(this, {
			[name]: {
				get: () => {
					return this._data[columnName];
				},
				enumerable: true,
			},
			[name]: {
				set: (value) => {
					for (const validator of validators) {
						const res = validator(value);
						if (res.fail) {
							throw new Error(
								`Validation error for value "${value}" in the "${this.tableName}" model, description: ${res.description}`,
							);
						}
					}

					if (this._data[columnName] !== value) {
						this._modifiedColumns.push(columnName);
						this._data[columnName] = value;
					}
				},
			},
		});
	}

	hasColumn(columnName) {
		return !!this._columnsDefinitions[this.getFullColumnName(columnName)];
	}

	isPrimaryKeyColumn(columnName) {
		const columnDefinition = this._columnsDefinitions[this.getFullColumnName(columnName)];
		if (columnDefinition) {
			return !!columnDefinition.primaryKey;
		}

		return false;
	}

	isForeignKeyColumn(columnName) {
		const columnDefinition = this._columnsDefinitions[this.getFullColumnName(columnName)];
		if (columnDefinition) {
			return !!columnDefinition.foreignKey;
		}

		return false;
	}

	async save() {
		if (this.state === MODEL_STATES.CREATED) {
			try {
				await this.statementBuilder
					.table(this.tableName)
					.values(this._data)
					.execute(this.ACTIONS.INSERT);
			} catch (e) {
				Logger.logError(e.message, { file: "db", prefix: "Model insertion error" });
			}
		} else if (this.state === MODEL_STATES.MODIFIED) {
			try {
				await this.statementBuilder
					.table(this.tableName)
					.update(this._mapChangedColumnsToValues())
					.where({
						firstValue: this.primaryKey,
						operator: Model.OP.eq,
						secondValue: this[this.primaryKey],
					})
					.execute(this.ACTIONS.UPDATE);
			} catch (e) {
				Logger.logError(e.message, { file: "db", prefix: "Model updating error" });
			}
		} else {
			Logger.logDebug(`No save was performed on ${this.tableName} model`);
		}
	}

	async del() {}

	_mapChangedColumnsToValues() {
		const values = {};

		for (const column of this._modifiedColumns) {
			values[column] = this._data[column];
		}

		return values;
	}

	isDependentOn(model) {
		for (const foreignKey of this.foreignKeys) {
			const columnDefinition = this._columnsDefinitions[foreignKey];
			if (Object.is(columnDefinition.foreignKey.model, model)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * @typedef {object} ModelDescription
	 * @property {string} tableName
	 * @property {string[]} foreignKeys
	 * @property {string} primaryKey
	 * @property {columnDefinition[]} columns
	 */

	/**
	 * @return {ModelDescription}
	 */
	describe() {
		const tableName = this.tableName;
		const foreignKeys = this.foreignKeys;
		const primaryKeys = this.primaryKey;
		const columns = this._columnsDefinitions;
		return {
			tableName,
			foreignKeys,
			primaryKeys,
			columns,
		};
	}

	/**
	 * @param {ModelDescription} description
	 */
	compare(description) {}
}

function nullValidator(value) {
	if (value === null) {
		return { description: "The column is not nullable", fail: true };
	}

	return { fail: false };
}

module.exports = Model;
