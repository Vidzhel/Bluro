import { SES_ASYNC } from "../assets/actionTypes/session";
import { copyObject } from "./utilities";
import { NOTIFICATION_STATUS_READ } from "../assets/constants";

const defaultState = {
	error: "",
	success: "",
	info: "",

	currentUser: null,

	showStoryModal: false,
	isUpdateStoryModal: false,

	makingRequest: false,

	notifications: [],
};

export function session(state = defaultState, action) {
	if (!SES_ASYNC[action.type]) {
		return state;
	}
	const newState = copyObject(state);

	switch (action.type) {
		case SES_ASYNC.FAILURE: {
			newState.error = action.message;
			newState.success = "";
			newState.info = "";
			break;
		}
		case SES_ASYNC.SUCCESS: {
			newState.error = "";
			newState.success = action.message;
			newState.info = "";
			break;
		}
		case SES_ASYNC.INFO: {
			newState.error = "";
			newState.success = "";
			newState.info = action.message;
			break;
		}
		case SES_ASYNC.UPDATE_SESSION_ASYNC: {
			if (!action.session) {
				newState.currentUser = null;
			} else {
				if (!newState.currentUser) {
					newState.currentUser = {};
				}

				for (const [name, val] of Object.entries(action.session)) {
					if (val !== void 0) {
						newState.currentUser[name] = val;
					}
				}
			}
			break;
		}
		case SES_ASYNC.SHOW_UPDATE_STORY_MODAL_ASYNC: {
			newState.showStoryModal = true;
			newState.isUpdateStoryModal = true;
			break;
		}
		case SES_ASYNC.SHOW_CREATE_STORY_MODAL_ASYNC: {
			newState.showStoryModal = true;
			newState.isUpdateStoryModal = false;
			break;
		}
		case SES_ASYNC.HIDE_STORY_MODAL_ASYNC: {
			newState.showStoryModal = false;
			newState.isUpdateStoryModal = false;
			break;
		}
		case SES_ASYNC.START_MAKING_REQUEST_ASYNC: {
			newState.isMakingRequest = true;
			break;
		}
		case SES_ASYNC.END_MAKING_REQUEST_ASYNC: {
			newState.makingRequest = false;
			break;
		}
		case SES_ASYNC.LOG_OUT_ASYNC: {
			newState.currentUser = null;
			break;
		}
		case SES_ASYNC.UPDATE_NOTIFICATIONS_ASYNC: {
			if (action.notifications) {
				newState.notifications = [];

				for (const notification of action.notifications) {
					newState.notifications.push(notification);
				}
			}
			break;
		}
		case SES_ASYNC.READ_NOTIFICATION_ASYNC: {
			if (newState.notifications[action.id]) {
				newState.notifications[action.id].status = NOTIFICATION_STATUS_READ;
			}
			break;
		}
		case SES_ASYNC.DELETE_NOTIFICATION_ASYNC: {
			if (newState.notifications[action.id]) {
				delete newState.notifications[action.id];
			}
		}
	}

	return newState;
}
