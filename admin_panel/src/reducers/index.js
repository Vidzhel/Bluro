import { ASYNC } from "../assets/actionTypes/actions";

const defaultState = {
	users: {},
	articles: {},
	comments: {},

	session: null,
	error: null,
	info: null,
	success: null,
}

export function rootReducer(state = defaultState, action) {
	if (!Object.values(ASYNC).includes(action.type)) {
		return state;
	}

	const newState = copyObject(state);

	switch (action.type) {
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
