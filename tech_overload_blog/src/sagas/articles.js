import { call, put, takeLatest, select, fork } from "redux-saga/effects";
import { ART_SYNC, ART_ASYNC } from "../assets/actionTypes/articles";
import { makeRequest, sendForm, isCurrentUser, fetchFile } from "./utilities";
import { configs } from "../assets/configs";
import { getChosenProfile } from "../assets/selectors/profile";

export function* articlesWatcher() {
	yield takeLatest(ART_SYNC.GET_USERS_ARTICLES, getUsersArticles);

	yield takeLatest(ART_SYNC.CREATE_ARTICLE, createArticle);
	yield takeLatest(ART_SYNC.UPDATE_ARTICLE, updateArticle);
	yield takeLatest(ART_SYNC.DELETE_ARTICLE, deleteArticle);

	yield takeLatest(ART_SYNC.FETCH_ARTICLES_CONTENT, fetchArticleContent);
}

function* getUsersArticles({ verbose, onlyPublishedArticles }) {
	const { failure, data } = yield call(
		makeRequest,
		`${configs.endpoints.userArticles(verbose)}${
			onlyPublishedArticles ? "" : "?published=false"
		}`,
		{
			method: "GET",
		},
	);

	if (!failure) {
		for (const article of data.collection.data) {
			article.isCurrentUserArticle = yield call(isCurrentUser, article.user.verbose);
		}

		yield put({
			type: ART_ASYNC.GET_USERS_ARTICLES_ASYNC,
			articles: convertArticlesData(data.collection.data),
		});
	}
}

function* createArticle({ data }) {
	const { failure } = yield call(
		sendForm,
		`${configs.endpoints.articles}}`,
		{
			method: "POST",
		},
		data,
	);

	if (!failure) {
		const state = yield select();
		const chosenProfile = yield call(getChosenProfile, state);
		const isUser = yield call(isCurrentUser, chosenProfile.verbose);

		if (isUser) {
			yield call(getUsersArticles, {
				verbose: chosenProfile.verbose,
				onlyPublishedArticles: false,
			});
		}
	}
}

function* updateArticle({ verbose, data }) {
	const { failure } = yield call(
		sendForm,
		`${configs.endpoints.articles}/${verbose}`,
		{
			method: "PUT",
		},
		data,
	);

	if (!failure) {
		const store = yield select();
		const profile = yield call(getChosenProfile, store);
		yield call(getUsersArticles, { verbose: profile.verbose, onlyPublishedArticles: false });
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

function convertArticlesData(data) {
	return data.map((article) => convertArticleData(article));
}

function convertArticleData(data) {
	return {
		...data,
		dateOfPublishing: toShortDate(new Date(data.dateOfPublishing)),
		dateOfChanging: toShortDate(new Date(data.dateOfChanging)),
	};
}

function toShortDate(date) {
	return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

const months = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"June",
	"July",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];
