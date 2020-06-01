const Article = require("./Article");
const controllers = require("./controllers");

module.exports = function initAuth(options) {
	const manager = options.modulesManager;
	DependencyResolver.registerType({ dependency: Article });

	const requireAuthorization = DependencyResolver.getDependency(null, "requireAuthorization");
	FilesManager.createDir("articles");
	FilesManager.createDir("articles/text");
	FilesManager.createDir("articles/images");

	manager.connectModel(Article);

	manager.connectRule(["delete", "put"], "/articles/{id}", requireAuthorization);
	manager.connectRule("post", "/articles", requireAuthorization);

	manager.connectRoute("get", "/articles", controllers.getArticles);
	manager.connectRoute("get", "profiles/{verbose}/articles", controllers.getArticles);
	manager.connectRoute("get", "/articles/{id}", controllers.getArticle);
	manager.connectRoute("post", "/articles", controllers.createArticle);
	manager.connectRoute("delete", "/articles/{id}", controllers.deleteArticle);
	manager.connectRoute("put", "/articles/{id}", controllers.updateArticle);
};
