import { PROF_SYNC } from "../assets/actionTypes/profile";

export function getProfileInfo(userVerbose) {
	return {
		type: PROF_SYNC.GET_PROFILE_INFO,
		verbose: userVerbose,
	};
}

export function updateProfile(data) {
	return {
		type: PROF_SYNC.UPDATE_PROFILE,
		data,
	};
}

export function followUser(userVerbose) {
	return {
		type: PROF_SYNC.FOLLOW_USER,
		verbose: userVerbose,
	};
}

export function unfollowUser(userVerbose) {
	return {
		type: PROF_SYNC.UNFOLLOW_USER,
		verbose: userVerbose,
	};
}
