import { call, delay, put, race, select } from "redux-saga/effects";
import { SES_ASYNC } from "../assets/actionTypes/session";
import { getCurrentUserInfo } from "../assets/selectors/session";

const TIMEOUT = 60000;
const COOKIE_REGEXP = (key) => `(;?${key}:).*;?`;
const MINUTE = 60000;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
export const CHUNK_DATA_COUNT = 5;

export function* isCurrentUser(verbose) {
	const store = yield select();
	const currentUser = yield call(getCurrentUserInfo, store);
	return !!currentUser && currentUser.verbose === verbose;
}

export function findCookie(key) {
	const cookies = document.cookie;

	const regExp = new RegExp(`;?${key}:(.*);?`);
	const res = regExp.exec(cookies);
	if (res) {
		return res[1] || null;
	}

	return null;
}

export function setCookie(key, value) {
	const cookies = document.cookie;

	const regExp = new RegExp(COOKIE_REGEXP(key));
	const res = regExp.test(cookies);

	if (res) {
		document.cookie = cookies.replace(regExp, `$1${value};path=/`);
	} else {
		document.cookie += `${key}:${value};path=/`;
	}
}

export function* sendForm(endpoint, requestData, data) {
	const form = new FormData();
	for (const [field, value] of Object.entries(data)) {
		if (value !== undefined) {
			form.append(field, value);
		}
	}

	requestData = {
		method: "POST",
		...requestData,
		body: form,
	};
	return yield call(makeRequest, endpoint, requestData);
}

export function* makeRequest(endpoint, requestData) {
	yield put({ type: SES_ASYNC.START_MAKING_REQUEST_ASYNC });

	let { res, reason, failure, wasTimeout } = yield call(fetchData, endpoint, requestData);

	if (res) {
		const results = yield call(handleResponse, res, wasTimeout, reason, failure);

		yield put({ type: SES_ASYNC.END_MAKING_REQUEST_ASYNC });
		return results;
	} else {
		failure = true;
		reason = "Server error";

		yield put({ type: SES_ASYNC.END_MAKING_REQUEST_ASYNC });
		return { res: null, wasTimeout, reason, data: null, failure };
	}
}

export function* fetchFile(endpoint, requestData) {
	yield put({ type: SES_ASYNC.START_MAKING_REQUEST_ASYNC });

	let { res, reason, failure, wasTimeout } = yield call(fetchData, endpoint, requestData);

	if (res) {
		const content = yield call(res.text.bind(res));
		yield put({ type: SES_ASYNC.END_MAKING_REQUEST_ASYNC });
		return { res, wasTimeout, reason, data: content, failure };
	} else {
		failure = true;
		reason = "Server error";

		yield put({ type: SES_ASYNC.END_MAKING_REQUEST_ASYNC });
		return { res: null, wasTimeout, reason, data: null, failure };
	}
}

function* fetchData(endpoint, requestData) {
	const controller = new AbortController();
	const { signal } = controller;
	let res, wasTimeout, reason, failure;
	failure = false;

	try {
		const raceRes = yield race([
			call(fetch, endpoint, {
				...requestData,
				signal,
				mode: "cors",
				redirect: "follow",
				credentials: "include",
			}),
			delay(TIMEOUT, true),
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

	return { reason, res, failure, wasTimeout };
}

function* handleResponse(res, wasTimeout, reason, failure) {
	const body = yield call(res.json.bind(res));
	const data = body;

	yield call(regularHandler, body);

	if (res && res.ok) {
		reason = body.success.join(" ");
	} else {
		failure = true;
		if (wasTimeout) {
			reason = "Connection timeout";
			yield put({
				type: SES_ASYNC.FAILURE,
				message: reason,
			});
		} else {
			reason = body.errors.join(" ");
		}

		if (!reason) {
			reason = "Unknown error occurred";
			yield put({
				type: SES_ASYNC.FAILURE,
				message: reason,
			});
		}
	}
	return { wasTimeout, reason, data, failure };
}

function* regularHandler(body) {
	yield put({ type: SES_ASYNC.UPDATE_SESSION_ASYNC, session: body.session });
	yield put({
		type: SES_ASYNC.UPDATE_NOTIFICATIONS_ASYNC,
		notifications: processNotifications(body.notifications),
	});

	if (body.errors.length) {
		yield put({
			type: SES_ASYNC.FAILURE,
			message: body.errors.join(" "),
		});
	} else if (body.success.length) {
		yield put({
			type: SES_ASYNC.SUCCESS,
			message: body.success.join(" "),
		});
	} else if (body.info.length) {
		yield put({
			type: SES_ASYNC.INFO,
			message: body.info.join(" "),
		});
	}
}

function processNotifications(notifications) {
	if (!notifications) {
		return;
	}

	return notifications.map((notification) => {
		return {
			...notification,
			dateString: toShortDate(notification.date),
		};
	});
}

export function formatQueryString(dataOffset = 0, searchParams = null) {
	let query = `?count=${CHUNK_DATA_COUNT}`;
	query += `&offset=${dataOffset}`;

	if (searchParams) {
		for (const [name, val] of Object.entries(searchParams)) {
			query += `&${name}=${val}`;
		}
	}

	return query;
}

export function toShortDate(date) {
	date = new Date(date);

	const difference = Date.now() - date;
	if (difference < MINUTE) {
		return "Less then a minute ago";
	}

	if (difference < HOUR) {
		return "Less than an hour ago";
	}

	if (difference < DAY) {
		const hours = date.getHours();
		const minutes = date.getMinutes();
		return `${hours < 10 ? "0" + hours.toString() : hours}:${
			minutes < 10 ? "0" + minutes.toString() : minutes
		}`;
	}

	return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function* getOffset(start, offsetGetter) {
	let offset = 0;
	if (!start) {
		const store = yield select();
		offset = yield call(offsetGetter, store);
	}

	return offset;
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
