import { PROF_ASYNC } from "../assets/actionTypes/profile";
import { copyObject } from "./utilities";

const defaultState = {
	chosenProfile: null,
};

export function profile(state = defaultState, action) {
	if (!Object.values(PROF_ASYNC).includes(action.type)) {
		return state;
	}

	const newState = copyObject(state);

	switch (action.type) {
		case PROF_ASYNC.UPDATE_CHOSEN_PROFILE_ASYNC: {
			if (!newState.chosenProfile) {
				newState.chosenProfile = {};
			}

			for (const [name, val] of Object.entries(action.profile)) {
				if (val !== void 0) {
					newState.chosenProfile[name] = val;
				}
			}
		}
	}

	return newState;
}
