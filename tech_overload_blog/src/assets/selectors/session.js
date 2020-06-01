export function getSessionError(store) {
	return store.session.error;
}
export function getSessionInfo(store) {
	return store.session.info;
}

export function getCurrentUserInfo(store) {
	return store.session.currentUser;
}

export function getShowStoryModal(store) {
	return store.session.showStoryModal;
}
export function getIsUpdateStoryModal(store) {
	return store.session.isUpdateStoryModal;
}
