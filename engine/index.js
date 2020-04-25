const initLib = require("./lib");

module.exports = function initEngine() {
	const options = {
		root: module.parent.path,
	};
	initLib(options);
};
