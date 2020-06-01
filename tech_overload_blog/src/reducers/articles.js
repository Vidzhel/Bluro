import { copyObject } from "./utilities";
import { ART_ASYNC } from "../assets/actionTypes/articles";

const defaultState = {
	fetched: {},
	editing: null,
	openedArticle: null,
	openedArticleContent: null,
};

export function articles(state = defaultState, action) {
	if (!Object.values(ART_ASYNC).includes(action.type)) {
		return state;
	}

	const newState = copyObject(state);

	switch (action.type) {
		case ART_ASYNC.GET_USERS_ARTICLES_ASYNC: {
			newState.fetched = {};
			for (const article of action.articles) {
				newState.fetched[article.verbose] = article;
			}
			break;
		}
		case ART_ASYNC.LOAD_ARTICLE_TO_EDIT_ASYNC: {
			newState.editing = action.article;
			break;
		}
		case ART_ASYNC.CREATE_ARTICLE_ASYNC: {
			newState.fetched[action.article.verbose] = action.article;
			break;
		}
		case ART_ASYNC.DELETE_ARTICLE_ASYNC: {
			if (newState.fetched[action.verbose]) {
				delete newState.fetched[action.verbose];
			}
			break;
		}
		case ART_ASYNC.UPDATE_ARTICLE_ASYNC: {
			const articleToUpdate = newState.fetched[action.verbose];

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
			newState.openedArticle = newState.fetched[action.verbose];
			break;
		}
		case ART_ASYNC.FETCH_ARTICLES_CONTENT_ASYNC: {
			newState.openedArticleContent = action.content;
			break;
		}
	}

	return newState;
}
