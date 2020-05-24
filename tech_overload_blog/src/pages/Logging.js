import React from "react";
import { Auth } from "../components/Auth";
import { Route, useRouteMatch, Switch } from "react-router-dom";
import { SignUpForm } from "../components/SignUpForm";
import { LoginForm } from "../components/LoginForm";
import { NoMatch } from "./NoMatch";
import { logIn, register } from "../actions/session";
import { connect } from "react-redux";
import { getSessionError, getSessionInfo } from "../assets/selectors/session";

const NAME_REGEXP = RegExp(/^\S{6,}$/);
const EMAIL_REGEXP = RegExp(
	/^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/,
	"i",
);

class LoggingPage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			errors: {
				login: null,
				email: null,
				blogName: "",
				password: null,
				repPassword: null,
			},
			values: {
				login: "",
				email: "",
				blogName: "",
				password: "",
				repPassword: "",
				rememberMe: false,
			},
			touched: {
				login: false,
				email: false,
				blogName: false,
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
			auth: {
				login: values.login,
				email: values.email,
				blogName: values.blogName,
				pass: values.password,
				repPass: values.repPassword,
			},
		};

		this.props.register(data, this.props.history);
	};

	validateReg = () => {
		const { login, email, blogName, password, repPassword } = this.state.values;

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

		if (!NAME_REGEXP.test(login)) {
			this._setError(
				"login",
				"Login must have at least 6 symbols and doesn't include spaces",
			);
			return;
		} else {
			this._setError("login", "");
		}

		if (!NAME_REGEXP.test(blogName)) {
			this._setError(
				"blogName",
				"Blog name must have at least 6 symbols and doesn't include spaces",
			);
			return;
		} else {
			this._setError("blogName", "");
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
			auth: {
				email: values.email,
				pass: values.password,
			},
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
				<Route component={NoMatch} />
			</Switch>
		);
	}
}

const mapDispatchToProps = {
	logIn,
	register,
};

const mapStateToProps = (state) => {
	return {
		resultMessage: getSessionError(state) || getSessionInfo(state),
		resultError: !!getSessionError(state),
	};
};

LoggingPage = connect(mapStateToProps, mapDispatchToProps)(LoggingPage);

export { LoggingPage };
