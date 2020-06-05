import { ART_ASYNC, ART_SYNC } from "../assets/actionTypes/articles";

export function getArticles(
	userVerbose,
	onlyPublishedArticles = true,
	fromStart = true,
	searchParams,
) {
	return {
		type: ART_SYNC.GET_USERS_ARTICLES,
		verbose: userVerbose,
		onlyPublishedArticles,
		fromStart,
		params: searchParams,
	};
}

export function createArticle(data) {
	return {
		type: ART_SYNC.CREATE_ARTICLE,
		data,
	};
}

export function updateArticle(verbose, data) {
	return {
		type: ART_SYNC.UPDATE_ARTICLE,
		verbose,
		data,
	};
}

export function deleteArticle(articleVerbose) {
	return {
		type: ART_SYNC.DELETE_ARTICLE,
		verbose: articleVerbose,
	};
}

export function openArticle(verbose) {
	return {
		type: ART_SYNC.OPEN_ARTICLE,
		verbose,
	};
}

export function createComment(articleVerbose, text) {
	return { type: ART_SYNC.CREATE_COMMENT, verbose: articleVerbose, text };
}

export function updateComment(commentId, text) {
	return { type: ART_SYNC.UPDATE_COMMENT, commentId, text };
}

export function deleteComment(commentId) {
	return { type: ART_SYNC.DELETE_COMMENT, commentId };
}

export function getArticlesComments(articleVerbose) {
	return { type: ART_SYNC.GET_ARTICLE_COMMENTS, verbose: articleVerbose };
}

export function fetchNextChunkOfComments(articleVerbose) {
	return { type: ART_SYNC.FETCH_CHUNK_OF_ARTICLE_COMMENTS, verbose: articleVerbose };
}
