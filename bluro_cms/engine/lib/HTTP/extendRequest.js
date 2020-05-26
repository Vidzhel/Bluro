const url = require("url");
const Busboy = require("busboy");

module.exports = function extendRequest(req) {
	req.request = req;
	req._chunks = [];
	req._ready = false;
	/**
	 * List of received and saved in the temp folder files
	 * @type {string[]}
	 */
	req.receivedFiles = [];

	req.fullUrl = req.url;
	req.urlParser = url.parse(req.url, true);
	req.query = req.urlParser.query;

	req.onData = function (callback) {
		if (req.method === "POST" && req.headers["content-type"] &&
			req.headers["content-type"].startsWith("multipart")) {
			req.handleFormSubmission()
			   .then(() => {
				   callback();
			   });
		} else {
			req.on("data", this._gotDataChunk.bind(this))
			   .on("end", this._dataReady.bind(this, callback),);
		}
	};

	req._gotDataChunk = function (chunk) {
		req._chunks.push(chunk);
	};

	req._dataReady = async function (callback) {
		req._ready = true;
		req.off("data", req._gotDataChunk);
		req.off("end", req._dataReady);
		callback();
	};

	req.getCookie = function (key) {
		return findCookie(key, req.headers["cookie"] || "");
	};

	req.handleFormSubmission = function () {
		return new Promise((resolve, reject) => {
			const handler = new Busboy({headers: req.headers});
			Logger.logInfo(`Start parsing form`, {
				config: "requests", prefix: "FORM_HANDLER",
			});

			handler.on("file", function (fieldname, stream, filename, encoding, mimetype) {
				Logger.logInfo(`Started receiving file '${filename}', field name '${fieldname}'`);
				FileManager.writeStream(stream, {
					mimetype, emitClose: true, isTemp: true, onFinish: function (tempFileName) {
						Logger.logSuccess(`Finished receiving file '${filename}'`, {
							config: "requests", prefix: "FORM_HANDLER",
						});

						req.receivedFiles.push(tempFileName);
					},
				});
			});

			handler.on(
				"field",
				function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype,) {
					Logger.logInfo(`Get field value '${fieldname}', value: ${val}`, {
						config: "requests", prefix: "FORM_HANDLER",
					});
				}
			);

			handler.on("error", (err) => {
				reject(err);
			});
			handler.on("finish", function () {
				Logger.logSuccess(`Finished parsing form`, {
					config: "requests", prefix: "FORM_HANDLER",
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
			return JSON.parse(req._chunks);
		} else {
			throw new Error("Request data hasn't been ready yet");
		}
	};
};
