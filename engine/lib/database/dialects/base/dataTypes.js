const DataTypesId = {
	tinyInt: Symbol("tinyInt"),
	smallInt: Symbol("smallInt"),
	mediumInt: Symbol("mediumInt"),
	int: Symbol("int"),
	bigInt: Symbol("bigInt"),

	bit: Symbol("bit"),

	float: Symbol("float"),
	double: Symbol("double"),
	decimal: Symbol("decimal"),

	varchar: Symbol("varchar"),

	varBinary: Symbol("varBinary"),
	json: Symbol("json"),

	time: Symbol("time"),
	date: Symbol("date"),
	dateTime: Symbol("dateTime"),
};

module.exports = DataTypesId;
