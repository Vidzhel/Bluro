const id = require("./dataTypesId");

const DataTypesId = {
	TINY_INT: () => {
		return { id: id.TINY_INT };
	},
	SMALL_INT: () => {
		return { id: id.SMALL_INT };
	},
	MEDIUM_INT: () => {
		return { id: id.MEDIUM_INT };
	},
	INT: () => {
		return { id: id.INT };
	},
	BIG_INT: () => {
		return { id: id.BIG_INT };
	},

	/**
	 *
	 * @param {number?} size - number of bits, by default only one bit
	 * @returns {{size: number?, id: symbol}}
	 * @constructor
	 */
	BIT: (size) => {
		return { id: id.BIT, size };
	},

	FLOAT: () => {
		return { id: id.FLOAT };
	},
	DOUBLE: () => {
		return { id: id.DOUBLE };
	},
	/**
	 *
	 * @param {number} precision - overall number of digits
	 * @param {number} scale - number of digits to the right of the decimal point
	 * @returns {{precision: number, scale: number, id: symbol}}
	 * @constructor
	 */ DECIMAL: (precision, scale) => {
		return { id: id.DECIMAL, precision, scale };
	},

	/**
	 * @param {number} size - maximal size of string
	 * @returns {{size: number, id: symbol}}
	 * @constructor
	 */
	VARCHAR: (size) => {
		return { id: id.VARCHAR, size };
	},

	VARBINARY: () => {
		return { id: id.VARBINARY };
	},
	JSON: () => {
		return { id: id.JSON };
	},

	TIME: () => {
		return { id: id.TIME };
	},
	DATE: () => {
		return { id: id.DATE };
	},
	DATE_TIME: () => {
		return { id: id.DATE_TIME };
	},
};

module.exports = DataTypesId;
