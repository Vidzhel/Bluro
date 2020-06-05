import { copyObject } from "./utilities";
import { ART_ASYNC } from "../assets/actionTypes/articles";

const defaultState = {
	fetched: new Map(),
	editing: null,
	openedArticle: null,
	openedArticleContent: null,
	openedArticleComments: new Map(),
};

export function articles(state = defaultState, action) {
	if (!Object.values(ART_ASYNC).includes(action.type)) {
		return state;
	}

	const newState = copyObject(state);

	switch (action.type) {
		case ART_ASYNC.GET_USERS_ARTICLES_ASYNC: {
			newState.fetched = new Map();
			for (const article of action.articles) {
				newState.fetched.set(article.verbose, article);
			}
			break;
		}
		case ART_ASYNC.FETCH_CHUNK_OF_ARTICLES_ASYNC: {
			for (const article of action.articles) {
				newState.fetched.set(article.verbose, article);
			}
			break;
		}
		case ART_ASYNC.LOAD_ARTICLE_TO_EDIT_ASYNC: {
			newState.editing = action.article;
			break;
		}
		case ART_ASYNC.CREATE_ARTICLE_ASYNC: {
			const articlesIterator = newState.fetched.entries();
			newState.fetched = new Map();
			newState.fetched.set(action.article.verbose, action.article);

			for (const [param, val] of articlesIterator) {
				newState.fetched.set(param, val);
			}
			break;
		}
		case ART_ASYNC.DELETE_ARTICLE_ASYNC: {
			if (newState.fetched[action.verbose]) {
				newState.fetched.delete(action.verbose);
			}
			break;
		}
		case ART_ASYNC.UPDATE_ARTICLE_ASYNC: {
			const articleToUpdate = newState.fetched.get(action.verbose);

			if (articleToUpdate) {
				for (const [prop, val] of Object.entries(action.article)) {
					if (val !== void 0) {
						articleToUpdate[prop] = val;
					}
				}
			}

			break;
		}
		case ART_ASYNC.OPEN_ARTICLE_ASYNC: {
			newState.openedArticle = action.article;
			break;
		}
		case ART_ASYNC.FETCH_ARTICLES_CONTENT_ASYNC: {
			newState.openedArticleContent = action.content;
			break;
		}
		case ART_ASYNC.GET_ARTICLE_COMMENTS_ASYNC: {
			newState.openedArticleComments = new Map();
			for (const comment of action.comments) {
				newState.openedArticleComments.set(comment.id, comment);
			}
			break;
		}
		case ART_ASYNC.FETCH_CHUNK_OF_ARTICLE_COMMENTS_ASYNC: {
			for (const comment of action.comments) {
				newState.openedArticleComments.set(comment.id, comment);
			}
			break;
		}
		case ART_ASYNC.UPDATE_COMMENT_ASYNC:
			if (newState.openedArticleComments.get(action.comment.id)) {
				newState.openedArticleComments.get(action.comment.id).content =
					action.comment.content;
			}
			break;
		case ART_ASYNC.CREATE_COMMENT_ASYNC: {
			const commentsIterator = newState.openedArticleComments.entries();
			newState.openedArticleComments = new Map();
			newState.openedArticleComments.set(action.comment.id, action.comment);

			for (const [param, val] of commentsIterator) {
				newState.openedArticleComments.set(param, val);
			}
			break;
		}
		case ART_ASYNC.DELETE_COMMENT_ASYNC: {
			if (newState.openedArticleComments.get(action.id)) {
				delete newState.openedArticleComments.delete(action.id);
			}
			break;
		}
	}

	return newState;
}
