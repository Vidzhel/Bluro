const BASE = process.env["REACT_APP_API"] || "http://localhost:8080";

const configs = {
	endpoints: {
		base: BASE,
		auth: `${BASE}/login`,
		profiles: `${BASE}/profiles`,
		articles: `${BASE}/articles`,
		comments: `${BASE}/comments`,
		notifyUser: (userVerbose) => `${BASE}/profiles/${userVerbose}/notifications`,
	},
	blogEndpoints: {
		profiles: `/profiles`,
		articles: `/articles`,
		comments: `/comments`,
	},
};

export { configs };
