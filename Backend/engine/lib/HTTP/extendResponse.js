module.exports = function extendResponse(res) {
	res._chunks = {
		status: {
			errors: [],
			success: [],
		},
	};
	res._addChunk = function (type, chunk) {
		this._chunks[type].push(chunk);
	};

	res.error = function (error) {
		res._chunks.status.errors.push(error);
	};
	res.success = function (success) {
		res._chunks.status.success.push(success);
	};

	res.send = function () {
		res.end(JSON.stringify(res._chunks));
	};
};
