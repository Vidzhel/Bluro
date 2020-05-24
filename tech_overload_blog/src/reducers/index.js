import { combineReducers } from "redux";
import { session } from "./session";

export const rootReducer = combineReducers({
	session: session,
});
