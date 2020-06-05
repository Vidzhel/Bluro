import { call, put, takeLatest, select, fork } from "redux-saga/effects";
import { ART_SYNC, ART_ASYNC } from "../assets/actionTypes/articles";
import {
	makeRequest,
	sendForm,
	isCurrentUser,
	fetchFile,
	toShortDate,
	getOffset,
	formatQueryString,
	CHUNK_DATA_COUNT,
} from "./utilities";
import { configs } from "../assets/configs";
import { getChosenProfile } from "../assets/selectors/profile";
import {
	getArticlesCommentsOffset,
	getArticlesOffset,
	getFetchedArticle,
	getOpenedArticle,
} from "../assets/selectors/articles";
import { processUserData } from "./profile";
import { getCurrentUserInfo } from "../assets/selectors/session";
import {
	ARTICLE_STATE_PUBLISH,
	FOLLOW_NOTIFICATION,
	NEW_COMMENT_NOTIFICATION,
	NEW_PUBLICATION_NOTIFICATION,
	UNFOLLOW_NOTIFICATION,
} from "../assets/constants";
import { createNotification } from "../actions/session";

export function* articlesWatcher() {
	yield takeLatest(ART_SYNC.GET_USERS_ARTICLES, getUsersArticles);

	yield takeLatest(ART_SYNC.OPEN_ARTICLE, openArticle);
	yield takeLatest(ART_SYNC.CREATE_ARTICLE, createArticle);
	yield takeLatest(ART_SYNC.UPDATE_ARTICLE, updateArticle);
	yield takeLatest(ART_SYNC.DELETE_ARTICLE, deleteArticle);

	yield takeLatest(ART_SYNC.FETCH_ARTICLES_CONTENT, fetchArticleContent);

	yield takeLatest(ART_SYNC.GET_ARTICLE_COMMENTS, getArticleComments);
	yield takeLatest(ART_SYNC.FETCH_CHUNK_OF_ARTICLE_COMMENTS, fetchChunkOfArticlesComments);
	yield takeLatest(ART_SYNC.CREATE_COMMENT, createComment);
	yield takeLatest(ART_SYNC.UPDATE_COMMENT, updateComment);
	yield takeLatest(ART_SYNC.DELETE_COMMENT, deleteComment);
}

function* getUsersArticles({ verbose, onlyPublishedArticles, fromStart, params }) {
	const offset = yield call(getOffset, fromStart, getArticlesOffset);
	let queryString = formatQueryString(offset, params);
	queryString += onlyPublishedArticles ? "" : "&published=false";

	const endpoint = verbose
		? `${configs.endpoints.userArticles(verbose)}${queryString}`
		: `${configs.endpoints.articles}${queryString}`;

	const { failure, data } = yield call(makeRequest, endpoint, {
		method: "GET",
	});

	if (!failure) {
		if (fromStart) {
			yield put({
				type: ART_ASYNC.GET_USERS_ARTICLES_ASYNC,
				articles: yield call(convertArticlesData, data.collection.data),
			});
		} else {
			yield put({
				type: ART_ASYNC.FETCH_CHUNK_OF_ARTICLES_ASYNC,
				articles: yield call(convertArticlesData, data.collection.data),
			});
		}
	}
}

function* openArticle({ verbose }) {
	const store = yield select();
	let article = yield call(getFetchedArticle, store, verbose);

	if (!article) {
		const { failure, data } = yield call(
			makeRequest,
			`${configs.endpoints.articles}/${verbose}`,
			{
				method: "GET",
			},
		);

		if (!failure) {
			article = yield call(convertArticleData, data.entry);
		}
	}

	if (article) {
		yield fork(fetchArticleContent, { fileName: article.textSourceName });
		yield put({
			type: ART_ASYNC.OPEN_ARTICLE_ASYNC,
			article,
		});
	}
}

function* createArticle({ data: articleData }) {
	const { failure, data } = yield call(
		sendForm,
		`${configs.endpoints.articles}}`,
		{
			method: "POST",
		},
		articleData,
	);

	if (!failure) {
		const state = yield select();
		const userData = yield call(getCurrentUserInfo, state);

		const chosenUser = yield call(getChosenProfile, state);
		const isUserChosen = yield call(isCurrentUser, chosenUser.verbose);

		yield fork(makeRequest, `${configs.endpoints.notifyFollowers(userData.verbose)}}`, {
			method: "POST",
			body: JSON.stringify(
				NEW_PUBLICATION_NOTIFICATION(userData.userName, articleData.title),
			),
		});

		if (isUserChosen && articleData.state === ARTICLE_STATE_PUBLISH) {
			articleData.verbose = data.identifiers.verbose;
			articleData.textSourceName = data.identifiers.textSourceName;
			articleData.previewImageName = data.identifiers.previewImageName;
			articleData.user = yield call(processUserData, userData);
			articleData.isCurrentUserArticle = true;
			articleData.dateOfPublishingString = "Just now";

			yield put({
				type: ART_ASYNC.CREATE_ARTICLE_ASYNC,
				article: articleData,
			});
		}
	}
}

