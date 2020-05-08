const dataTypesId = require("../base/dataTypes");

const DataTypesDefinition = {
	[dataTypesId.tinyInt]: () => "TINYINT",
	[dataTypesId.smallInt]: () => "SMALLINT",
	[dataTypesId.mediumInt]: () => "MEDIUMINT",
	[dataTypesId.int]: () => "INT",
	[dataTypesId.bigInt]: () => "BIGINT",

	[dataTypesId.bit]: (count = null) => (count ? `BIT(${count})` : "BIT"),

	[dataTypesId.float]: () => "FLOAT",
	[dataTypesId.double]: () => "DOUBLE",
	[dataTypesId.decimal]: (precision, scale) => `DECIMAL(${precision}, ${scale})`,

	[dataTypesId.varchar]: () => "VARCHAR",

	[dataTypesId.varBinary]: () => "VARCHAR",
	[dataTypesId.json]: () => "JSON",

	[dataTypesId.time]: () => "TIME",
	[dataTypesId.date]: () => "DATE",
	[dataTypesId.dateTime]: () => "DATETIME",
};

module.exports = DataTypesDefinition;
