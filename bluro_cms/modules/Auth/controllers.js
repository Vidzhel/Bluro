const User = require("./User");
const Follower = require("./Follower");
const bcrypt = require("bcryptjs");
const jwtGenerator = require("njwt");
const { v1: uuid } = require("uuid");
const USER_IMAGES_LOCATION = "profiles/img";

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
	const valid = await checkToken(req, res, data, token);

	if (req.url === "/login" && valid) {
		return true;
	} else if (req.url === "/login" && !valid && !data.reqData.email && !data.reqData.pass) {
		return true;
	}
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
				resolve(false);
			}
		});
	});
}

function handleTokenLogin(req, res, user, tokenBody, data) {
	if (user) {
		if (user.id === tokenBody.id) {
			const credentials = {
				email: tokenBody.email,
				userName: user.userName,
				role: tokenBody.role,
				verbose: tokenBody.verbose,
				img: user.img,
			};

			data.session = { ...credentials, id: tokenBody.id };

			res.setCredentials(credentials);
			return true;
		}
	}

	return false;
}

async function loginController(req, res, data) {
	const credentials = data.reqData;

	if (!credentials.email || !credentials.pass) {
		res.error("Email or password isn't provided");
		res.code(res.CODES.BadReq);
		return;
	}

	await login(res, credentials);
}

async function signupController(req, res, data) {
	const credentials = data.reqData;

	if (validateRegister(res, credentials)) {
		await signup(res, credentials, data.files);
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

	const params = User.selector.processFilterParameters(req.query);
	const set = await User.selector.filter(params).limit(offset, count).fetch();

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

	let { userName, verbose: newVerbose, email, pass, repPass, role, about } = data.reqData;
	const img = data.files["img"];

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

	if (newVerbose) {
		set = await User.selector.filter({ verbose: newVerbose }).fetch();
		if (set.length !== 0) {
			res.error("User with the same verbose has already been registered");
			res.code(res.CODES.Forbidden);
			return;
		}
	}

	const userData = {
		userName,
		verbose: newVerbose,
		email,
		pass,
		role,
		img,
		about,
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
	const updatedUserSet = await User.selector.filter({ email: data.session.email }).fetch();
	const updatedUser = updatedUserSet.get(0);

	if (img) {
		await FilesManager.persistTempFile(img, USER_IMAGES_LOCATION);
		res.setIdentifiers({ img });
	}

	// If that user was updated, set new credentials
	if (verbose === data.session.verbose) {
		const credentials = {
			email: updatedUser.email,
			userName: updatedUser.userName,
			role: updatedUser.role,
			verbose: updatedUser.verbose,
		};

		const jwt = generateJWT({
			...credentials,
			id: updatedUser.id,
			pass: updatedUser.pass,
		});

		res.setCookie("token", jwt);
		res.setCredentials({
			...credentials,
			img: updatedUser.img,
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

async function followUserController(req, res, data) {
	const user = data.params.user;

	if (user.verbose === data.session.verbose) {
		res.error("You can't follow yourself");
		res.code(res.CODES.Forbidden);
		return;
	}

	const usersSet = await User.selector.filter({ verbose: user }).fetch();
	const userInstance = usersSet.get(0);

	if (!usersSet.length) {
		res.error("User doesn't exist");
		res.code(res.CODES.NotFound);
		return;
	}
	const subscriptionsSet = await Follower.selector
		.filter({ user: user, follower: data.session.verbose })
		.fetch();

	if (subscriptionsSet.length) {
		res.error("You've already subscribed");
		res.code(res.CODES.Forbidden);
		return;
	}

	const follow = new Follower();
	follow.user = user;
	follow.follower = data.session.verbose;

	await follow.save();
	userInstance.followers += 1;
	await userInstance.save();
}

async function unfollowUserController(req, res, data) {
	const user = data.params.user;

	const usersSet = await User.selector.filter({ verbose: user }).fetch();
	const userInstance = usersSet.get(0);

	if (!userInstance) {
		res.error("User doesn't exist");
		res.code(res.CODES.NotFound);
		return;
	}

	const subscriptionsSet = await Follower.selector
		.filter({ user: user, follower: data.session.verbose })
		.fetch();

	if (!subscriptionsSet.length) {
		res.error("You're not subscribed");
		res.code(res.CODES.Forbidden);
		return;
	}

	subscriptionsSet.get(0).del();
	userInstance.followers -= 1;
	await userInstance.save();
}

async function getFollowersController(req, res, data) {
	const user = data.params.user;
	const count = parseInt(req.query.count) || 10;
	const offset = parseInt(req.query.offset) || 0;

	const subscriptionsSet = await Follower.selector
		.filter({ user: user })
		.limit(offset, count)
		.fetch();

	const list = await subscriptionsSet.getList();
	const filteredList = [];
	for (const sub of list) {
		const filteredObj = {};
		filteredList.push(filteredObj);
		for (const [prop, val] of Object.entries(sub.follower)) {
			filteredObj[prop] = val;
		}
	}

	res.setCollection(filteredList, offset, count);
}

async function getFollowingsController(req, res, data) {
	const user = data.params.user;
	const count = parseInt(req.query.count) || 10;
	const offset = parseInt(req.query.offset) || 0;

	const subscriptionsSet = await Follower.selector
		.filter({ follower: user })
		.limit(offset, count)
		.fetch();

	const list = await subscriptionsSet.getList();
	const filteredList = [];
	for (const sub of list) {
		const filteredObj = {};
		filteredList.push(filteredObj);
		for (const [prop, val] of Object.entries(sub.user)) {
			filteredObj[prop] = val;
		}
	}
	res.setCollection(filteredList, offset, count);
}

async function isUsersFollower(req, res, data) {
	const user = data.params.user;
	const follower = data.params.follower;

	const subscriptionsSet = await Follower.selector
		.filter({ user: user, follower: follower })
		.fetch();

	if (subscriptionsSet.length) {
		res.setEntry({ isFollowing: true });
	} else {
		res.setEntry({ isFollowing: false });
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
			verbose: user.verbose,
		});

		res.setCredentials({
			email: user.email,
			login: user.userName,
			role: user.role,
			verbose: user.verbose,
			img: user.img,
		});

		res.setCookie("token", jwt);
		res.success("You've been successfully logged in");
	} else {
		res.error("Wrong login or password was specified");
		res.code(res.CODES.Forbidden);
	}
}

async function signup(res, credentials, files) {
	const set = await User.selector
		.filter({
			email: credentials.email,
		})
		.fetch();

	if (set.length !== 0) {
		res.error("An user with the same email has already been created");
		res.code(res.CODES.Forbidden);
	} else {
		const userData = {
			verbose: uuid(),
			userName: credentials.login,
			email: credentials.email,
			pass: credentials.pass,
			img: files["img"] || "default.jpg",
			followers: 0,
			following: 0,
			about: "",
		};

		const result = User.validateValues(userData, true);
		if (result.fail) {
			res.error(result.description);
			res.code(res.CODES.BadReq);
			return;
		}

		const user = new User(userData);
		await user.save();

		if (files["img"]) {
			await FilesManager.persistTempFile(files["img"], USER_IMAGES_LOCATION);
		}

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
module.exports.followUserController = followUserController;
module.exports.unfollowUserController = unfollowUserController;
module.exports.getFollowersController = getFollowersController;
module.exports.getFollowingsController = getFollowingsController;
module.exports.isUsersFollower = isUsersFollower;
