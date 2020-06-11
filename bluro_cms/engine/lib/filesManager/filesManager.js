const fs = require("fs");
const { v1: uuid } = require("uuid");
const FILE_EXTENSION_FROM_CONTENT_TYPE = /^.*\/(.*?)(?:;.*)?$/i;

class FilesManager {
	constructor() {
		const root = ConfigsManager.getEntry("root");
		this.filesRoot = root + "/files/";
		this.tempFilesRoot = this.filesRoot + "temp/";

		this._createDir(this.filesRoot);
		this._createDir(this.tempFilesRoot);
	}

	/**
	 * Creates dir if doesn't exists
	 * @param dirPath
	 */
	_createDir(dirPath) {
		try {
			fs.accessSync(dirPath, fs.constants.F_OK);
		} catch (e) {
			fs.mkdirSync(dirPath);
		}
	}

	createDir(name, isTemp) {
		this._createDir(this._getPath(name, isTemp));
	}

	getFilePath(name, isTemp) {
		if (isTemp) {
			return this.tempFilesRoot + name;
		}

		return this.filesRoot + name;
	}

	moveToPersistentStorage(name) {}

	deleteFile(path) {
		return fs.promises.unlink(path);
	}

	resourceExists(path, isTemp) {
		let dirPath = isTemp ? this.tempFilesRoot : this.filesRoot;
		dirPath += path;

		return fs.promises
			.access(dirPath, fs.constants.F_OK)
			.then(() => true)
			.catch(() => false);
	}

	fileExists(filePath) {
		return fs.promises
			.access(filePath, fs.constants.F_OK)
			.then(() => true)
			.catch(() => false);
	}

	_getPath(name, isTemp) {
		const root = isTemp ? this.tempFilesRoot : this.filesRoot;
		return root + name;
	}

	/**
	 *
	 * @param stream
	 * @param {object} options
	 * @param {string} options.flags
	 * @param {boolean} options.autoClose
	 * @param {boolean} options.emitClose
	 * @param {boolean} options.isTemp
	 * @param {string} options.mimetype
	 */
	writeStream(readStream, options) {
		const { isTemp, mimetype, onFinish } = options;

		const match = FILE_EXTENSION_FROM_CONTENT_TYPE.exec(mimetype);
		const fileExtension = match && match[1] ? match[1] : "octet-stream";
		const name = uuid() + "." + fileExtension;
		const filePath = isTemp ? this.tempFilesRoot + name : this.filesRoot + name;

		const writeStream = fs.createWriteStream(filePath, options);

		writeStream.on("close", () => {
			if (onFinish) {
				onFinish(name);
			}
		});

		readStream.pipe(writeStream);

		return name;
	}

	async persistTempFile(fileName, path) {
		const tempFilePath = this.tempFilesRoot + fileName;
		const dir = this.filesRoot + path;
		const filePath = dir + "/" + fileName;

		fs.access(dir, fs.constants.F_OK, (err) => {
			if (err) {
				throw new Error(`Directory '${dir}' doesn't exist`);
			}
		});

		return new Promise((resolve, reject) => {
			this.move(tempFilePath, filePath, () => {
				resolve();
			});
		});
	}

	async clearTemp() {
		const handler = await fs.promises.opendir(this.tempFilesRoot);

		for await (const tempFile of handler) {
			await fs.promises.unlink(this.tempFilesRoot + tempFile.name);
		}

		Logger.logInfo("Cleared temp files", { prefix: "FILE_MANAGER" });
	}

	move(oldPath, newPath, callback) {
		fs.rename(oldPath, newPath, function (err) {
			if (err) {
				if (err.code === "EXDEV") {
					copy();
				} else {
					callback(err);
				}
				return;
			}
			callback();
		});

		function copy() {
			const readStream = fs.createReadStream(oldPath);
			const writeStream = fs.createWriteStream(newPath);

			readStream.on("error", callback);
			writeStream.on("error", callback);

			readStream.on("close", function () {
				fs.unlink(oldPath, callback);
			});

			readStream.pipe(writeStream);
		}
	}
}

module.exports = FilesManager;
