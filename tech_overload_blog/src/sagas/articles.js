import { call, put, takeLatest, select, fork } from "redux-saga/effects";
import { ART_SYNC, ART_ASYNC } from "../assets/actionTypes/articles";
import { makeRequest, sendForm, isCurrentUser, fetchFile } from "./utilities";
import { configs } from "../assets/configs";
import { getChosenProfile } from "../assets/selectors/profile";
import { getArticlesOffset, getFetchedArticle } from "../assets/selectors/articles";
import { processUserData } from "./profile";

const COUNT_TO_FETCH = 5;

export function* articlesWatcher() {
	yield takeLatest(ART_SYNC.GET_USERS_ARTICLES, getUsersArticles);

	yield takeLatest(ART_SYNC.OPEN_ARTICLE, openArticle);
	yield takeLatest(ART_SYNC.CREATE_ARTICLE, createArticle);
	yield takeLatest(ART_SYNC.UPDATE_ARTICLE, updateArticle);
	yield takeLatest(ART_SYNC.DELETE_ARTICLE, deleteArticle);

	yield takeLatest(ART_SYNC.FETCH_ARTICLES_CONTENT, fetchArticleContent);
	yield takeLatest(ART_SYNC.FETCH_CHUNK_OF_ARTICLES, fetchChunkOfProjects);
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
		yield put({
			type: ART_ASYNC.GET_USERS_ARTICLES_ASYNC,
			articles: convertArticlesData(data.collection.data),
		});
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
			article = data.entry;
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

function* fetchChunkOfProjects() {
	const store = yield select();
	const offset = yield call(getArticlesOffset, store);

	const query = `?count=${COUNT_TO_FETCH}&offset=${offset}&published=false`;

	const { failure, data } = yield call(makeRequest, `${configs.endpoints.articles}${query}`, {
		method: "GET",
	});

	if (!failure) {
		yield put({
			type: ART_ASYNC.FETCH_CHUNK_OF_ARTICLES_ASYNC,
			articles: yield call(convertArticlesData, data.collection.data),
		});
	}
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
		dateOfPublishingString: toShortDate(new Date(article.dateOfPublishing)),
		dateOfChangingString: toShortDate(new Date(article.dateOfChanging)),
		isCurrentUserArticle: yield call(isCurrentUser, article.user.verbose),
		user: yield call(processUserData, article.user),
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
