import { all, call } from "redux-saga/effects";
import { sessionWatcher } from "./session";
import { profileWatcher } from "./profile";
import { articlesWatcher } from "./articles";

export function* rootSaga() {
	yield all([call(sessionWatcher), call(profileWatcher), call(articlesWatcher)]);
}
