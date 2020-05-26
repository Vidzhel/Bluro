const fs = require("fs");
const {v1: uuid} = require("uuid");
const FILE_EXTENSION_FROM_CONTENT_TYPE = /^.*\/(.*?)(?:;.*)?$/i;

class FileManager {
	constructor() {
		const root = ConfigsManager.getEntry("root");
		this.filesRoot = root + "/files/";
		this.tempFilesRoot = this.filesRoot + "temp/";

		this.createDir(this.filesRoot);
		this.createDir(this.tempFilesRoot);
	}

	/**
	 * Creates dir if doesn't exists
	 * @param dirPath
	 */
	createDir(dirPath) {
		fs.access(dirPath, fs.constants.F_OK, (err) => {
			if (err) {
				fs.mkdirSync(dirPath);
			}
		});
	}

	/**
	 *
	 * @param stream
	 * @param {object} options
	 * @param {string} options.flags
	 * @param {string} options.encoding
	 * @param {boolean} options.autoClose
	 * @param {boolean} options.emitClose
	 * @param {boolean} options.isTemp
	 * @param {string} options.mimetype
	 * @param {function} options.onFinish
	 */
	writeStream(readStream, options) {
		const {isTemp, mimetype, onFinish} = options;

		const match = FILE_EXTENSION_FROM_CONTENT_TYPE.exec(mimetype);
		const fileExtension = match && match[1] ? match[1] : "octet-stream";
		const name = uuid() + "." + fileExtension;
		const filePath = isTemp ? this.tempFilesRoot + name : this.filesRoot + name;

		const writeStream = fs.createWriteStream(filePath, options);

		writeStream.on("close", function () {
			if (onFinish) {
				onFinish(name);
			}
		});

		readStream.pipe(writeStream);
	}
}

module.exports = FileManager;
