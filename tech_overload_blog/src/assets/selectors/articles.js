export function getFetchedArticles(state) {
	return Array.from(state.articles.fetched.values());
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
	return state.articles.fetched.size;
}

export function getArticleComments(state) {
	return Array.from(state.articles.openedArticleComments.values());
}

export function getArticlesCommentsOffset(state) {
	return state.articles.openedArticleComments.size;
}
