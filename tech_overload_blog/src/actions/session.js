import { SES_ASYNC, SES_SYNC } from "../assets/actionTypes/session";

export function logIn(data) {
	return {
		type: SES_SYNC.LOGIN,
		data,
	};
}

export function logOut() {
	return {
		type: SES_SYNC.LOG_OUT,
	};
}

export function register(data) {
	return {
		type: SES_SYNC.SIGN_UP,
		data,
	};
}

export function showCreateStoryModal() {
	return {
		type: SES_ASYNC.SHOW_CREATE_STORY_MODAL_ASYNC,
	};
}

export function hideStoryModal() {
	return {
		type: SES_ASYNC.HIDE_STORY_MODAL_ASYNC,
	};
}

export function showUpdateStoryModal(articleData) {
	return {
		type: SES_SYNC.SHOW_UPDATE_STORY_MODAL,
		data: articleData,
	};
}

export function createNotification(userVerbose, { title, message }) {
	return {
		type: SES_SYNC.CREATE_NOTIFICATION,
		userVerbose,
		title,
		message,
	};
}

export function readNotification(id) {
	return {
		type: SES_SYNC.READ_NOTIFICATION,
		id,
	};
}

export function deleteNotification(id) {
	return {
		type: SES_SYNC.DELETE_NOTIFICATION,
		id,
	};
}
