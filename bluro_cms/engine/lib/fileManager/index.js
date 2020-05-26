const FileManager = require("./fileManager");

module.exports = function initFileManager(options) {
	options.dependencyResolver.registerDependency({
		dependency: FileManager, name: "FileManager", singleton: true, setAsGlobal: true,
	});
};
