import {put, call, delay, race} from "redux-saga/effects";
import {ASYNC} from "../assets/actionTypes/actions";

const CHUNK_DATA_COUNT = 25;
const TIMEOUT = 60000;

const MINUTE = 60000;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

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

export function* makeRequest(endpoint, requestData) {
	let { res, reason, failure, wasTimeout } = yield call(fetchData, endpoint, requestData);

	if (res) {
		return yield call(handleResponse, res, wasTimeout, reason, failure);
	} else {
		failure = true;
		reason = "Server error";

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
				type: ASYNC.FAILURE,
				message: reason,
			});
		} else {
			reason = body.errors.join(" ");
		}

		if (!reason) {
			reason = "Unknown error occurred";
			yield put({
				type: ASYNC.FAILURE,
				message: reason,
			});
		}
	}
	return { wasTimeout, reason, data, failure };
}


function* regularHandler(body) {
	yield put({ type: ASYNC.UPDATE_SESSION_ASYNC, session: body.session });

	if (body.errors.length) {
		yield put({
			type: ASYNC.FAILURE,
			message: body.errors.join(" "),
		});
	} else if (body.success.length) {
		yield put({
			type: ASYNC.SUCCESS,
			message: body.success.join(" "),
		});
	} else if (body.info.length) {
		yield put({
			type: ASYNC.INFO,
			message: body.info.join(" "),
		});
	}
}

export function toShortDate(date) {
	date = new Date(date);

	const difference = Date.now() - date;
	if (difference < MINUTE) {
		return "Less then a minute ago";
	}

	if (difference < HOUR) {
		return "Less than a hour ago";
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

