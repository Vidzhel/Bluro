import { takeLatest, call, put, take } from "redux-saga/effects";
import { SES_ASYNC, SES_SYNC } from "../assets/actionTypes/session";
import { ART_ASYNC, ART_SYNC } from "../assets/actionTypes/articles";
import { configs } from "../assets/configs";
import { makeRequest, setCookie, HISTORY } from "./utilities";

export function* sessionWatcher() {
	yield takeLatest(SES_SYNC.LOGIN, loginFlow);
	yield takeLatest(SES_SYNC.SIGN_UP, signUpFlow);
	yield takeLatest(SES_SYNC.SHOW_UPDATE_STORY_MODAL, showUpdateStoryModal);
	yield takeLatest(SES_SYNC.LOG_OUT, logOut);
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
