const id = require("../base/dataTypesId");

const DataTypesDefinition = {
	[id.TINY_INT]: () => "TINYINT",
	[id.SMALL_INT]: () => "SMALLINT",
	[id.MEDIUM_INT]: () => "MEDIUMINT",
	[id.INT]: () => "INT",
	[id.BIG_INT]: () => "BIGINT",

	[id.BIT]: ({ size }) => (size ? `BIT(${size})` : "BIT"),

	[id.FLOAT]: () => "FLOAT",
	[id.DOUBLE]: () => "DOUBLE",
	[id.DECIMAL]: ({ precision, scale }) => {
		if (!precision || !scale) {
			throw new Error("Precision and scale have to be specified for DECIMAL data type");
		}
		return `DECIMAL(${precision}, ${scale})`;
	},

	[id.VARCHAR]: ({ size }) => {
		if (!size) {
			throw new Error("Size have to be specified for VARCHAR data type");
		}
		return `VARCHAR(${size})`;
	},

	[id.VARBINARY]: () => "VARCHAR",
	[id.JSON]: () => "JSON",

	[id.TIME]: () => "TIME",
	[id.DATE]: () => "DATE",
	[id.DATE_TIME]: () => "DATETIME",
};

let a = DataTypesDefinition[id.VARCHAR];

module.exports = DataTypesDefinition;
