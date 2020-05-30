const fs = require("fs");
const DependencyResolver = require("../../iocContainer/DependencyResolver");
const MIGRATION_NAME_REGEXP = RegExp(/^(\d*)_(\w+?)_.*$/, "i");
const MIGRATE_ACTIONS = {
	DEFINE_TABLE: "DEFINE_TABLE", // Contains bool
	DEFINE_COLUMN: "DEFINE_COLUMN", // Contains object of columns' definitions
	CHANGE_COLUMN: "CHANGE_COLUMN", // Contains object of columns' definitions
	DELETE_TABLE: "DELETE_TABLE", // Contains bool
	DELETE_COLUMN: "DELETE_COLUMN", // Contains object of columns' names
};

class Migration extends DependencyResolver {
	static MIGRATE_ACTIONS = MIGRATE_ACTIONS;

	constructor({ module, migrationDir, moduleName, index = 0, migrationName = null }) {
		super();
		this.index = index;
		this.moduleName = moduleName || module.name;
		this.migrationDir = migrationDir || Migration._getMigrationDir(module.path);
		this.name = migrationName || Migration._generateMigrationName(index, this.moduleName);
		this.path = this.migrationDir + "/" + this.name;
		this.tables = new Map();
		this.migrated = false;

		this.statementBuilder = null;
		this.requireDependency(null, "_sqlStatement", "statementBuilder");
		this.resolveDependencies();

		this.initialMigration = true;
		// this.saved = false;
	}

	static loadMigrations(module) {
		const dir = Migration._getMigrationDir(module.path);
		this.saved = true;
		return Migration._getMigrations(dir);
	}

	static _generateMigrationName(id, module) {
		return `${id}_${module}_migration.json`;
	}

	static _getMigrationDir(modulePath) {
		const migrationsDir = modulePath + "/migrations";
		try {
			fs.accessSync(migrationsDir, fs.constants.F_OK);
		} catch (e) {
			fs.mkdirSync(migrationsDir);
		}

		return migrationsDir;
	}

	/**
	 *
	 * @param {string} migrationDirectory
	 * @return {Migration[]}
	 * @private
	 */
	static _getMigrations(migrationDirectory) {
		const migrations = [];
		let dirHandler = fs.opendirSync(migrationDirectory);

		let file = dirHandler.readSync();
		while (file) {
			const match = MIGRATION_NAME_REGEXP.exec(file.name);

			if (file.isFile() && match) {
				const migration = new Migration({
					migrationDir: migrationDirectory,
					moduleName: match[2],
					index: parseInt(match[1]),
					migrationName: file.name,
				});
				migration.load();

				migrations.push(migration);
				file = dirHandler.readSync();
			}
		}

		dirHandler.closeSync();

		return migrations;
	}

	/**
	 * Sets define table and define columns action
	 */
	setDefineModelAction(model) {
		const description = model.describe();
		const tableName = description.tableName;

		this.setDefineTableAction(tableName);
		for (const columnDefinition of Object.values(description.columns)) {
			this.setDefineColumnAction(tableName, columnDefinition);
		}
	}
	/**
	 *
	 * @param tableName
	 */
	setDefineTableAction(tableName) {
		if (this.tables.get(tableName)) {
			throw new Error(`Cannot define table, the table already exits`);
		}

		this._defineTableIfNotExists(tableName)[MIGRATE_ACTIONS.DEFINE_TABLE] = true;
	}

	/**
	 * @param tableName
	 * @param {columnDefinition} columnDefinition
	 */
	setDefineColumnAction(tableName, columnDefinition) {
		columnDefinition = this._getNecessaryData(columnDefinition);
		this._defineTableIfNotExists(tableName);
		const data = this._defineActionIfNotExists(tableName, MIGRATE_ACTIONS.DEFINE_COLUMN);
		data[columnDefinition.name] = columnDefinition;
	}

	/**
	 * @param tableName
	 * @param {columnDefinition} columnDefinition
	 */
	setChangeColumnAction(tableName, columnDefinition) {
		columnDefinition = this._getNecessaryData(columnDefinition);
		this._defineTableIfNotExists(tableName);
		const data = this._defineActionIfNotExists(tableName, MIGRATE_ACTIONS.CHANGE_COLUMN);
		data[columnDefinition.name] = columnDefinition;
		this.initialMigration = false;
	}