function* updateArticle({ verbose, data: articleData }) {
	const { failure, data } = yield call(
		sendForm,
		`${configs.endpoints.articles}/${verbose}`,
		{
			method: "PUT",
		},
		articleData,
	);

	if (!failure) {
		articleData.textSourceName = data.identifiers.textSourceName;
		articleData.previewImageName = data.identifiers.previewImageName;
		articleData.verbose = data.identifiers.verbose;

		yield put({
			type: ART_ASYNC.UPDATE_ARTICLE_ASYNC,
			verbose: data.verbose || verbose,
			article: articleData,
		});
	}
}

function* deleteArticle({ verbose }) {
	const { failure } = yield call(makeRequest, `${configs.endpoints.articles}/${verbose}`, {
		method: "DELETE",
	});

	if (!failure) {
		yield put({ type: ART_ASYNC.DELETE_ARTICLE_ASYNC, verbose });
	}
}
function* fetchArticleContent({ fileName }) {
	const { failure, data } = yield call(
		fetchFile,
		`${configs.resources.articleContent}${fileName}`,
		{
			method: "GET",
		},
	);

	if (!failure) {
		yield put({
			type: ART_ASYNC.FETCH_ARTICLES_CONTENT_ASYNC,
			content: data,
		});
	}
}

function* createComment({ verbose, text }) {
	const { failure, data } = yield call(
		makeRequest,
		`${configs.endpoints.articleComments(verbose)}`,
		{
			method: "POST",
			body: JSON.stringify({ content: text }),
		},
	);

	if (!failure) {
		const state = yield select();
		const userData = yield call(getCurrentUserInfo, state);
		const article = yield call(getOpenedArticle, state);

		createNotification(
			article.user.verbose,
			NEW_COMMENT_NOTIFICATION(userData.userName, article.title),
		);

		yield put({
			type: ART_ASYNC.CREATE_COMMENT_ASYNC,
			comment: {
				id: data.identifiers.id,
				isCurrentUserComment: true,
				content: text,
				user: userData,
				creationDateString: "Just now",
			},
		});
	}
}

function* updateComment({ commentId, text }) {
	const { failure, data } = yield call(
		makeRequest,
		`${configs.endpoints.comments}/${commentId}`,
		{
			method: "PUT",
			body: JSON.stringify({ content: text }),
		},
	);

	if (!failure) {
		yield put({
			type: ART_ASYNC.UPDATE_COMMENT_ASYNC,
			comment: {
				id: commentId,
				content: text,
			},
		});
	}
}

function* deleteComment({ commentId }) {
	const { failure, data } = yield call(
		makeRequest,
		`${configs.endpoints.comments}/${commentId}`,
		{
			method: "DELETE",
		},
	);

	if (!failure) {
		yield put({
			type: ART_ASYNC.DELETE_COMMENT_ASYNC,
			id: commentId,
		});
	}
}

function* getArticleComments({ verbose }) {
	const query = `?count=${CHUNK_DATA_COUNT}`;

	const { failure, data } = yield call(
		makeRequest,
		`${configs.endpoints.articleComments(verbose)}${query}`,
		{
			method: "GET",
		},
	);

	if (!failure) {
		yield put({
			type: ART_ASYNC.GET_ARTICLE_COMMENTS_ASYNC,
			comments: yield call(convertCommentsData, data.collection.data),
		});
	}
}

function* fetchChunkOfArticlesComments({ verbose }) {
	const store = yield select();
	const offset = yield call(getArticlesCommentsOffset, store);

	const query = `?count=${CHUNK_DATA_COUNT}&offset=${offset}`;

	const { failure, data } = yield call(
		makeRequest,
		`${configs.endpoints.articleComments(verbose)}${query}`,
		{
			method: "GET",
		},
	);

	if (!failure) {
		yield put({
			type: ART_ASYNC.FETCH_CHUNK_OF_ARTICLE_COMMENTS_ASYNC,
			comments: yield call(convertCommentsData, data.collection.data),
		});
	}
}

function* convertCommentsData(comments) {
	const processedArticles = [];

	for (const article of comments) {
		processedArticles.push(yield call(convertCommentData, article));
	}

	return processedArticles;
}

function* convertCommentData(comment) {
	return {
		...comment,
		creationDateString: toShortDate(new Date(comment.creationDate)),
		lastUpdateDateString: toShortDate(new Date(comment.lastUpdateDate)),
		isCurrentUserComment: yield call(isCurrentUser, comment.user.verbose),
	};
}

function* convertArticlesData(articles) {
	const processedArticles = [];

	for (const article of articles) {
		processedArticles.push(yield call(convertArticleData, article));
	}

	return processedArticles;
}

function* convertArticleData(article) {
	return {
		...article,
		dateOfPublishingString: toShortDate(article.dateOfPublishing),
		dateOfChangingString: toShortDate(article.dateOfChanging),
		isCurrentUserArticle: yield call(isCurrentUser, article.user.verbose),
		user: yield call(processUserData, article.user),
	};
}
