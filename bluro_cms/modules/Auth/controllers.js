const User = require("./User");
const EMAIL_REGEXP = RegExp(
	/^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/,
	"i",
);

async function loginPage(req, res, data) {
	await validateLogin(res, req.json().auth);
}

async function signupPage(req, res, data) {
	await validateRegister(res, req.json().auth);
}

async function validateRegister(res, data) {
	if (!data) {
		res.error("Bad request, auth data was expected");
		res.code(res.CODES.BadReq);
		return;
	}

	if (!data.login || !data.pass || !data.repPass || !data.email || !data.blogName) {
		res.error("Auth data have to be specified");
		res.code(res.CODES.BadReq);
		return;
	}

	if (data.pass.length < 8) {
		res.error("Pass has to have at least 8 symbols");
		res.code(res.CODES.BadReq);
		return;
	}

	if (!EMAIL_REGEXP.test(data.email)) {
		res.error("Wrong email format");
		res.code(res.CODES.BadReq);
		return;
	}

	if (data.pass !== data.repPass) {
		res.error("Passwords don't match");
		res.code(res.CODES.BadReq);
		return;
	}

	const set = await User.selector
		.filter({
			email: data.email,
		})
		.fetch();

	if (set.length !== 0) {
		res.error("An user with the same login has already been created");
	} else {
		const user = new User();

		user.userName = data.login;
		user.email = data.email;
		user.blogName = data.blogName;
		user.password = data.pass;
		await user.save();

		res.code(res.CODES.Created);
		res.success("You've successfully registered");
	}
}

async function validateLogin(res, data) {
	if (!data) {
		res.error("Bad request, auth data was expected");
		res.code(res.CODES.BadReq);
		return;
	}

	if (!data.email || !data.pass) {
		res.error("Auth data have to be specified");
		res.code(res.CODES.BadReq);
		return;
	}

	if (data.pass.length < 8) {
		res.error("Pass has to have at least 8 symbols");
		res.code(res.CODES.BadReq);
		return;
	}

	const set = await User.selector
		.filter({
			email: data.email,
		})
		.fetch();

	if (set.length === 0 || set.get(0).password !== data.pass) {
		res.error("Wrong login or password was specified");
		res.code(res.CODES.Forbidden);
	}
}

module.exports.loginPage = loginPage;
module.exports.signupPage = signupPage;
