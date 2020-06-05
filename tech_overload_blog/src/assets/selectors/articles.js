export function getFetchedArticles(state) {
	return Object.values(state.articles.fetched);
}

export function getFetchedArticle(state, verbose) {
	return state.articles.fetched[verbose];
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

export function getArticlesOffset(state) {
	return Object.values(state.articles.fetched).length;
}

export function getArticleComments(state) {
	return Object.values(state.articles.openedArticleComments);
}

export function getArticlesCommentsOffset(state) {
	return Object.values(state.articles.openedArticleComments).length;
}
