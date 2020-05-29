const Article = DependencyResolver.getDependency(null, "Article");
const Comment = require("./Comment");

async function createCommentController(req, res, data) {
	const articleVerbose = data.params.article;
	const set = await Article.selector.filter({ verbose: articleVerbose }).fetch();
	const article = set.get(0);

	if (!article) {
		res.error("Article doesn't exist");
		res.code(res.CODES.NotFound);
		return;
	}

	const date = new Date();
	const commentData = {
		user: data.session.id,
		article: article.id,
		content: data.reqData.content,
		creationDate: date,
		lastUpdateDate: date,
	};

	const validationResult = Comment.validateValues(commentData);
	if (validationResult.fail) {
		res.error(validationResult.description);
		res.code(res.CODES.BadReq);
		return;
	}

	const comment = new Comment(commentData, true);
	await comment.save();
}

async function updateComment(req, res, data) {
	const id = data.params.comment;

	const set = await Comment.selector.filter({ id }).fetch();
	const comment = set.get(0);
	if (!comment) {
		res.error("Comment doesn't exist");
		res.code(res.CODES.NotFound);
		return;
	}

	if (!checkRights(res, comment, data)) {
		return;
	}

	const commentData = {
		content: data.reqData.content,
		lastUpdateDate: new Date(),
	};

	const validationResult = Comment.validateValues(commentData, true);
	if (validationResult.fail) {
		res.error(validationResult.description);
		res.code(res.CODES.BadReq);
		return;
	}

	await Comment.update(commentData, { id });
}

async function deleteComment(req, res, data) {
	const id = data.params.comment;

	const set = await Comment.selector.filter({ id }).fetch();
	const comment = set.get(0);
	if (!comment) {
		res.error("Comment doesn't exist");
		res.code(res.CODES.NotFound);
		return;
	}

	if (!checkRights(res, comment, data)) {
		return;
	}

	await comment.del();
}

function checkRights(res, comment, data) {
	if (data.session.role !== "ADMIN" && comment.user !== data.session.id) {
		res.error("You don't have rights to change the comment");
		res.code(res.CODES.Forbidden);
		return false;
	}

	return true;
}

async function getComments(req, res, data) {
	const articleVerbose = data.params.article;
	const count = parseInt(req.query.count) || 10;
	const offset = parseInt(req.query.offset) || 0;

	if (articleVerbose) {
		const articlesSet = await Article.selector.filter({ verbose: articleVerbose }).fetch();
		if (articlesSet.length === 0) {
			res.error("Article doesn't exist");
			res.code(res.CODES.NotFound);
			return;
		}
		const article = articlesSet.get(0);

		const commentsSet = await Comment.selector
			.filter({ article: article.id })
			.orderBy({ creationDate: "DESC" })
			.limit(offset, count)
			.fetch();

		res.setCollection(await commentsSet.getList(), offset, count);
	} else {
		const commentsSet = await Comment.selector
			.orderBy({ creationDate: "DESC" })
			.limit(offset, count)
			.fetch();

		res.setCollection(await commentsSet.getList(), offset, count);
	}
}

async function getComment(req, res, data) {
	const articleVerbose = data.params.article;
	const commentId = data.params.comment;

	if (articleVerbose) {
		const articlesSet = await Article.selector.filter({ verbose: articleVerbose }).fetch();
		if (articlesSet.length === 0) {
			res.error("Article doesn't exist");
			res.code(res.CODES.NotFound);
			return;
		}
		const article = articlesSet.get(0);

		const commentsSet = await Comment.selector
			.filter({ article: article.id, id: commentId })
			.fetch();
		if (!commentsSet.length) {
			res.error("Comment doesn't exist");
			res.code(res.CODES.NotFound);
			return;
		}

		res.setEntry(await commentsSet.getList());
	} else {
		const commentsSet = await Comment.selector.filter({ id: commentId }).fetch();

		if (!commentsSet.length) {
			res.error("Comment doesn't exist");
			res.code(res.CODES.NotFound);
			return;
		}

		res.setEntry(await commentsSet.getList());
	}
}

module.exports.createCommentController = createCommentController;
module.exports.updateCommentController = updateComment;
module.exports.deleteCommentController = deleteComment;
module.exports.getCommentsController = getComments;
module.exports.getCommentController = getComment;
