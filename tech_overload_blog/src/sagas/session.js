import { takeLatest, call, put, select } from "redux-saga/effects";
import { SES_ASYNC, SES_SYNC } from "../assets/actionTypes/session";
import { ART_ASYNC } from "../assets/actionTypes/articles";
import { configs } from "../assets/configs";
import { makeRequest, setCookie, HISTORY } from "./utilities";
import { getCurrentUserInfo } from "../assets/selectors/session";

export function* sessionWatcher() {
	yield takeLatest(SES_SYNC.LOGIN, loginFlow);
	yield takeLatest(SES_SYNC.SIGN_UP, signUpFlow);

	yield takeLatest(SES_SYNC.SHOW_UPDATE_STORY_MODAL, showUpdateStoryModal);
	yield takeLatest(SES_SYNC.LOG_OUT, logOut);

	yield takeLatest(SES_SYNC.CREATE_NOTIFICATION, createNotification);
	yield takeLatest(SES_SYNC.READ_NOTIFICATION, readNotification);
	yield takeLatest(SES_SYNC.DELETE_NOTIFICATION, deleteNotification);
}

function* loginFlow(action) {
	const { failure } = yield call(makeRequest, configs.endpoints.login, {
		method: "POST",
		body: JSON.stringify({
			...action.data,
		}),
	});

	if (!failure) {
		HISTORY.push("/");
	}
}

function* signUpFlow(action) {
	const { failure } = yield call(makeRequest, configs.endpoints.register, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			...action.data,
		}),
	});

	if (!failure) {
		HISTORY.push("/auth/login");
	}
}

function* logOut() {
	setCookie("token", "");
	yield put({ type: SES_ASYNC.LOG_OUT_ASYNC });
}

function* showUpdateStoryModal(action) {
	yield put({
		type: ART_ASYNC.LOAD_ARTICLE_TO_EDIT_ASYNC,
		article: action.data,
	});
	yield put({ type: SES_ASYNC.SHOW_UPDATE_STORY_MODAL_ASYNC });
}

function* createNotification({ userVerbose, title, message }) {
	yield call(makeRequest, configs.endpoints.userNotifications(userVerbose), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			message,
			title,
		}),
	});
}

function* readNotification({ id }) {
	const store = yield select();
	const currentUser = yield call(getCurrentUserInfo, store);

	const { failure } = yield call(
		makeRequest,
		`${configs.endpoints.userNotifications(currentUser.verbose)}/${id}`,
		{
			method: "PUT",
		},
	);

	if (!failure) {
		yield put({
			type: SES_ASYNC.READ_NOTIFICATION_ASYNC,
			id,
		});
	}
}

function* deleteNotification({ id }) {
	const store = yield select();
	const currentUser = yield call(getCurrentUserInfo, store);

	const { failure } = yield call(
		makeRequest,
		`${configs.endpoints.userNotifications(currentUser.verbose)}/${id}`,
		{
			method: "DELETE",
		},
	);

	if (!failure) {
		yield put({
			type: SES_ASYNC.DELETE_NOTIFICATION_ASYNC,
			id,
		});
	}
}
