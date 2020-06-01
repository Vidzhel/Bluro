const Article = require("./Article");
const User = DependencyResolver.getDependency(null, "User");

const { v1: uuid } = require("uuid");

const FILES_LOCATION = {
	IMAGES: "articles/images",
	TEXT: "articles/text",
};

async function getArticles(req, res, data) {
	const count = parseInt(req.query.count) || 10;
	const offset = parseInt(req.query.offset) || 0;
	const publishedOnly = req.query.published ? req.query.published === "true" : true;
	const user = data.params.verbose;
	let results;

	if (!user) {
		const articlesSet = Article.selector
			.orderBy({ dateOfPublishing: "DESC" })
			.limit(offset, count);
		if (publishedOnly) {
			articlesSet.filter({ state: Article.STATES.PUBLISHED });
		}
		const set = await articlesSet.fetch();
		results = await set.getList();
	} else {
		const usersSet = await User.selector.filter({ verbose: user }).fetch();
		const userInstance = usersSet.get(0);

		if (!usersSet.length) {
			res.error("User doesn't exist");
			res.code(res.CODES.NotFound);
			return;
		}

		const articlesSet = Article.selector
			.filter({ user: userInstance.id })
			.orderBy({ dateOfPublishing: "DESC" })
			.limit(offset, count);
		if (publishedOnly) {
			articlesSet.filter({ state: Article.STATES.PUBLISHED });
		}
		const set = await articlesSet.fetch();
		results = await set.getList();
	}

	res.setCollection(results, offset, count);
}

async function getArticle(req, res, data) {
	const id = data.params.id;

	const articles = await Article.selector.filter({ verbose: id }).fetch();
	let article = await articles.getList();
	article = article[0];

	if (!article) {
		res.error("Article with the given id doesn't exist");
		res.code(res.CODES.NotFound);
		res.setEntry(null);
	} else {
		res.setEntry(article);
	}
}

async function createArticle(req, res, data) {
	await changeAmbiguousVerbose(data);
	let { state, description, title, verbose } = data.reqData;
	state = state || Article.STATES.PENDING_PUBLISHING;

	const article = {
		user: data.session.id,
		verbose: verbose || uuid(),
		dateOfPublishing: state === Article.STATES.PUBLISHED ? new Date() : null,
		dateOfChanging: new Date(),
		title,
		description,
		state,
		textSourceName: data.files["content"] || null,
		previewImageName: data.files["previewImg"] || null,
	};

	const result = Article.validateValues(article);
	if (result.fail) {
		res.error(result.description);
		res.code(res.CODES.BadReq);
		return;
	}

	await FilesManager.persistTempFile(data.files["content"], FILES_LOCATION.TEXT);
	await FilesManager.persistTempFile(data.files["previewImg"], FILES_LOCATION.IMAGES);

	const articleInstance = new Article(article);
	await articleInstance.save();

	res.code(res.CODES.Created);
}

async function updateArticle(req, res, data) {
	const id = data.params.id;

	const set = await Article.selector
		.filter({
			verbose: id,
		})
		.fetch();

	if (!(await checkRights(res, set.get(0), data))) {
		return;
	}

	await changeAmbiguousVerbose(data);
	let { description, title, verbose, state } = data.reqData;
	const article = {
		verbose: verbose || undefined,
		dateOfPublishing: state === Article.STATES.PUBLISHED ? new Date() : undefined,
		dateOfChanging: new Date(),
		title: title,
		description: description,
		state,
		textSourceName: data.files["content"],
		previewImageName: data.files["previewImg"],
	};

	const result = Article.validateValues(article, true);
	if (result.fail) {
		res.error(result.description);
		res.code(res.CODES.BadReq);
		return;
	}

	if (article.textSourceName) {
		await FilesManager.persistTempFile(data.files["content"], FILES_LOCATION.TEXT);
	}
	if (article.previewImageName) {
		await FilesManager.persistTempFile(data.files["previewImg"], FILES_LOCATION.IMAGES);
	}

	await Article.update(article, { verbose: id });
}

async function deleteArticle(req, res, data) {
	const id = data.params.id;

	const set = await Article.selector
		.filter({
			verbose: id,
		})
		.fetch();
	const article = set.get(0);
	if (!(await checkRights(res, article, data))) {
		return;
	}

	await Article.del({
		verbose: id,
	});

	const textPath = FilesManager.getFilePath(FILES_LOCATION.TEXT + "/" + article.textSourceName);
	await FilesManager.deleteFile(textPath);
	const imagePath = FilesManager.getFilePath(
		FILES_LOCATION.IMAGES + "/" + article.previewImageName,
	);
	await FilesManager.deleteFile(imagePath);
}

async function changeAmbiguousVerbose(data) {
	if (data.reqData.verbose) {
		// Check on duplicated verbose name
		const set = await Article.selector.filter({ verbose: data.reqData.verbose }).fetch();

		if (set.length !== 0) {
			data.reqData.verbose += uuid();
		}
	}
}

async function checkRights(res, article, data) {
	if (!article) {
		res.error("Article doesn't exist");
		res.code(res.CODES.NotFound);
		return false;
	}

	const users = await Article.selector.fetchRelated({ thisModel: article, columnName: "user" });
	const user = users.get(0);

	if (data.session.role !== "ADMIN" && data.session.email !== user.email) {
		res.error("You don't have rights to delete the article");
		res.code(res.CODES.Forbidden);
		return false;
	}

	return true;
}

module.exports.getArticles = getArticles;
module.exports.getArticle = getArticle;
module.exports.createArticle = createArticle;
module.exports.deleteArticle = deleteArticle;
module.exports.updateArticle = updateArticle;
