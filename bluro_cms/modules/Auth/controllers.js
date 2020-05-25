const User = require("./User");
const bcrypt = require("bcryptjs");
const jwtGenerator = require("njwt");

const EMAIL_REGEXP = RegExp(
	/^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/,
	"i",
);

/**
 * Checks for jwt token, if exist fills in session data
 * If token is valid and request was made to log in it'll be rejected as you
 * need to log out first
 *
 * @param req
 * @param res
 * @param data
 * @return {Promise<unknown>}
 */
async function authRule(req, res, data) {
	const token = await req.getCookie("token");
	if (!token) {
		return;
	}

	return await checkToken(req, res, data, token);
}

async function checkToken(req, res, data, token) {
	return new Promise((resolve) => {
		jwtGenerator.verify(token, ConfigsManager.getEntry("secret"), (err, verifiedJWT) => {
			const body = verifiedJWT.body;
			verifyUser(body.email, body.pass, false)
				.then((user) => {
					if (!err && user) {
						const credentials = {
							email: body.email,
							userName: user.userName,
							blogName: user.blogName,
							role: body.role,
						};

						data = {
							...data, session: {...credentials, id: body.id},
						};

						res.setCredentials(credentials);

						if (req.url === "/login") {
							res.info("You need to log out before logging in again");
							resolve(true);
						}
					}
				});
		});
	});
}

async function loginController(req, res) {
	const credentials = req.json().auth;

	if (validateLogin(res, credentials)) {
		await login(res, credentials);
	}
}

async function signupController(req, res) {
	const credentials = req.json().auth;

	if (validateRegister(res, credentials)) {
		await signup(res, credentials);
	}
}

function validateRegister(res, data) {
	if (!data) {
		res.error("Bad request, auth data was expected");
		res.code(res.CODES.BadReq);
		return false;
	}

	if (!data.login || !data.pass || !data.repPass || !data.email || !data.blogName) {
		res.error("Auth data have to be specified");
		res.code(res.CODES.BadReq);
		return false;
	}

	if (data.pass.length < 8 || data.pass.length > 15) {
		res.error("Pass has to have at least 8 symbols and no more than 15");
		res.code(res.CODES.BadReq);
		return false;
	}

	if (!EMAIL_REGEXP.test(data.email)) {
		res.error("Wrong email format");
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

function validateLogin(res, data) {
	if (!data) {
		res.error("Bad request, auth data was expected");
		res.code(res.CODES.BadReq);
		return false;
	}

	if (!data.email || !data.pass) {
		res.error("Auth data have to be specified");
		res.code(res.CODES.BadReq);
		return false;
	}

	if (data.pass.length < 8) {
		res.error("Pass has to have at least 8 symbols");
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
			id: user.id, email: user.email, pass: user.pass, role: user.role,
		});

		res.setCredentials({
			email: user.email, pass: user.pass, role: user.role,
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
		const hash = bcrypt.hashSync(credentials.pass, 8);
		const user = new User();

		user.userName = credentials.login;
		user.email = credentials.email;
		user.blogName = credentials.blogName;
		user.pass = hash;
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

module.exports.loginPage = loginController;
module.exports.signupPage = signupController;
module.exports.authRule = authRule;
