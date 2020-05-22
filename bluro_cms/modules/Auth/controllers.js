const User = require("./User");

const MODULE_NAME = "AUTH";

async function loginPage(req, res, data) {
	await validateLogin(res, req.json().auth);
}

async function signupPage(req, res, data) {
	await validateRegister(res, req.json().auth);
}

async function validateRegister(res, data) {
	if (!data) {
		res.error("Bad request, auth data was expected");
		return;
	}

	if (!data.login || !data.pass1 || !data.pass2) {
		res.error("Auth data have to be specified");
	}

	if (data.pass1.length < 6) {
		res.error("Pass has to have at least 6 symbols");
	}

	if (data.pass1 !== data.pass2) {
		res.error("Pass has to have at least 6 symbols");
	}

	const set = await User.selector
		.filter({
			userName: data.login,
		})
		.fetch();

	if (set.length !== 0) {
		res.error("An user with the same login has already been created");
	} else {
		const user = new User();

		user.userName = data.login;
		user.password = data.pass1;
		await user.save();
		await user.del();

		res.success("You've successfully registered");
	}
}

async function validateLogin(res, data) {
	if (!data) {
		res.error("Bad request, auth data was expected");
		return;
	}

	if (!data.login || !data.pass) {
		res.error("Auth data have to be specified");
	}

	if (data.pass.length < 6) {
		res.error("Pass has to have at least 6 symbols");
	}

	const set = await User.selector
		.filter({
			password: data.pass,
		})
		.fetch();

	if (set.length === 0 || set[0].login !== data.login) {
		res.error("Wrong login or password was specified");
	}
}

module.exports.loginPage = loginPage;
module.exports.signupPage = signupPage;
