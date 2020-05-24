import { takeLatest, call, put, race, delay } from "redux-saga/effects";
import { SES_SYNC, SES_ASYNC } from "../assets/actionTypes/session";
import config from "../assets/configs.json";

const TIMEOUT = 60000;

export function* sessionWatcher() {
	yield takeLatest(SES_SYNC.LOGIN, loginFlow);
	yield takeLatest(SES_SYNC.SIGN_UP, signUpFlow);
}

function* loginFlow(action) {
	const { failure, reason } = yield call(tryFetch, TIMEOUT, config.endpoints.login, {
		method: "POST",
		body: JSON.stringify({
			...action.data,
		}),
	});

	if (!failure) {
		yield put({
			type: SES_ASYNC.LOGIN_ASYNC_SUCCESS,
			message: "You've been successfully logged in",
		});
		action.history.push("/");
	} else {
		yield put({
			type: SES_ASYNC.LOGIN_ASYNC_FAILURE,
			message: reason,
		});
	}
}

function* signUpFlow(action) {
	const { failure, reason } = yield call(tryFetch, TIMEOUT, config.endpoints.register, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			...action.data,
		}),
	});

	if (!failure) {
		yield put({
			type: SES_ASYNC.LOGIN_ASYNC_SUCCESS,
			message: "You've been successfully registered",
		});
		action.history.push("/login");
	} else {
		yield put({
			type: SES_ASYNC.LOGIN_ASYNC_FAILURE,
			message: reason,
		});
	}
}

function* tryFetch(timeout, endpoint, requestData) {
	const controller = new AbortController();
	const { signal } = controller;
	let res, wasTimeout, reason, data, failure;
	failure = false;

	if (!requestData.headers) {
		requestData.headers = {};
	}

	requestData.headers = {
		...requestData.headers,
		"Content-Type": "application/json",
	};

	try {
		const raceRes = yield race([
			call(fetch, endpoint, {
				...requestData,
				signal,
				mode: "cors",
			}),
			delay(timeout, true),
		]);

		res = raceRes[0];
		wasTimeout = raceRes[1] || false;

		if (wasTimeout) {
			failure = true;
			reason = "Connection timeout";
			controller.abort();
		}
	} catch (e) {
		console.log(e);
		reason = "Error occurred";
	}

	if (res) {
		return yield call(handleResponse, res, wasTimeout, reason, data, failure);
	} else {
		failure = true;
		reason = "Server error";

		return { res: null, wasTimeout, reason, data: null, failure };
	}
}

async function handleResponse(res, wasTimeout, reason, data, failure) {
	// For some reason an exception Illegal... is thrown when you 'call' res.json with saga effect
	return await res.json().then((body) => {
		data = body;

		if (res && res.ok) {
			reason = body.success.join(" ");
		} else {
			failure = true;
			if (wasTimeout) {
				reason = "Connection timeout";
			} else {
				reason = body.errors.join(" ");
			}

			if (!reason) {
				reason = "Unknown error occurred";
			}
		}

		return { res, wasTimeout, reason, data, failure };
	});
}
