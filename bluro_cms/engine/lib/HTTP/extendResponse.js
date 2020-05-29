const fs = require("fs");
const mime = require("mime-types");
const FILE_EXTENSION_FROM_CONTENT_TYPE = /^.*\/(.*?)(?:;.*)?$/i;

module.exports = function extendResponse(res) {
	/**
	 * @type {{Unauth: number, Forbidden: number, InternalError: number, OK: number, BadReq:
	 *     number, Accepted: number, Created: number, NotFound: number}}
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

	res.filesToSend = null;
	res._chunks = { errors: [], success: [], info: [] };

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

	res.info = function (info) {
		res._chunks.info.push(info);
	};

	res.setCookie = function (key, val) {
		return res.setHeader("Set-Cookie", `${key}:${val}`);
	};

	res.setCredentials = function (credentials) {
		res._chunks.session = {
			...res._chunks.session,
			...credentials,
		};
	};

	res.setCollection = function (data, offset, count) {
		res._chunks.collection = {
			data,
			offset,
			count,
			actualCount: data ? data.length : 0,
		};
	};

	res.setEntry = function (entry) {
		res._chunks.entry = entry;
	};
	/**
	 *
	 * @param {CODES} code
	 */
	res.code = function (code) {
		res.statusCode = code;
	};

	res.setFile = async function (filePath) {
		const exists = await FilesManager.fileExists(filePath);

		if (exists) {
			res.fileToSend = filePath;
		} else {
			throw new Error(`Can't get access to the following file '${filePath}'`);
		}
	};

	res.send = async function () {
		if (this.fileToSend) {
			await res._sendFile(this.fileToSend);
		}

		res.end(JSON.stringify(res._chunks));
	};

	res._sendFile = async function (filePath) {
		const stat = await fs.promises.stat(filePath);

		const match = FILE_EXTENSION_FROM_CONTENT_TYPE.exec(filePath);
		const fileExtension = match && match[1] ? match[1] : "octet-stream";
		res.writeHead(res.statusCode, {
			"Content-Length": stat.size,
			"Content-Type": mime.lookup(fileExtension),
		});

		return new Promise((resolve) => {
			const readFile = fs.createReadStream(filePath);
			readFile.pipe(res);

			readFile.once("close", () => {
				resolve();
			});
		});
	};
};
