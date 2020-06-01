export function getFetchedArticles(state) {
	return Object.values(state.articles.fetched);
}

export function getEditingArticle(state) {
	return state.articles.editing;
}

export function getOpenedArticle(state) {
	return state.articles.openedArticle;
}

export function getArticleContent(state) {
	return state.articles.openedArticleContent;
}
