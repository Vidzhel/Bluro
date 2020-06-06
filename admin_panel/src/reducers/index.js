import { ASYNC } from "../assets/actionTypes/actions";

const defaultState = {
	error: {},
	success: {},
	info: {},

	users: {},
	articles: {},
	comments: {},

	session: null,
}

export function rootReducer(state = defaultState, action) {
	if (!Object.values(ASYNC).includes(action.type)) {
		return state;
	}

	const newState = copyObject(state);
	let MESSAGE_ID = 0;

	switch (action.type) {
		case ASYNC.FAILURE: {
			newState.error[MESSAGE_ID] = { message: action.message, id: MESSAGE_ID };
			MESSAGE_ID++;
			break;
		}
		case ASYNC.SUCCESS: {
			newState.success[MESSAGE_ID] = { message: action.message, id: MESSAGE_ID };
			MESSAGE_ID++;
			break;
		}
		case ASYNC.INFO: {
			newState.info[MESSAGE_ID] = { message: action.message, id: MESSAGE_ID };
			MESSAGE_ID++;
			break;
		}
		case ASYNC.DELETE_MESSAGE_ASYNC: {
			delete newState.info[action.id];
			delete newState.success[action.id];
			delete newState.error[action.id];
			break;
		}
		case ASYNC.FETCH_DATA_ASYNC: {
			newState[action.name] = {};
			for (const datum of action.data) {
				newState[action.name][datum[action.id]] = datum;
			}
			break;
		}
		case ASYNC.FETCH_NEXT_CHUNK_OF_DATA_ASYNC: {
			for (const datum of action.data) {
				newState[action.name][datum[action.id]] = datum;
			}
			break;
		}
		case ASYNC.DELETE_DATA_ASYNC: {
			delete newState[action.name][action.verbose];
			break;
		}

		case ASYNC.UPDATE_SESSION_ASYNC: {
			newState.session = action.session
			break;
		}
	}

	return newState;
}

function copyObject(obj) {
	return JSON.parse(JSON.stringify(obj));
}
