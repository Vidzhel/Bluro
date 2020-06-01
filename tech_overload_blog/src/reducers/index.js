import { combineReducers } from "redux";
import { session } from "./session";
import { profile } from "./profile";
import { articles } from "./articles";

export const rootReducer = combineReducers({
	session,
	profile,
	articles,
});
