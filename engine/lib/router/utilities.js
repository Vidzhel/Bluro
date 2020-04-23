"use strict";
let segment = RegExp("(?:/([0-9a-zA-Z-._~]+))", "g");
// let segmentWithExpr = RegExp("(?:/(\\S+))", "g");

module.exports.splitPath = function (path) {
	let match = segment.exec(path);
	const res = [];
	while (match !== null) {
		res.push(match[1]);
		match = segment.exec(path);
	}

	return res;
};

module.exports.splitPathWithExpr = function (path) {
	return path.split("/").filter((str) => str.length);
};
