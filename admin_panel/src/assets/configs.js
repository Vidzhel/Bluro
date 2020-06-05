const BASE = process.env["host"] || "http://localhost:8080";
const BLOG_BASE = process.env["host"] || "http://localhost:3000";

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
		profiles: `${BLOG_BASE}/profiles`,
	}
};

export { configs };
