import { takeLatest, put, select, call } from "redux-saga/effects";
import { SYNC, ASYNC } from "../assets/actionTypes/actions";
import { formatQueryString, makeRequest } from "./utilities";
import { configs } from "../assets/configs";
import {getArticlesOffset, getCommentsOffset, getUsersOffset} from "../assets/selectors/selectors";
import { BLOCK_USER_NOTIFICATION, BLOCK_COMMENT_NOTIFICATION, BLOCK_ARTICLE_NOTIFICATION } from "../assets/constants";

export function* rootSaga() {
	yield takeLatest(SYNC.FETCH_USERS, fetchUsers);
	yield takeLatest(SYNC.DELETE_USER, deleteUser);

	yield takeLatest(SYNC.FETCH_ARTICLES, fetchArticles);
	yield takeLatest(SYNC.DELETE_ARTICLE, deleteArticle);

	yield takeLatest(SYNC.FETCH_COMMENTS, fetchComments);
	yield takeLatest(SYNC.DELETE_COMMENT, deleteComment);

	yield takeLatest(SYNC.AUTH, auth);

	yield takeLatest(SYNC.CREATE_NOTIFICATION, createNotification);
}

function* fetchUsers({ start, searchParams }) {
	const offset = yield call(getOffset, start, getUsersOffset);
	const queryString = formatQueryString(offset, searchParams);

	const { failure, data } = yield makeRequest(`${configs.endpoints.profiles}${queryString}`, {
		method: "GET",
	});

	if (!failure) {
		yield put({
			type: start ? ASYNC.FETCH_DATA_ASYNC : ASYNC.FETCH_NEXT_CHUNK_OF_DATA_ASYNC,
			data: data.collection.data,
			name: "users",
			id: "verbose"
		});
	}
}

function* deleteUser({ userVerbose, cause }) {
	yield call(createNotification, {
		...BLOCK_USER_NOTIFICATION(cause),
		userVerbose,
	});

	const { failure } = yield makeRequest(`${configs.endpoints.profiles}/${userVerbose}`, {
		method: "DELETE",
	});

	if (!failure) {
		yield put({
			type: ASYNC.DELETE_DATA_ASYNC,
			verbose: userVerbose,
			name: "users"
		})
	}
}

function* fetchArticles({ start, searchParams }) {
	const offset = yield call(getOffset, start, getArticlesOffset);
	const queryString = formatQueryString(offset, searchParams) + "&published=false";

	const { failure, data } = yield makeRequest(`${configs.endpoints.articles}${queryString}`, {
		method: "GET",
	});

	if (!failure) {
		yield put({
			type: start ? ASYNC.FETCH_DATA_ASYNC : ASYNC.FETCH_NEXT_CHUNK_OF_DATA_ASYNC,
			data: data.collection.data,
			name: "articles",
			id: "verbose"
		});
	}
}

function* deleteArticle({ userVerbose, articleVerbose, articleTitle, cause }) {
	yield call(createNotification, {
		...BLOCK_ARTICLE_NOTIFICATION(articleTitle, cause),
		userVerbose,
	});

	const { failure } = yield makeRequest(`${configs.endpoints.articles}/${articleVerbose}`, {
		method: "DELETE",
	});

	if (!failure) {
		yield put({
			type: ASYNC.DELETE_DATA_ASYNC,
			verbose: articleVerbose,
			name: "articles"
		})
	}
}

function* fetchComments({ start, searchParams }) {
	const offset = yield call(getOffset, start, getCommentsOffset);
	const queryString = formatQueryString(offset, searchParams);

	const { failure, data } = yield makeRequest(`${configs.endpoints.comments}${queryString}`, {
		method: "GET",
	});

	if (!failure) {
		yield put({
			type: start ? ASYNC.FETCH_DATA_ASYNC : ASYNC.FETCH_NEXT_CHUNK_OF_DATA_ASYNC,
			data: data.collection.data,
			name: "comments",
			id: "id"
		});
	}
}

function* deleteComment({ userVerbose, commentId, userName, cause }) {
	yield call(createNotification, {
		...BLOCK_COMMENT_NOTIFICATION(userName, cause),
		userVerbose,
	});

	const { failure } = yield makeRequest(`${configs.endpoints.comments}/${commentId}`, {
		method: "DELETE",
	});

	if (!failure) {
		yield put({
			type: ASYNC.DELETE_DATA_ASYNC,
			verbose: commentId,
			name: "comments"
		})
	}
}

function* createNotification({ title, message, userVerbose }) {
	yield makeRequest(`${configs.endpoints.notifyUser(userVerbose)}`, {
		method: "POST",
		body: JSON.stringify({title, message}),
	});
}

function* auth() {
	const {failure} = yield makeRequest(configs.endpoints.auth, {
		method: "POST"
	});
}

function* getOffset(start, offsetGetter) {
	let offset = 0;
	if (!start) {
		const store = yield select();
		offset = yield call(offsetGetter, store);
	}

	return offset;
}