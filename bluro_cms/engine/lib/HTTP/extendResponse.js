module.exports = function extendResponse(res) {
	/**
	 * @type {{Unauth: number, Forbidden: number, InternalError: number, OK: number, BadReq: number, Accepted: number, Created: number, NotFound: number}}
	 */
	res.CODES = {
		OK: 200,
		Created: 201,
		Accepted: 202,
		BadReq: 400,
		Unauth: 401,
		Forbidden: 403,
		NotFound: 404,
		InternalError: 500,
	};

	res._chunks = {
		errors: [],
		success: [],
	};
	res._addChunk = function (type, chunk) {
		this._chunks[type].push(chunk);
	};

	res.error = function (error) {
		res._chunks.errors.push(error);

		if (!res.statusCode || res.statusCode === 200) {
			res.statusCode = res.CODES.BadReq;
		}
	};
	res.success = function (success) {
		res._chunks.success.push(success);
	};
	/**
	 *
	 * @param {CODES} code
	 */
	res.code = function (code) {
		res.statusCode = code;
	};

	res.send = function () {
		res.end(JSON.stringify(res._chunks));
	};
};
