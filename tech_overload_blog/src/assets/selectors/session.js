export function getSessionError(store) {
	return store.session.error;
}
export function getSessionInfo(store) {
	return store.session.info;
}

export function getCurrentUserInfo(store) {
	return store.session && store.session.currentUser;
}

export function getShowStoryModal(store) {
	return store.session.showStoryModal;
}

export function getIsUpdateStoryModal(store) {
	return store.session.isUpdateStoryModal;
}

export function getShowDeleteProfileModal(store) {
	return store.session.showDeleteProfileModal;
}

export function isUserLoggedIn(store) {
	return !!store.session.currentUser;
}

export function getNotifications(store) {
	return Array.from(store.session.notifications.values());
}
