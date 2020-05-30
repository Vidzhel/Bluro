const Migration = require("./migration");
const ModelDescription = require("../modelDescription");
const COMPARE_MODELS = {
	EQUAL: "EQUAL",
	DIFFER: "DIFFER",
	DELETED: "DELETED",
	CREATED: "CREATED",
};

class MigrationManager {
	static async makeMigrations(modules) {
		modules.map((module) => {
			if (module.models.length) {
				MigrationManager.makeMigration(module);
			}
		});
	}

	static async makeMigration(module) {
		Logger.logInfo("Start making migration", { prefix: "MIGRATION_MANAGER" });

		const models = module.models;
		if (models) {
			const migrations = await Migration.loadMigrations(module);
			/**
			 * @type {Migration}
			 */
			let migration;

			if (!migrations.length) {
				migration = MigrationManager._initializeMigration(models, module);
			} else {
				const { notAppliedMigrations, combinedMigration } = this._getAppliedMigrations(
					migrations,
				);
				if (!combinedMigration) {
					// Create new migration if no other exist
					migration = MigrationManager._initializeMigration(models, module);
				} else {
					migration = this._createNewMigration(combinedMigration, models);

					// Other migrations are not relevant (deprecated)
					// if (migration) {
					// 	for (const deprecatedMigration of notAppliedMigrations) {
					// 		if (deprecatedMigration.index >= migration.index) {
					// 			deprecatedMigration.delete();
					// 		}
					// 	}
					// }
				}
			}

			if (migration) {
				migration.save();
				Logger.logInfo(`Created new migration '${migration.name}'`, {
					prefix: "MIGRATION_MANAGER",
				});
			}
		}
	}

	static applyMigrations(modules) {
		Logger.logInfo("Start applyingMigration", { prefix: "MIGRATION_MANAGER" });
		modules.map((module) => {
			if (module.models.length) {
				MigrationManager.applyMigration(module);
			}
		});
	}

	static async applyMigration(module) {
		const migrations = Migration.loadMigrations(module);
		for (const migration of migrations) {
			if (!migration.migrated) {
				await migration.migrate();
				Logger.logSuccess(`Migrated '${migration.name}'`, {
					prefix: "MIGRATION_MANAGER",
				});
			}
		}
	}

	static _initializeMigration(models, module) {
		const migration = new Migration({
			module,
		});

		for (const model of models) {
			migration.setDefineModelAction(model);
		}

		return migration;
	}

	/**
	 * @param {Migration[]} migrations
	 * @private
	 */
	static _getAppliedMigrations(migrations) {
		const notAppliedMigrations = [];
		let combinedMigration = migrations[0];

		if (migrations.length === 1 && !migrations[0].migrated) {
			notAppliedMigrations.push(migrations[0]);
			combinedMigration = null;
		} else {
			const accum = migrations.reduce((accum, curr) => {
				if (!curr.migrated) {
					notAppliedMigrations.push(curr);
				}
				accum.combineMigrations(curr);
				return accum;
			});

			combinedMigration = accum || combinedMigration;
		}

		return { notAppliedMigrations, combinedMigration };
	}

	/**
	 * @param {Migration} migration - combined migration
	 * @param {Model[]} models
	 * @private
	 */
	static _createNewMigration(migration, models) {
		const differentModels = this._compareMigrationWithModels(migration, models);
		if (Object.keys(differentModels).length === 0) {
			return null;
		}

		const migrationDir = migration.migrationDir;
		const index = migration.index + 1;
		const moduleName = migration.moduleName;
		return MigrationManager._createMigration(differentModels, migrationDir, moduleName, index);
	}

	static _compareMigrationWithModels(migration, models) {
		const comparedModels = {};

		for (const model of models) {
			const table = migration.tables.get(model.name);
			comparedModels[model.name] = MigrationManager._compareMigrationWithModel(
				table ? table[Migration.MIGRATE_ACTIONS.DEFINE_COLUMN] : null,
				model,
			);
		}

		const comparedModelsNames = Object.keys(comparedModels);
		for (const [tableName, data] of migration.tables.entries()) {
			if (!comparedModelsNames.includes(tableName)) {
				comparedModels[tableName] = MigrationManager._compareMigrationWithModel(
					data[Migration.MIGRATE_ACTIONS.DEFINE_COLUMN],
					null,
				);
			}
		}

		const differentModels = {};
		for (const [tableName, comparison] of Object.entries(comparedModels)) {
			if (comparison.comparisonRes !== COMPARE_MODELS.EQUAL) {
				differentModels[tableName] = comparison;
			}
		}

		return differentModels;
	}

	/**
	 * @param migrationColumns
	 * @param model
	 * @return {{comparisonRes: string, model: *}|{comparisonRes: string}|{data: {}, comparisonRes:
	 *     string, model: *}}
	 * @private
	 */
	static _compareMigrationWithModel(migrationColumns, model) {
		if (!(migrationColumns && Object.keys(migrationColumns).length)) {
			return { comparisonRes: COMPARE_MODELS.CREATED, model: model };
		}
		if (!model) {
			return { comparisonRes: COMPARE_MODELS.DELETED };
		}

		const differColumns = {};
		const comparedColumns = model.compare(migrationColumns);

		// If all columns differ, drop table
		let recreateTable = true;
		for (const [columnName, comparisonRes] of Object.entries(comparedColumns)) {
			if (comparisonRes !== ModelDescription.COMPARE_COLUMNS.EQUAL) {
				recreateTable = false;
				differColumns[columnName] = comparisonRes;
			}
		}

		if (Object.keys(differColumns).length === 0) {
			return { comparisonRes: COMPARE_MODELS.EQUAL };
		}

		return { model, data: differColumns, comparisonRes: COMPARE_MODELS.DIFFER, recreateTable };
	}

	static _createMigration(differentModels, migrationDir, moduleName, index) {
		const migration = new Migration({ migrationDir, moduleName, index });

		for (const [tableName, comparison] of Object.entries(differentModels)) {
			switch (comparison.comparisonRes) {
				case "CREATED": {
					migration.setDefineModelAction(comparison.model);
					break;
				}
				case "DELETED": {
					migration.setDeleteTableAction(tableName);
					break;
				}
				case "DIFFER": {
					if (comparison.recreateTable) {
						migration.setDeleteTableAction(tableName);
						migration.setDefineModelAction(comparison.model);
					} else {
						MigrationManager._migrateColumns(
							migration,
							comparison.data,
							comparison.model,
						);
					}
					break;
				}
			}
		}

		return migration;
	}

	static _migrateColumns(migration, defferColumns, model) {
		for (const [columnName, comparisonRes] of Object.entries(defferColumns)) {
			switch (comparisonRes) {
				case ModelDescription.COMPARE_COLUMNS.OTHER_COLUMN_NOT_DEFINED: {
					const columnDefinition = model._columns[columnName];
					migration.setDefineColumnAction(model.tableName, columnDefinition);
					break;
				}
				case ModelDescription.COMPARE_COLUMNS.THIS_COLUMN_NOT_DEFINED:
					migration.setDeleteColumnAction(model.tableName, columnName);
					break;
				case ModelDescription.COMPARE_COLUMNS.DIFFER: {
					const columnDefinition = model._columns[columnName];
					migration.setChangeColumnAction(model.tableName, columnDefinition);
					break;
				}
			}
		}
	}
}

module.exports = MigrationManager;
