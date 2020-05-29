const Comment = require("./Comment");
const controllers = require("./controllers");

module.exports = function initComment(options) {
	const manager = options.modulesManager;

	const requireAuthorization = DependencyResolver.getDependency(null, "requireAuthorization");
	manager.connectModel(Comment);

	manager.connectRule("post", "/articles/{article}/comments", requireAuthorization);
	manager.connectRule(["put", "delete"], "/comments/{comment}", requireAuthorization);

	const {
		deleteCommentController,
		createCommentController,
		updateCommentController,
		getCommentsController,
		getCommentController,
	} = controllers;
	manager.connectRoute("post", "/articles/{article}/comments", createCommentController);
	manager.connectRoute("put", "/comments/{comment}", updateCommentController);
	manager.connectRoute("delete", "/comments/{comment}", deleteCommentController);
	manager.connectRoute("get", "/comments", getCommentsController);
	manager.connectRoute("get", "/articles/{article}/comments", getCommentsController);
	manager.connectRoute("get", "/comments/{comment}", getCommentController);
	manager.connectRoute("get", "/articles/{article}/comments/{comment}", getCommentController);
};
