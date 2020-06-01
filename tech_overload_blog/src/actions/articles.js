import { ART_ASYNC, ART_SYNC } from "../assets/actionTypes/articles";

export function getUsersArticles(userVerbose, onlyPublishedArticles = true) {
	return {
		type: ART_SYNC.GET_USERS_ARTICLES,
		verbose: userVerbose,
		onlyPublishedArticles,
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
		type: ART_ASYNC.OPEN_ARTICLE_ASYNC,
		verbose,
	};
}

export function fetchArticleContent(fileName) {
	return {
		type: ART_SYNC.FETCH_ARTICLES_CONTENT,
		fileName,
	};
}
