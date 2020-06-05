import { createBrowserHistory } from "history";

const HISTORY = createBrowserHistory();
const VERBOSE_REGEXP = /^[0-9a-z-._~]*$/i;

const IMAGE_EXTENSION_REGEXP = /^.*\.(jpg|jpeg|bmp|gif|png)$/i;
const CONTENT_EXTENSION_REGEXP = /^.*\.(md|markdown)$/i;

const ARTICLE_STATE_DRAFT = "PENDING_PUBLISHING";
const ARTICLE_STATE_PUBLISH = "PUBLISHED";

const NOTIFICATION_STATUS_READ = "READ";
const NOTIFICATION_STATUS_SENT = "SENT";

const FOLLOW_NOTIFICATION = (followerName) => {
	return {
		title: "New follower!",
		message: `${followerName} has just started following you`,
	};
};

const UNFOLLOW_NOTIFICATION = (followerName) => {
	return {
		title: "User unfollowed you",
		message: `${followerName} has just stopped following you`,
	};
};

const NEW_PUBLICATION_NOTIFICATION = (publisherName, articleTitle) => {
	return {
		title: "New publication!",
		message: `${publisherName} has just uploaded a new article: ${articleTitle}`,
	};
};

const NEW_COMMENT_NOTIFICATION = (publisherName, articleTitle) => {
	return {
		title: "New publication!",
		message: `${publisherName} has just commented your article: ${articleTitle}`,
	};
};

const EMAIL_REGEXP = RegExp(
	/^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/,
	"i",
);

export {
	VERBOSE_REGEXP,
	IMAGE_EXTENSION_REGEXP,
	CONTENT_EXTENSION_REGEXP,
	EMAIL_REGEXP,
	ARTICLE_STATE_DRAFT,
	ARTICLE_STATE_PUBLISH,
	NOTIFICATION_STATUS_READ,
	NOTIFICATION_STATUS_SENT,
	FOLLOW_NOTIFICATION,
	UNFOLLOW_NOTIFICATION,
	NEW_PUBLICATION_NOTIFICATION,
	NEW_COMMENT_NOTIFICATION,
	HISTORY,
};