	_getNecessaryData({
		default: _default,
		type,
		nullable,
		autoincrement,
		primaryKey,
		unique,
		foreignKey,
		name,
	}) {
		const formattedType = { id: type.id };
		if (type.size) {
			formattedType.size = type.size;
		}
		if (type.precision) {
			formattedType.precision = type.precision;
		}
		if (type.scale) {
			formattedType.scale = type.scale;
		}

		let formattedForeignKey = null;
		if (foreignKey) {
			formattedForeignKey = {
				columnName: foreignKey.columnName,
				tableName: foreignKey.tableName,
				onUpdate: foreignKey.onUpdate,
				onDelete: foreignKey.onDelete,
				constraintName: foreignKey.constraintName,
			};
		}

		return {
			name,
			type: formattedType,
			default: _default,
			nullable,
			autoincrement,
			primaryKey,
			unique,
			foreignKey: formattedForeignKey,
		};
	}

	/**
	 * @param {string} tableName
	 * @param {string} columnName
	 */
	setDeleteColumnAction(tableName, columnName) {
		this._defineTableIfNotExists(tableName);
		const data = this._defineActionIfNotExists(tableName, MIGRATE_ACTIONS.DELETE_COLUMN);
		data[columnName] = true;
		this.initialMigration = false;
	}

	/**
	 * @param {string} tableName
	 */
	setDeleteTableAction(tableName) {
		const table = this._defineTableIfNotExists(tableName);
		table[MIGRATE_ACTIONS.DELETE_TABLE] = true;
		this.initialMigration = false;
	}

	_defineTableIfNotExists(tableName) {
		let table = this.tables.get(tableName);
		if (!table) {
			table = {
				migrated: false,
			};
			this.tables.set(tableName, table);
		}

		return table;
	}

	/**
	 *
	 * @return {object}
	 * @private
	 */
	_defineActionIfNotExists(table, action) {
		let data = this.tables.get(table)[action];
		if (!data) {
			data = {};
			this.tables.get(table)[action] = data;
		}

		return data;
	}

	load() {
		const migration = require(this.path);
		this.initialMigration = migration.initialMigration;
		this.migrated = migration.migrated;
		this.name = migration.name;

		for (const [tableName, data] of migration.tables) {
			this.tables.set(tableName, data);
		}
	}

	save() {
		const migrated = this.migrated;
		const initialMigration = this.initialMigration;
		const name = this.name;
		const tables = [...this.tables.entries()];

		return fs.writeFileSync(
			this.path,
			JSON.stringify({ migrated, initialMigration, tables, name }),
		);
	}

	delete() {
		return fs.unlinkSync(this.path);
	}

	combineMigrations(migration) {
		this.index = migration.index;

		for (const [tableName, table] of migration.tables.entries()) {
			for (const [action, data] of Object.entries(table)) {
				switch (action) {
					case MIGRATE_ACTIONS.DEFINE_TABLE:
						this._defineTable(tableName);
						break;
					case MIGRATE_ACTIONS.CHANGE_COLUMN: {
						for (const columnDefinition of Object.values(data)) {
							this._changeColumn(tableName, columnDefinition);
						}
						break;
					}
					case MIGRATE_ACTIONS.DEFINE_COLUMN: {
						for (const columnDefinition of Object.values(data)) {
							this._defineColumn(tableName, columnDefinition);
						}
						break;
					}
					case MIGRATE_ACTIONS.DELETE_COLUMN: {
						for (const name of Object.keys(data)) {
							this._deleteColumn(tableName, name);
						}
						break;
					}
					case MIGRATE_ACTIONS.DELETE_TABLE:
						this._deleteTable(tableName);
						break;
				}
			}
		}
	}

	/**
	 * @param {string} tableName
	 * @private
	 */
	_defineTable(tableName) {
		this.setDefineTableAction(tableName);
	}

	/**
	 * @param tableName
	 * @param {columnDefinition} columnDefinition
	 * @private
	 */
	_changeColumn(tableName, columnDefinition) {
		const table = this.tables.get(tableName);
		const { name } = columnDefinition;

		if (!table) {
			throw new Error(`Cannot change column '${name}', table '${tableName}' isn't defined`);
		}

		const oldColumnDefinition = this._getColumnDefinition(table, name);
		if (!oldColumnDefinition) {
			throw new Error(
				`Table '${tableName} 'doesn't have column '${name}' defined, so it cannot be changed`,
			);
		}

		this._setColumnDefinition(table, name, columnDefinition);
	}

