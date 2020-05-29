const User = require("./User");
const bcrypt = require("bcryptjs");
const jwtGenerator = require("njwt");

function requireAuthorization(req, res, data) {
	if (!data.session) {
		res.error("Authorization is needed");
		res.code(res.CODES.Unauth);
		return true;
	}
}

/**
 * Checks for jwt token, if exist fills in session data
 * If token is valid and request was made to log in it'll be rejected as you
 * need to log out first
 *
 * @param req
 * @param res
 * @param data
 * @return {Promise}
 */
async function authRule(req, res, data) {
	const token = await req.getCookie("token");
	if (!token) {
		return;
	}

	return await checkToken(req, res, data, token);
}

function checkToken(req, res, data, token) {
	return new Promise((resolve) => {
		jwtGenerator.verify(token, ConfigsManager.getEntry("secret"), (err, verifiedJWT) => {
			if (!err) {
				const body = verifiedJWT.body;

				verifyUser(body.email, body.pass, false).then((user) => {
					resolve(handleTokenLogin(req, res, user, body, data));
				});
			} else {
				resolve();
			}
		});
	});
}

function handleTokenLogin(req, res, user, tokenBody, data) {
	if (user.id === tokenBody.id) {
		if (user) {
			const credentials = {
				email: tokenBody.email,
				userName: user.userName,
				role: tokenBody.role,
			};

			data.session = { ...credentials, id: tokenBody.id };

			res.setCredentials(credentials);

			if (req.url === "/login") {
				res.info("You need to log out before logging in again");
				return true;
			}
		}
	}
}

async function loginController(req, res, data) {
	const credentials = data.reqData;

	await login(res, credentials);
}

async function signupController(req, res, data) {
	const credentials = data.reqData;

	if (validateRegister(res, credentials)) {
		await signup(res, credentials);
	}
}

function validateRegister(res, data) {
	if (!data.login || !data.pass || !data.repPass || !data.email) {
		res.error("Auth data have to be specified");
		res.code(res.CODES.BadReq);
		return false;
	}
	if (data.pass !== data.repPass) {
		res.error("Passwords don't match");
		res.code(res.CODES.BadReq);
		return false;
	}

	return true;
}

/**
 * Gets credentials, verifies that user exists, if so generates JWT
 *
 *
 * @param res
 * @param credentials
 * @return {Promise<void>}
 */
async function login(res, credentials) {
	const user = await verifyUser(credentials.email, credentials.pass);

	if (user) {
		const jwt = generateJWT({
			id: user.id,
			email: user.email,
			pass: user.pass,
			role: user.role,
		});

		res.setCredentials({
			email: user.email,
			login: user.userName,
			role: user.role,
		});

		res.setCookie("token", jwt);
		res.success("You've been successfully logged in");
	} else {
		res.error("Wrong login or password was specified");
		res.code(res.CODES.Forbidden);
	}
}

async function signup(res, credentials) {
	const set = await User.selector
		.filter({
			email: credentials.email,
		})
		.fetch();

	if (set.length !== 0) {
		res.error("An user with the same login has already been created");
		res.code(res.CODES.Forbidden);
	} else {
		const userData = {
			userName: credentials.login,
			email: credentials.email,
			pass: credentials.pass,
		};

		const result = User.validateValues(userData, true);

		if (result.fail) {
			res.error(result.description);
			res.code(res.CODES.BadReq);
			return;
		}

		const user = new User(userData);
		await user.save();

		res.code(res.CODES.Created);
		res.success("You've successfully registered");
	}
}

async function verifyUser(email, pass, verifyByHash = true) {
	const set = await User.selector
		.filter({
			email: email,
		})
		.fetch();
	const user = set.get(0);

	if (user) {
		const match = verifyByHash ? await bcrypt.compare(pass, user.pass) : pass === user.pass;
		return match ? user : null;
	}

	return null;
}

function generateJWT(credentials) {
	const jwt = jwtGenerator.create(credentials, ConfigsManager.getEntry("secret"));
	return jwt.compact();
}

DependencyResolver.registerType({ dependency: requireAuthorization });

module.exports.loginPage = loginController;
module.exports.signupPage = signupController;
module.exports.authRule = authRule;
module.exports.requireAuthorizationRule = requireAuthorization;
