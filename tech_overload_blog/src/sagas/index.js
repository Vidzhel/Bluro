import { all, call } from "redux-saga/effects";
import { sessionWatcher } from "./session";

export function* rootSaga() {
	yield all([call(sessionWatcher)]);
}
