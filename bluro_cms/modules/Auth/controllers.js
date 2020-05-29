const User = require("./User");
const bcrypt = require("bcryptjs");
const jwtGenerator = require("njwt");
const { v1: uuid } = require("uuid");

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
				verbose: tokenBody.verbose,
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

async function getProfileController(req, res, data) {
	const verbose = data.params.verbose;

	const set = await User.selector
		.filter({
			verbose,
		})
		.fetch();
	const user = set.get(0);

	if (!user) {
		res.error("User doesn't exist");
		res.code(res.CODES.NotFound);
		return;
	}

	res.setEntry(await user.toObject());
}

async function getProfilesController(req, res) {
	const count = parseInt(req.query.count) || 10;
	const offset = parseInt(req.query.offset) || 0;
	let results;

	const set = await User.selector.limit(offset, count).fetch();

	results = await set.getList();
	res.setCollection(results, offset, count);
}

async function updateProfileController(req, res, data) {
	const verbose = data.params.verbose;

	if (!checkRights(data, res, verbose)) {
		return;
	}
	let set = await User.selector.filter({ verbose }).fetch();
	const user = set.get(0);

	if (!user) {
		res.error("User doesn't exist");
		res.code(res.CODES.NotFound);
		return;
	}

	let { userName, verbose: newVerbose, email, pass, repPass, role } = data.reqData;
	if (pass && !repPass) {
		res.error("To change password specify password and repeat password");
		res.code(res.CODES.BadReq);
		return;
	}
	if (pass && pass !== repPass) {
		res.error("Passwords don't match");
		res.code(res.CODES.BadReq);
		return;
	}

	set = await User.selector.filter({ verbose: newVerbose }).fetch();
	if (set.length !== 0) {
		res.error("User with the same verbose has already been registered");
		res.code(res.CODES.Forbidden);
		return;
	}

	const userData = {
		userName,
		verbose: newVerbose,
		email,
		pass,
		role,
	};

	const validationResult = User.validateValues(userData, true);
	if (validationResult.fail) {
		res.error(validationResult.constructor);
		res.code(res.CODES.BadReq);
		return;
	}

	await User.update(userData, {
		verbose,
	});

	// If that user was updated, set new credentials
	if (verbose === data.session.verbose) {
		res.setCredentials({
			email: userData.email || data.session.email,
			userName: userData.userName || data.session.userName,
			role: userData.role || data.session.role,
			verbose: userData.verbose || data.session.verbose,
		});
	}
}

async function deleteProfileController(req, res, data) {
	const verbose = data.params.verbose;

	if (!checkRights(data, res, verbose)) {
		return;
	}

	await User.del({
		verbose,
	});
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
			verbose: user.verbose,
		});

		res.setCredentials({
			email: user.email,
			login: user.userName,
			role: user.role,
			verbose: user.verbose,
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
			verbose: uuid(),
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

function checkRights(data, res, verbose) {
	if (data.session.role !== "ADMIN" && data.session.verbose !== verbose) {
		res.error("You don't have rights to change the user profile");
		res.code(res.CODES.Forbidden);
		return false;
	}
	if (data.reqData.role && data.session.role !== "ADMIN") {
		res.error("You aren't allowed to change role");
		res.code(res.CODES.Forbidden);
		return false;
	}

	return true;
}

module.exports.loginController = loginController;
module.exports.signupController = signupController;
module.exports.authRule = authRule;
module.exports.requireAuthorizationRule = requireAuthorization;
module.exports.getProfileController = getProfileController;
module.exports.getProfilesController = getProfilesController;
module.exports.updateProfileController = updateProfileController;
module.exports.deleteProfileController = deleteProfileController;
