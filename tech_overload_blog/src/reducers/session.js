import { SES_ASYNC } from "../assets/actionTypes/session";
import { copyObject } from "./utilities";

const defaultState = {
	error: "",
	info: "",
};

export function session(state = defaultState, action) {
	if (!SES_ASYNC[action.type]) {
		return state;
	}
	const newState = copyObject(state);

	switch (action.type) {
		case SES_ASYNC.SIGN_UP_ASYNC_FAILURE:
		case SES_ASYNC.LOGIN_ASYNC_FAILURE: {
			newState.error = action.message;
			newState.info = "";
			break;
		}

		case SES_ASYNC.LOGIN_ASYNC_SUCCESS:
		case SES_ASYNC.SIGN_UP_ASYNC_SUCCESS: {
			newState.info = action.message;
			newState.error = "";
			break;
		}
	}

	return newState;
}
