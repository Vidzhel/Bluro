const User = require("./Models/User");

module.exports = function initAuth(options) {
	const manager = options.modulesManager;

	manager.connectModel(User);
	manager.connectRule("all", "/", (err, request, response, data) => {
		data.message = "hello from auth";
	});
	manager.connectRoute("all", "/", (request, response, data) => {
		response.write(data);
	});
};
