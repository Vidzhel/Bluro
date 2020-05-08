const DependencyResolver = require("../iocContainer/DependencyResolver");
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
	validators: null,
};

class Model extends DependencyResolver {
	/**
	 *
	 * @param {object[]} columns
	 * @param {string} columns.columnName
	 * @param {any|null} columns.value - the value that will be set after initialization
	 * @param {string} columns.type
	 * @param {any} columns.default - default value
	 * @param {boolean} columns.nullable - are null value permitted, if no, then default value
	 * or value have to be specified
	 * @param {boolean} columns.autoincrement
	 * @param {boolean} columns.primaryKey - at least one column have to be primary key or
	 * additional will be generated
	 * @param {object} columns.foreignKey
	 * @param {Model} columns.foreignKey.model
	 * @param {string} columns.foreignKey.table
	 * @param {boolean} columns.unique - is unique constraint have to be specified
	 * @param {function|function[]} columns.validators - validators will be given a new
	 *     column value and if at least on of them return false, then exception will be trowed
	 */
	constructor(columns) {
		super();

		/** @type {Statement}*/
		this.statementBuilder = null;
		this.requireDependency(null, "_sqlStatement", "statementBuilder");

		this.actions = this.statementBuilder.BUILD_ACTIONS;

		this._data = {};
		this._columnsDefinitions = {};
		this.tableName = this.constructor.name;
		this.primaryKey = null;
		this.foreignKeys = {};

		this.selector = new QuerySet(this, this._data);
		this.state = MODEL_STATES.SAVED;
		this._modifiedColumns = [];


		this._initColumns(columns);
	}

	async up(tableName, columnsDefinition) {
		try {
			await this.statementBuilder
				.table(this.tableName)
				.createColumn(columnsDefinition)
				.execute(this.actions.CREATE_TABLE);

			Logger.logError(`Migrated table ${this.tableName}`, {
				file: "db",
				prefix: "UP Migration"
			});
		} catch (e) {
			Logger.logError(e.message, {file: "db", prefix: "UP Migration error"});
		}
	}

	async down() {
		try {
			await this.statementBuilder
				.table(this.tableName)
				.execute(this.actions.DROP_TABLE);
		} catch (e) {
			Logger.logError(e.message, {file: "db", prefix: "DOWN Migration error"});
		}
	}

	_initColumns(columns) {
		let havePrimaryKey = false;

		for (const column of columns) {
			if (this._data[column.columnName]) {
				throw new Error(`Columns with ambiguous names aren't allowed (${column.columnName})`);

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
		const {nullable, validators, columnName} = columnDefinition;

		this._columnsDefinitions[columnName] = columnDefinition;
		if (nullable) {
			validators.push(nullValidator);
		}

		return columnDefinition;
	}

	getFullColumnName(columnName) {
		return `${this.tableName}.${columnName}`;
	}

	_checkPrimaryKey(columnDefinition, havePrimaryKey) {
		const {primaryKey, nullable, columnName} = columnDefinition;

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

	_checkForeignKey({name, columnName, foreignKey}) {
		if (foreignKey) {
			const {model, columnName:referencedColumn} = foreignKey;
			if (!(model instanceof Model)) {
				throw new TypeError(`Expected foreign key model, got ${model}, in ${this.tableName} ${name} column`);
			}
			if (!(model.hasColumn(referencedColumn) && model.isPrimaryKeyColumn(referencedColumn))) {
				throw new Error(`Referenced model (${model}) has to have referenced primary column ${referencedColumn}`);
			}

			foreignKey.table = model.tableName;
			this.foreignKeys[columnName] = columnName;
		}
	}

	_checkValue(columnDefinition) {
		const {columnName, nullable, default: _default, value} = columnDefinition;

		if (value) {
			this._data[columnName] = value;
			this.state = MODEL_STATES.CREATED;
		} else if (_default) {
			this._data[columnName] = _default;
		} else if (nullable) {
			throw new Error("Nullable columnDefinition has to have default value or value, but not null");
		}

	}

	_declarePrimaryKey() {
		const columnName = this.tableName + ".id";
		this.primaryKey = columnName;

		const columnDefinition = {
			columnName,
			type: this.selector.TYPES.int,
			nullable: false,
			autoincrement: true,
			primaryKey: true,
			default: 0,
		};
		this._columnsDefinitions[columnName] = columnDefinition;

		this._declareColumnProperty(columnDefinition);
	}

	_declareColumnProperty(column) {
		const {columnName, validators, name} = column;

		Object.defineProperties(this, {
			[name]: {
				get: () => {
					return this._data[columnName];
				},
				enumerable: true
			},
			[name]: {
				set: (value) => {
					for (const validator of validators) {
						const res = validator(value);
						if (res.fail) {
							throw new Error(`Validation error for value "${value}" in the "${this.tableName}" model, description: ${res.description}`);
						}
					}

					if (this._data[columnName] !== value) {
						this._modifiedColumns.push(columnName);
						this._data[columnName] = value;
					}
				}
			}
		});
	}

	hasColumn(columnName) {
		return !!this._columnsDefinitions[this.getFullColumnName((columnName))];
	}

	isPrimaryKeyColumn(columnName) {
		const columnDefinition = this._columnsDefinitions[this.getFullColumnName((columnName))];
		if (columnDefinition) {
			return !!columnDefinition.primaryKey;
		}

		return false;
	}

	isForeignKeyColumn(columnName) {
		const columnDefinition = this._columnsDefinitions[this.getFullColumnName((columnName))];
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
					.execute(this.actions.INSERT);
			} catch (e) {
				Logger.logError(e.message, {file: "db", prefix: "Model insertion error"});
			}
		} else if (this.state === MODEL_STATES.MODIFIED) {
			try {
				await this.statementBuilder
					.table(this.tableName)
					.update(this._mapChangedColumnsToValues())
					.where({
						firstValue: this.primaryKey,
						operator: this.selector.TYPES,
						secondValue: this[this.primaryKey]
					})
					.execute(this.actions.UPDATE);
			} catch (e) {
				Logger.logError(e.message, {file: "db", prefix: "Model updating error"});
			}
		} else {
			Logger.logDebug(`No save was performed on ${this.tableName} model`);
		}
	}

	async del() {

	}

	_mapChangedColumnsToValues() {
		const values = {};

		for (const column of this._modifiedColumns) {
			values[column] = this._data[column];
		}

		return values;
	}
}

function nullValidator(value) {
	if (value === null) {
		return {description: "The column is not nullable", fail: true};
	}

	return {fail: false};
}

module.exports = Model;