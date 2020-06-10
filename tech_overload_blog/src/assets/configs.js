const BASE = process.env["REACT_APP_API"] || "http://localhost:8080";
const BASE_RESOURCES = `${BASE}/files`;

const configs = {
	endpoints: {
		base: BASE,
		register: `${BASE}/signup`,
		login: `${BASE}/login`,
		profiles: `${BASE}/profiles`,
		userArticles: (userVerbose) => `${BASE}/profiles/${userVerbose}/articles`,
		articles: `${BASE}/articles`,
		articleComments: (articleVerbose) => `${BASE}/articles/${articleVerbose}/comments`,
		comments: `${BASE}/comments`,
		userNotifications: (userVerbose) => `${BASE}/profiles/${userVerbose}/notifications`,
		notifyFollowers: (userVerbose) => `${BASE}/profiles/${userVerbose}/followers/notifications`,
	},
	resources: {
		profileImage: `${BASE_RESOURCES}/profiles/img/`,
		articleImage: `${BASE_RESOURCES}/articles/images/`,
		articleContent: `${BASE_RESOURCES}/articles/text/`,
	},
};

export { configs };
