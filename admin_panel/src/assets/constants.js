import {createBrowserHistory} from "history";

const HISTORY = createBrowserHistory();

const BLOCK_USER_NOTIFICATION = (cause) => {
	return {
		title: "Your account has been banned",
		message: "Your account has been banned due to forbidden activity: " + cause
	}
}

const BLOCK_ARTICLE_NOTIFICATION = (articleTitle, cause) => {
	return {
		title: "Your article has been deleted",
		message: `Your article '${articleTitle}' has been removed due to non-compliance: ` + cause
	}
}

const BLOCK_COMMENT_NOTIFICATION = (userName, cause) => {
	return {
		title: "Your article has been deleted",
		message: `Your comment under '${userName}'\`s article has been removed due to non-compliance: ` + cause
	}
}

export  {
	BLOCK_ARTICLE_NOTIFICATION,
	BLOCK_COMMENT_NOTIFICATION,
	BLOCK_USER_NOTIFICATION,
	HISTORY
}