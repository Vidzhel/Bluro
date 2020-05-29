const FilesManager = require("./filesManager");

module.exports = function initFilesManager(options) {
	options.dependencyResolver.registerDependency({
		dependency: FilesManager,
		name: "FilesManager",
		singleton: true,
		setAsGlobal: true,
	});
};
