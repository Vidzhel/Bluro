import { SES_SYNC } from "../assets/actionTypes/session";

export function logIn(data, history) {
	return {
		type: SES_SYNC.LOGIN,
		data,
		history,
	};
}

export function register(data, history) {
	return {
		type: SES_SYNC.SIGN_UP,
		data,
		history,
	};
}
