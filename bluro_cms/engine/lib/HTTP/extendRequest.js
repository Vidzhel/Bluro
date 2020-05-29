const url = require("url");
const Busboy = require("busboy");

const FORM_FIELD_TYPE = {
	FILE: "FILE",
	VALUE: "VALUE",
};

module.exports = function extendRequest(req) {
	req.request = req;
	req._chunks = [];
	req._ready = false;

	req.isFromReq = false;
	/**
	 * List of received and saved in the temp folder files
	 * @type {string[]}
	 */
	req.receivedFiles = [];
	/**
	 *
	 * @type {object} formData
	 * @type {object} fieldName
	 * @type {string} formData.fieldName.type
	 * @type {string} formData.fieldName.val
	 * @type {string} formData.fieldName.name
	 */
	req.formData = {};

	req.fullUrl = req.url;
	req.urlParser = url.parse(req.url, true);
	req.query = req.urlParser.query;

	req.onData = function (callback) {
		return new Promise((resolve, reject) => {
			if (
				req.headers["content-type"] &&
				req.headers["content-type"].startsWith("multipart")
			) {
				req.isFromReq = true;
				req.handleFormSubmission().then(() => {
					const res = callback();
					if (res instanceof Promise) {
						res.then(() => resolve()).catch((e) => reject(e));
					} else {
						resolve();
					}
				});
			} else {
				req.on("data", this._gotDataChunk.bind(this)).on("end", () => {
					this._dataReady.call(this);

					const res = callback();
					if (res instanceof Promise) {
						res.then(() => resolve()).catch((e) => reject(e));
					} else {
						resolve();
					}
				});
			}
		});
	};

	req._gotDataChunk = function (chunk) {
		req._chunks.push(chunk);
	};

	req._dataReady = function () {
		req._ready = true;
		req.off("data", req._gotDataChunk);
		req.off("end", req._dataReady);
	};

	req.getCookie = function (key) {
		return findCookie(key, req.headers["cookie"] || "");
	};

	req.handleFormSubmission = function () {
		return new Promise((resolve, reject) => {
			const handler = new Busboy({ headers: req.headers });
			Logger.logInfo(`Start parsing form`, {
				config: "requests",
				prefix: "FORM_HANDLER",
			});

			handler.on("file", function (fieldname, stream, filename, encoding, mimetype) {
				Logger.logInfo(`Started receiving file '${filename}', field name '${fieldname}'`);
				const tempFileName = FilesManager.writeStream(stream, {
					mimetype,
					emitClose: true,
					isTemp: true,
				});

				if (stream.readable) {
					stream.on("end", fileReceivedHandler);
				} else {
					fileReceivedHandler();
				}

				function fileReceivedHandler() {
					Logger.logSuccess(`Finished receiving file '${filename}'`, {
						config: "requests",
						prefix: "FORM_HANDLER",
					});

					req.receivedFiles.push(tempFileName);
					req.formData[fieldname] = {
						type: FORM_FIELD_TYPE.FILE,
						val: tempFileName,
					};
				}
			});

			handler.on("field", function (
				fieldname,
				val,
				fieldnameTruncated,
				valTruncated,
				encoding,
				mimetype,
			) {
				req.formData[fieldname] = {
					type: FORM_FIELD_TYPE.VALUE,
					val,
				};

				Logger.logInfo(`Get field value '${fieldname}', value: ${val}`, {
					config: "requests",
					prefix: "FORM_HANDLER",
				});
			});

			handler.on("error", (err) => {
				reject(err);
			});
			handler.on("finish", function () {
				Logger.logSuccess(`Finished parsing form`, {
					config: "requests",
					prefix: "FORM_HANDLER",
				});
				resolve();
			});

			req.pipe(handler);
		});
	};

	function findCookie(key, cookies) {
		const regExp = new RegExp(`;?${key}:(.*);?`);
		const res = regExp.exec(cookies);
		if (res) {
			return res[1] || null;
		}

		return null;
	}

	req.json = function () {
		if (req._ready) {
			if (req._chunks.length) {
				return JSON.parse(req._chunks);
			}
		} else {
			throw new Error("Request data hasn't been ready yet");
		}

		return {};
	};
};
