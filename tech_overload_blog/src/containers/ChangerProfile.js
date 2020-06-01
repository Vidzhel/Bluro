import React from "react";
import styled from "styled-components";
import { ChangerProfileDataForm } from "../components/ChangeProfileDataForm";
import { connect } from "react-redux";
import { updateProfile } from "../actions/profile";
import { VERBOSE_REGEXP, EMAIL_REGEXP, IMAGE_EXTENSION_REGEXP } from "../assets/constants";

const StyledContainer = styled.div`
	margin-top: 50px;
	padding: 20px;
`;

export class ChangeProfile extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			errors: {
				login: null,
				email: null,
				verbose: null,
				about: null,
				img: null,
				password: null,
				repPassword: null,
			},
			values: {
				login: "",
				email: "",
				verbose: "",
				about: "",
				password: "",
				repPassword: "",
			},
			touched: {
				login: false,
				email: false,
				img: false,
				verbose: false,
				about: false,
				password: false,
				repPassword: false,
			},
			loading: false,
		};
		this.fileInput = React.createRef();
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
		if (values[field] === undefined) {
			return;
		}

		values[field] = value;
		touched[field] = true;

		this.setState({
			values,
			touched,
		});
	};

	handleUpdateSubmit = (event) => {
		event.preventDefault();
		event.stopPropagation();
		if (!this.validateUpdate()) {
			return;
		}

		const file = this.fileInput.current.files[0];

		const values = this.state.values;
		const data = {
			userName: values.login || undefined,
			email: values.email || undefined,
			verbose: values.verbose || undefined,
			about: values.about || undefined,
			pass: values.password || undefined,
			repPass: values.repPassword || undefined,
			img: file,
		};

		this.props.updateProfile(data);
	};

	validateUpdate = () => {
		const values = this.state.values;

		this.setState({
			touched: {
				login: true,
				email: true,
				verbose: true,
				about: true,
				img: true,
				password: true,
				repPassword: true,
			},
		});

		if ((values.password || values.repPassword) && !(values.password && values.repPassword)) {
			this._setError("password", "Both passwords have to be specified");
			this._setError("repPassword", "Both passwords have to be specified");
			return;
		} else {
			this._setError("password", "");
			this._setError("repPassword", "");
		}

		if (values.password !== values.repPassword) {
			this._setError("repPassword", "Passwords don't match");
			this._setError("password", "Passwords don't match");
			return;
		} else {
			this._setError("password", "");
			this._setError("repPassword", "");
		}

		if (values.password && (values.password < 8 || values.password > 15)) {
			this._setError(
				"repPassword",
				"Password has to be more than 8 symbols and less then 15 in length",
			);
			this._setError(
				"password",
				"Password has to be more than 8 symbols and less then 15 in length",
			);
			return;
		} else {
			this._setError("password", "");
			this._setError("repPassword", "");
		}

		const file = this.fileInput.current.files[0];
		if (file && !IMAGE_EXTENSION_REGEXP.test(file.name)) {
			this._setError(
				"img",
				'Only those image types are allowed: ".jpg", ".jpeg", ".bmp", ".gif", ".png"',
			);
			return;
		} else {
			this._setError("img", "");
		}

		if (values.verbose && (!values.verbose.length || !VERBOSE_REGEXP.test(values.verbose))) {
			this._setError(
				"verbose",
				"Verbose name can only contain the following symbols (spaces are forbidden):a-z0-9A-Z-._~",
			);
			return;
		} else {
			this._setError("verbose", "");
		}

		if (values.email && !EMAIL_REGEXP.test(values.email)) {
			this._setError("email", "Wrong email format");
			return;
		} else {
			this._setError("email", "");
		}

		if (values.about && values.about.length > 500) {
			this._setError("about", "Can't contain more than 500 symbols");
			return;
		} else {
			this._setError("about", "");
		}

		return true;
	};

	render() {
		return (
			<StyledContainer>
				<ChangerProfileDataForm
					{...this.state}
					fileInput={this.fileInput}
					handleChange={this.handleChange}
					handleSubmit={this.handleUpdateSubmit}
				/>
			</StyledContainer>
		);
	}
}

const mapDispatchToProps = {
	updateProfile,
};

ChangeProfile = connect(null, mapDispatchToProps)(ChangeProfile);
