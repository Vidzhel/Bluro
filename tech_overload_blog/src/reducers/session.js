import { SES_ASYNC } from "../assets/actionTypes/session";
import { copyObject } from "./utilities";
import { NOTIFICATION_STATUS_READ } from "../assets/constants";

const defaultState = {
	error: {},
	success: {},
	info: {},

	currentUser: null,

	showStoryModal: false,
	isUpdateStoryModal: false,
	showDeleteProfileModal: false,

	makingRequest: false,

	notifications: new Map(),
};

let MESSAGE_ID = 0;

export function session(state = defaultState, action) {
	if (!SES_ASYNC[action.type]) {
		return state;
	}
	const newState = copyObject(state);

	switch (action.type) {
		case SES_ASYNC.FAILURE: {
			newState.error[MESSAGE_ID] = { message: action.message, id: MESSAGE_ID };
			MESSAGE_ID++;
			break;
		}
		case SES_ASYNC.SUCCESS: {
			newState.success[MESSAGE_ID] = { message: action.message, id: MESSAGE_ID };
			MESSAGE_ID++;
			break;
		}
		case SES_ASYNC.INFO: {
			newState.info[MESSAGE_ID] = { message: action.message, id: MESSAGE_ID };
			MESSAGE_ID++;
			break;
		}
		case SES_ASYNC.DELETE_MESSAGE_ASYNC: {
			delete newState.info[action.id];
			delete newState.success[action.id];
			delete newState.error[action.id];
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
				newState.notifications = new Map();

				for (const notification of action.notifications) {
					newState.notifications.set(notification.id, notification);
				}
			}
			break;
		}
		case SES_ASYNC.READ_NOTIFICATION_ASYNC: {
			if (newState.notifications.get(action.id)) {
				newState.notifications.get(action.id).status = NOTIFICATION_STATUS_READ;
			}
			break;
		}
		case SES_ASYNC.DELETE_NOTIFICATION_ASYNC: {
			if (newState.notifications.get(action.id)) {
				newState.notifications.delete(action.id);
			}
			break;
		}
		case SES_ASYNC.SHOW_DELETE_PROFILE_MODAL_ASYNC: {
			newState.showDeleteProfileModal = true;
			break;
		}
		case SES_ASYNC.HIDE_DELETE_PROFILE_MODAL_ASYNC: {
			newState.showDeleteProfileModal = false;
		}
	}

	return newState;
}
