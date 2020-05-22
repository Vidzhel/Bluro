const COMPARE_COLUMNS = {
	EQUAL: "EQUAL",
	DIFFER: "DIFFER",
	THIS_COLUMN_NOT_DEFINED: "THIS_COLUMN_NOT_DEFINED",
	OTHER_COLUMN_NOT_DEFINED: "OTHER_COLUMN_NOT_DEFINED",
};

class ModelDescription {
	static COMPARE_COLUMNS = COMPARE_COLUMNS;

	constructor(model) {
		this.tableName = model.name;
		/**
		 * @type {columnDefinition[]}
		 */
		this.columns = model._columns;
	}

	/**
	 *
	 * @param {columnDefinition[]} columns
	 * @returns {object}
	 */
	compare(columns) {
		const comparedColumns = {};
		for (const [columnName, thisColumnDefinition] of Object.entries(this.columns)) {
			comparedColumns[columnName] = this._compareColumn(
				thisColumnDefinition,
				columns[columnName],
			);
		}

		const checkedColumns = Object.keys(comparedColumns);
		for (const [columnName, columnDef] of Object.entries(columns)) {
			if (!checkedColumns.includes(columnName)) {
				comparedColumns[columnName] = this._compareColumn(
					this.columns[columnName],
					columnDef,
				);
			}
		}

		return comparedColumns;
	}

	_compareColumn(thisColumn, otherColumn) {
		if (!otherColumn) {
			return COMPARE_COLUMNS.OTHER_COLUMN_NOT_DEFINED;
		}
		if (!thisColumn) {
			return COMPARE_COLUMNS.OTHER_COLUMN_NOT_DEFINED;
		}

		if (
			thisColumn.default !== otherColumn.default ||
			thisColumn.nullable != otherColumn.nullable ||
			thisColumn.autoincrement != otherColumn.autoincrement ||
			thisColumn.primaryKey != otherColumn.primaryKey ||
			thisColumn.unique != otherColumn.unique ||
			!!thisColumn.foreignKey !== !!otherColumn.foreignKey
		) {
			return COMPARE_COLUMNS.DIFFER;
		}

		const allTypeProps = Object.keys(Object.assign({}, thisColumn.type, otherColumn.type));
		for (const column of allTypeProps) {
			if (thisColumn.type[column] !== otherColumn.type[column]) {
				return COMPARE_COLUMNS.DIFFER;
			}
		}

		if (
			thisColumn.foreignKey &&
			(thisColumn.foreignKey.columnName !== otherColumn.foreignKey.columnName ||
				thisColumn.foreignKey.tableName !== otherColumn.foreignKey.tableName)
		) {
			return COMPARE_COLUMNS.DIFFER;
		}

		return COMPARE_COLUMNS.EQUAL;
	}
}

module.exports = ModelDescription;
