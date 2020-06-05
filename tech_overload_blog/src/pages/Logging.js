import React from "react";
import { Auth } from "../containers/Auth";
import { Route, useRouteMatch, Switch, Redirect } from "react-router-dom";
import { SignUpForm } from "../components/SignUpForm";
import { LoginForm } from "../components/LoginForm";
import { NotFoundPage } from "./NotFoundPage";
import { logIn, register } from "../actions/session";
import { connect } from "react-redux";
import { EMAIL_REGEXP } from "../assets/constants";

const NAME_REGEXP = RegExp(/^\S{6,}$/);

class LoggingPage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			errors: {
				login: null,
				email: null,
				password: null,
				repPassword: null,
			},
			values: {
				login: "",
				email: "",
				password: "",
				repPassword: "",
				rememberMe: false,
			},
			touched: {
				login: false,
				email: false,
				password: false,
				repPassword: false,
			},
			loading: false,
		};
	}

	handleChange = (event) => {
		const input = event.target;
		const name = input.name;
		const value = input.value;

		if (!input.checkValidity()) {
			this._setError(name, "Wrong format");
		} else {
			this._setError(name, "");
		}
		this._setValue(name, value);
	};

	_setError = (field, message) => {
		const errors = Object.assign({}, this.state.errors);
		errors[field] = message;
		this.setState({
			errors,
		});
	};

	_setValue = (field, value) => {
		const values = Object.assign({}, this.state.values);
		const touched = Object.assign({}, this.state.touched);
		values[field] = value;
		touched[field] = true;

		this.setState({
			values,
			touched,
		});
	};

	handleSignUpSubmit = (event) => {
		event.preventDefault();
		event.stopPropagation();
		if (!this.validateReg()) {
			return;
		}
		const values = this.state.values;
		const data = {
			login: values.login,
			email: values.email,
			pass: values.password,
			repPass: values.repPassword,
		};

		this.props.register(data, this.props.history);
	};

	validateReg = () => {
		const { login, email, password, repPassword } = this.state.values;

		this.setState({
			touched: {
				login: true,
				email: true,
				blogName: true,
				rememberMe: true,
				password: true,
				repPassword: true,
			},
		});

		if (!login || login.length > 50 || login.length < 5) {
			this._setError("login", "Login has to be at least 0 and at most 50 symbol in length");
			return;
		} else {
			this._setError("login", "");
		}

		if (!EMAIL_REGEXP.test(email)) {
			this._setError("email", "Wrong email format");
			return;
		} else {
			this._setError("email", "");
		}

		if (password.length < 8) {
			this._setError("password", "Password must have at least 8 symbols long");
			return;
		} else {
			this._setError("password", "");
		}

		if (repPassword !== password) {
			this._setError("password", "Passwords don't match");
			this._setError("repPassword", "Passwords don't match");
			return;
		} else {
			this._setError("password", "");
			this._setError("repPassword", "");
		}

		for (const error of Object.values(this.state.errors)) {
			if (error) {
				this.setState({
					resultMessage: "Wrong data specified, please resolve issues and try again",
					resultError: true,
				});
				return;
			}
		}

		return true;
	};

	handleLoginSubmit = (event) => {
		event.preventDefault();
		event.stopPropagation();
		if (!this.validateLog()) {
			return;
		}

		const values = this.state.values;
		const data = {
			email: values.email,
			pass: values.password,
		};

		this.props.logIn(data, this.props.history);
	};

	validateLog = () => {
		const { email, password } = this.state.values;

		this.setState({
			touched: {
				email: true,
				password: true,
			},
		});

		if (!EMAIL_REGEXP.test(email)) {
			this._setError("email", "Wrong email format");
			return;
		} else {
			this._setError("email", "");
		}

		if (password.length < 8) {
			this._setError("password", "Password must have at least 8 symbols long");
			return;
		} else {
			this._setError("password", "");
		}

		for (const error of Object.values(this.state.errors)) {
			if (error) {
				this.setState({
					resultMessage: "Wrong data specified, please resolve issues and try again",
					resultError: true,
				});
				return;
			}
		}

		return true;
	};

	render() {
		return (
			<Switch>
				<Route exact path={`${this.props.match.url}/`}>
					<Redirect to={this.props.match.url + "/signup"} />
				</Route>
				<Route path={`${this.props.match.url}/login`}>
					<Auth
						{...this.state}
						resultMessage={this.props.resultMessage}
						resultError={this.props.resultError}
						handleChange={this.handleChange}
						handleSubmit={this.handleLoginSubmit}
						form={LoginForm}
					/>
				</Route>
				<Route path={`${this.props.match.url}/signup`}>
					<Auth
						{...this.state}
						resultMessage={this.props.resultMessage}
						resultError={this.props.resultError}
						handleChange={this.handleChange}
						handleSubmit={this.handleSignUpSubmit}
						form={SignUpForm}
					/>
				</Route>
				<Route component={NotFoundPage} />
			</Switch>
		);
	}
}

const mapDispatchToProps = {
	logIn,
	register,
};

LoggingPage = connect(null, mapDispatchToProps)(LoggingPage);

export { LoggingPage };
