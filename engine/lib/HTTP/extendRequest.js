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

	request.json = function () {
		if (this._ready) {
			return JSON.parse(this._chunks);
		} else {
			throw new Error("Request data hasn't been ready yet");
		}
	};
};
