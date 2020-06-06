import {ASYNC, SYNC} from "../assets/actionTypes/actions";

export function fetchUsers(fromStart = true, searchParams) {
	return {
		type: SYNC.FETCH_USERS,
		start: fromStart,
		searchParams
	}
}

export function fetchArticles(fromStart = true, searchParams) {
	return {
		type: SYNC.FETCH_ARTICLES,
		start: fromStart,
		searchParams
	}
}

export function fetchComments(fromStart = true, searchParams) {
	return {
		type: SYNC.FETCH_COMMENTS,
		start: fromStart,
		searchParams
	}
}

export function deleteUser(userVerbose, cause) {
	return {
		type: SYNC.DELETE_USER,
		userVerbose,
		cause,
	}
}

export function deleteArticle(userVerbose, articleVerbose, articleTitle, cause) {
	return {
		type: SYNC.DELETE_ARTICLE,
		userVerbose,
		articleVerbose,
		articleTitle,
		cause,
	}
}

export function deleteComment(userVerbose, commentId, userName, cause) {
	return {
		type: SYNC.DELETE_COMMENT,
		userVerbose,
		userName,
		commentId,
		cause,
	}
}

export function sendNotification(userVerbose, title, message) {
	return {
		type: SYNC.CREATE_NOTIFICATION,
		title,
		message,
		userVerbose
	}
}

export function auth() {
	return {
		type: SYNC.AUTH,
	}
}

export function deleteMessage(id) {
	return {
		type: ASYNC.DELETE_MESSAGE_ASYNC,
		id,
	};
}
