const Migration = require("./migration");
const fs = require("fs");

class MigrationManager {
	static async makeMigrations(modules) {
		modules.map((module) => {
			if (module.models.length) {
				MigrationManager.makeMigration(module);
			}
		});
	}

	static async makeMigration(module) {
		const models = MigrationManager._prioritiseModels(module.models);
		if (models) {
			let migrations = Migration.loadMigrations(module);

			if (!migrations.length) {
				migrations = MigrationManager._initializeMigration(models);
			} else {
			}
		}
	}

	static _prioritiseModels(models) {
		return models.sort((a, b) => {
			if (a.isDependentOn(b)) {
				return -1;
			} else if (b.isDependentOn(a)) {
				return 1;
			}

			return 0;
		});
	}

	static _initializeMigration(models, migrationDir, moduleName) {
		const migrations = [];

		for (const model of models) {
			const migration = new Migration({
				migrationDir,
				moduleName,
			});
			migration.setDefineTableAction(model.describe());
			migrations.push(migration);
		}

		return migrations;
	}

	/**
	 * @param {Migration[]} migrations
	 * @private
	 */
	static _getAppliedMigrations(migrations) {
		return migrations.reduce((accum, curr) => {
			accum.combineMigrations(curr);
		});
	}
}

module.exports = MigrationManager;