	/**
	 * @param tableName
	 * @param {columnDefinition} columnDefinition
	 * @private
	 */
	_defineColumn(tableName, columnDefinition) {
		const table = this.tables.get(tableName);
		const { name } = columnDefinition;
		if (!table) {
			throw new Error(`Cannot define '${name}', table '${tableName}' isn't defined`);
		}

		const oldTableDefinition = this._getTableDefinition(table);
		if (!oldTableDefinition) {
			throw new Error(
				`Table '${tableName} 'is not defined, so it cannot be used to define new column`,
			);
		}
		this._setColumnDefinition(table, name, columnDefinition);
	}

	/**
	 * @param tableName
	 * @param {string} columnName
	 * @private
	 */
	_deleteColumn(tableName, columnName) {
		const table = this.tables.get(tableName);
		if (!table) {
			throw new Error(
				`Table '${tableName}' is not defined, so it cannot be used to delete a column`,
			);
		}

		const oldColumnDefinition = this._getColumnDefinition(table, columnName);
		if (!oldColumnDefinition) {
			throw new Error(
				`Table '${tableName}' doesn't have '${columnName}' defined, so it cannot be deleted`,
			);
		}

		delete table[MIGRATE_ACTIONS.DEFINE_COLUMN][columnName];
	}

	/**
	 * @param tableName
	 * @private
	 */
	_deleteTable(tableName) {
		const table = this.tables.get(tableName);
		if (!table) {
			throw new Error(`Table '${tableName}' is not defined, so it cannot be deleted`);
		}

		this.tables.delete(tableName);
	}

	_getColumnDefinition(table, columnName) {
		const columnsDefinitions = table[MIGRATE_ACTIONS.DEFINE_COLUMN];
		if (columnsDefinitions) {
			return columnsDefinitions[columnName] || null;
		}

		return null;
	}

	_getTableDefinition(table) {
		return table[MIGRATE_ACTIONS.DEFINE_TABLE];
	}

	_setColumnDefinition(table, columnName, columnDefinition) {
		const columnsDefinitions = table[MIGRATE_ACTIONS.DEFINE_COLUMN];
		columnsDefinitions[columnName] = columnDefinition;
	}

	async migrate() {
		for (const [tableName, changes] of this.tables.entries()) {
			for (const [action, data] of Object.entries(changes)) {
				switch (action) {
					case MIGRATE_ACTIONS.DEFINE_COLUMN: {
						const columns = Object.values(data);

						if (changes[MIGRATE_ACTIONS.DEFINE_TABLE]) {
							if (changes[MIGRATE_ACTIONS.DELETE_TABLE]) {
								await this.migrateDeleteTable(tableName);
							}
							await this.migrateDefineTable(tableName, columns);
						} else {
							await this.migrateDefineColumn(tableName, columns);
						}
						break;
					}
					case MIGRATE_ACTIONS.DELETE_TABLE: {
						if (!changes[MIGRATE_ACTIONS.DEFINE_TABLE]) {
							await this.migrateDeleteTable(tableName);
						}
						break;
					}
					case MIGRATE_ACTIONS.DELETE_COLUMN: {
						const columns = Object.keys(data);
						await this.migrateDeleteColumns(tableName, columns);
						break;
					}
					case MIGRATE_ACTIONS.CHANGE_COLUMN: {
						const columnNames = Object.keys(data);
						const columnsDefinitions = Object.values(data);
						await this.migrateDeleteColumns(tableName, columnNames);
						await this.migrateDefineColumn(tableName, columnsDefinitions);
					}
				}
			}
		}

		this.migrated = true;
		this.save();
	}

	async migrateDefineTable(tableName, columnsDefinitions) {
		this.statementBuilder.table(tableName);
		for (const column of columnsDefinitions) {
			this.statementBuilder.column(column);
		}
		await this.statementBuilder.execute(this.statementBuilder.BUILD_ACTIONS.CREATE_TABLE);
	}

	async migrateDefineColumn(tableName, columnsDefinitions) {
		this.statementBuilder.table(tableName);
		for (const column of columnsDefinitions) {
			this.statementBuilder.column(column);
		}
		await this.statementBuilder.execute(this.statementBuilder.BUILD_ACTIONS.ADD_COLUMN);
	}

	async migrateDeleteTable(tableName) {
		await this.statementBuilder
			.table(tableName)
			.execute(this.statementBuilder.BUILD_ACTIONS.DROP_TABLE);
	}

	async migrateDeleteColumns(tableName, columnNames) {
		this.statementBuilder.table(tableName);
		for (const column of columnNames) {
			this.statementBuilder.column({ columnName: column });
		}

		await this.statementBuilder.execute(this.statementBuilder.BUILD_ACTIONS.DROP_COLUMN);
	}
}

module.exports = Migration;
