const id = require("./dataTypesId");

/**
 * @type {{FLOAT: (function(): {id: string}), TINY_INT: (function(*=, *=): {min: (null|number), max: (null|number), id: string}), DECIMAL: (function(number, number): {precision: number, scale: number, id: string}), JSON: (function(): {id: string}), TIME: (function(): {id: string}), BIT: (function(number=, number=, number=): {min: (number), size: number, max: (number), id: string}), INT: (function(*=, *=): {min: (null|number), max: (null|number), id: string}), MEDIUM_INT: (function(*=, *=): {min: (null|number), max: (null|number), id: string}), BIG_INT: (function(*=, *=): {min: (null), max: (null), id: string}), DATE: (function(): {id: string}), VARCHAR: (function(number, number=, number=, number=): {min: (number|number), size: number, max: (number), id: string, regExp: number}), VARBINARY: (function(): {id: string}), DOUBLE: (function(): {id: string}), DATE_TIME: (function(): {id: string}), SMALL_INT: (function(*=, *=): {min: (null|number), max: (null|number), id: string})}}
 */
const DataTypesId = {
	/**
	 *
	 * @param min
	 * @param max
	 * @return {{min: (number), max: (number), id: string}}
	 * @constructor
	 */
	TINY_INT: (min = null, max = null) => {
		checkNumeric(min, max, -128, 127);
		return { id: id.TINY_INT, min: min ? min : -128, max: max ? max : 127 };
	},
	/**
	 *
	 * @param min
	 * @param max
	 * @return {{min: (number), max: (number), id: string}}
	 * @constructor
	 */
	SMALL_INT: (min = null, max = null) => {
		checkNumeric(min, max, -32768, 32767);
		return { id: id.SMALL_INT, min: min ? min : -32768, max: max ? max : 32767 };
	},
	/**
	 *
	 * @param min
	 * @param max
	 * @return {{min: (number), max: (number), id: string}}
	 * @constructor
	 */
	MEDIUM_INT: (min = null, max = null) => {
		checkNumeric(min, max, -8388608, 8388607);
		return { id: id.MEDIUM_INT, min: min ? min : -8388608, max: max ? max : 8388607 };
	},
	/**
	 *
	 * @param min
	 * @param max
	 * @return {{min: (number), max: (number), id: string}}
	 * @constructor
	 */
	INT: (min = null, max = null) => {
		checkNumeric(min, max, -2147483648, 2147483647);
		return { id: id.INT, min: min ? min : -2147483648, max: max ? max : 2147483647 };
	},
	/**
	 *
	 * @param min
	 * @param max
	 * @return {{min: (number), max: (number), id: string}}
	 * @constructor
	 */ BIG_INT: (min = null, max = null) => {
		const actualMin = -Math.pow(2, -63);
		const actualMax = Math.pow(2, 63) - 1;
		checkNumeric(min, max, actualMin, actualMax);
		return { id: id.BIG_INT, min: min ? min : actualMin, max: max ? max : actualMax };
	},

	/**
	 *
	 * @param {number?} size - number of bits, by default only one bit
	 * @param {number} min
	 * @param {number} max
	 * @returns {{size: number?, id: symbol, min: number, max:number}}
	 * @constructor
	 */
	BIT: (size, min = null, max = null) => {
		if (size < 1 || size > 64) {
			throw new Error("Bit can have size between 1 and 64");
		}

		const actualMin = -Math.pow(2, -size);
		const actualMax = Math.pow(2, size) - 1;
		checkNumeric(min, max, actualMin, actualMax);

		return { id: id.BIT, size, min: min ? min : actualMin, max: max ? max : actualMax };
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
	 */
	DECIMAL: (precision, scale) => {
		return { id: id.DECIMAL, precision, scale };
	},

	/**
	 * @param {number} min
	 * @param {number} max
	 * @param {number} size - maximal size of string
	 * @param {number} regExp - validate string
	 * @returns {{size: number, id: symbol}}
	 * @constructor
	 */
	VARCHAR: (size, regExp = null, min = null, max = null) => {
		if (regExp && !(regExp instanceof RegExp)) {
			throw new Error("regExp have to be instanc of RegExp");
		}
		return { id: id.VARCHAR, size, min: min ? min : 0, max: max ? max : size, regExp };
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

function checkNumeric(min, max, actualMin, actualMax) {
	if (min && !(min < actualMin || min > actualMax)) {
		throw new Error("Wrong min boundary");
	}
	if (max && !(max < actualMin || max > actualMax)) {
		throw new Error("Wrong max boundary");
	}
	if (max < min) {
		throw new Error("Wrong diapason specified");
	}
}

module.exports = DataTypesId;
