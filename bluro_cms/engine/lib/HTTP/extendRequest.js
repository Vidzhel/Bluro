module.exports = function extendRequest(request) {
	request.request = request;
	request._chunks = [];
	request._ready = false;

	request.onData = function (callback) {
		this.request.on("data", this._gotDataChunk.bind(this));
		this.request.on("end", this._dataReady.bind(this, callback));
	};

	request._gotDataChunk = function (chunk) {
		this._chunks.push(chunk);
	};

	request._dataReady = function (callback) {
		this._ready = true;
		callback();
	};

	request.getCookie = function (key) {
		return findCookie(key, request.headers["cookie"] || "");
	};

	function findCookie(key, cookies) {
		const regExp = new RegExp(`;?${key}:(.*);?`);
		const res = regExp.exec(cookies);
		if (res) {
			return res[1] || null;
		}

		return null;
	}

	request.json = function () {
		if (this._ready) {
			return JSON.parse(this._chunks);
		} else {
			throw new Error("Request data hasn't been ready yet");
		}
	};
};
