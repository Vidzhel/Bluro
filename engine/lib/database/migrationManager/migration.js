const fs = require("fs");
const MIGRATION_NAME_REGEXP = RegExp(/^(\d*)_(\w+?)_.*$/, "i");
const MIGRATE_ACTIONS = {
	DEFINE_TABLE: "DEFINE_TABLE",
	DEFINE_COLUMN: "DEFINE_COLUMN",
	CHANGE_COLUMN: "CHANGE_COLUMN",
	DELETE_TABLE: "DELETE_TABLE",
	DELETE_COLUMN: "DELETE_COLUMN",
};

class Migration {
	constructor({ migrationDir, moduleName, index = 0, migrationName = null }) {
		this.index = index;
		this.migrationDir = migrationDir;
		this.moduleName = moduleName;
		this.name = migrationName || Migration._generateMigrationName(index, moduleName);
		this.path = migrationDir + "/" + this.name;
		this.tables = {};
		this.migrated = false;
	}

	static async loadMigrations(module) {
		const dir = await Migration._getMigrationDir(module.path);
		return Migration._getMigrations(dir).map((migration) => {
			migration.load();
			return migration;
		});
	}

	static _generateMigrationName(id, module) {
		return `${id}_${module}_migration.json`;
	}

	static _getMigrationDir(modulePath) {
		return new Promise((resolve) => {
			const migrationsDir = modulePath + "/migrations";
			fs.access(migrationsDir, fs.constants.F_OK, (err) => {
				if (err) {
					fs.mkdirSync(migrationsDir);
				}

				resolve(migrationsDir);
			});
		});
	}

	/**
	 *
	 * @param {string} migrationDirectory
	 * @return {Migration[]}
	 * @private
	 */
	static async _getMigrations(migrationDirectory) {
		const dirHandle = await fs.promises.opendir(migrationDirectory);
		const migrations = [];

		for await (const file of dirHandle) {
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
			}
		}
		dirHandle.closeSync();

		return migrations;
	}

	/**
	 * @param {ModelDescription} modelDescription
	 */
	setDefineTableAction(modelDescription) {
		// TODO table have to have specific order, so tables object doesn't fit here
		this.tables[modelDescription.tableName] = {};
		this.tables[modelDescription.tableName][MIGRATE_ACTIONS.DEFINE_TABLE] = modelDescription;
	}

	load() {
		this.tables = require(this.path);
	}

	save() {
		return fs.promises.writeFile(this.path, this.tables);
	}

	delete() {
		return fs.promises.unlink(this.path);
	}

	combineMigrations(migration) {
		for (const [tableName, table] of Object.values(migration.tables)) {
			for (const [action, data] of Object.values(table)) {
				switch (action) {
					case MIGRATE_ACTIONS.DEFINE_TABLE:
						break;
					case MIGRATE_ACTIONS.CHANGE_COLUMN:
						break;
					case MIGRATE_ACTIONS.DEFINE_COLUMN:
						break;
					case MIGRATE_ACTIONS.DELETE_COLUMN:
						break;
					case MIGRATE_ACTIONS.DELETE_TABLE:
						break;
				}
			}
		}
	}

	/**
	 *
	 * @param tableName
	 * @param {ModelDescription} modelDescription
	 * @private
	 */
	_defineTable(modelDescription) {
		const tableName = modelDescription.tableName;
		if (this.tables[tableName]) {
			throw new Error(
				`Cannot combine migrations, action: '${MIGRATE_ACTIONS.DEFINE_TABLE}', table already exits`,
			);
		}
	}
}

module.exports = Migration;
