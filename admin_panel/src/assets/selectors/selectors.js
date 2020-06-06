export function getUsersOffset(store) {
	return Object.values(store.users).length;
}

export function getArticlesOffset(store) {
	return Object.values(store.articles).length;
}
export function getCommentsOffset(store) {
	return Object.values(store.comments).length;
}

export function getUsers(store) {
	return Object.values(store.users);
}

export function getArticles(store) {
	return Object.values(store.articles);
}
export function getComments(store) {
	return Object.values(store.comments);
}

export function hasAccess(store) {
	return store.session && store.session.role === "ADMIN";
}

export function getSessionErrors(store) {
	return Object.values(store.error);
}

export function getSessionInfo(store) {
	return Object.values(store.info);
}

export function getSessionSuccess(store) {
	return Object.values(store.success);
}