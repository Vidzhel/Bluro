import { call, takeLatest, put, select } from "redux-saga/effects";
import { sendForm, makeRequest, isCurrentUser } from "./utilities";
import { configs } from "../assets/configs";
import { PROF_ASYNC, PROF_SYNC } from "../assets/actionTypes/profile";
import { getCurrentUserInfo } from "../assets/selectors/session";
import { SES_ASYNC } from "../assets/actionTypes/session";
import { getChosenProfile } from "../assets/selectors/profile";

export function* profileWatcher() {
	yield takeLatest(PROF_SYNC.GET_PROFILE_INFO, getProfileInfo);
	yield takeLatest(PROF_SYNC.UPDATE_PROFILE, updateProfile);
	yield takeLatest(PROF_SYNC.FOLLOW_USER, followUser);
	yield takeLatest(PROF_SYNC.UNFOLLOW_USER, unfollowUser);
}

function* getProfileInfo(action) {
	const { failure, data } = yield call(
		makeRequest,
		`${configs.endpoints.profiles}/${action.verbose}`,
		{
			method: "GET",
		},
	);

	if (!failure) {
		yield put({
			type: PROF_ASYNC.UPDATE_CHOSEN_PROFILE_ASYNC,
			profile: yield call(processUserData, data.entry),
		});
	}
}

function* isUsersFollower(user) {
	const store = yield select();
	const currentUser = yield call(getCurrentUserInfo, store);

	if (!currentUser) {
		return false;
	}

	const { failure, data } = yield call(
		makeRequest,
		`${configs.endpoints.profiles}/${user}/followers/${currentUser.verbose}`,
		{
			method: "GET",
		},
	);

	if (!failure) {
		return data.entry.isFollowing;
	}

	return false;
}

function* updateProfile(action) {
	const store = yield select();
	const currentUser = getCurrentUserInfo(store);

	const { failure } = yield call(
		sendForm,
		`${configs.endpoints.profiles}/${currentUser.verbose}`,
		{
			method: "PUT",
		},
		action.data,
	);

	if (!failure) {
		yield put({ type: PROF_ASYNC.UPDATE_CHOSEN_PROFILE_ASYNC, profile: action.data });
	}
}

function* followUser(action) {
	const { failure } = yield call(
		makeRequest,
		`${configs.endpoints.profiles}/${action.verbose}/followers`,
		{
			method: "POST",
		},
	);

	if (!failure) {
		const isChosen = yield call(isChosenUser, action.verbose);
		if (isChosen) {
			yield put({
				type: PROF_ASYNC.UPDATE_CHOSEN_PROFILE_ASYNC,
				profile: { isFollowing: true },
			});
		}
	}
}

function* unfollowUser(action) {
	const { failure } = yield call(
		makeRequest,
		`${configs.endpoints.profiles}/${action.verbose}/followers`,
		{
			method: "DELETE",
		},
	);

	if (!failure) {
		const isChosen = yield call(isChosenUser, action.verbose);
		if (isChosen) {
			yield put({
				type: PROF_ASYNC.UPDATE_CHOSEN_PROFILE_ASYNC,
				profile: { isFollowing: false },
			});
		}
	}
}

function* isChosenUser(verbose) {
	const store = yield select();
	const currentUser = yield call(getChosenProfile, store);
	return currentUser.verbose === verbose;
}

export function* processUserData(user) {
	user.isCurrentUser = yield call(isCurrentUser, user.verbose);

	// if (!data.entry.isCurrentUser) {
	user.isFollowing = yield call(isUsersFollower, user.verbose);
	// } else {
	// 	data.entry.isFollowing = false;
	// }
	return user;
}
