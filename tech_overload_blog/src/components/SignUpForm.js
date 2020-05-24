import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import PropTypes from "prop-types";

export const SignUpForm = (props) => {
	const [validated, setValidated] = useState(false);

	const {
		errors,
		handleSubmit,
		handleChange,
		values,
		resultMessage,
		resultError,
		touched,
		loading,
	} = props;
	let alert = null;

	if (resultMessage) {
		alert = resultError ? (
			<Alert className="mt-3" variant="danger">
				{resultMessage}
			</Alert>
		) : (
			<Alert className="mt-3" variant="info">
				{resultMessage}
			</Alert>
		);
	}

	return (
		<div>
			<h2>Sign up</h2>
			<Form noValidate onSubmit={handleSubmit}>
				<Form.Group>
					<Form.Label>User name</Form.Label>
					<Form.Control
						required={true}
						type="text"
						name="login"
						value={values.login}
						isInvalid={touched.login && errors.login}
						onChange={handleChange}
						placeholder="Enter login"
					/>
					<Form.Control.Feedback type="invalid">{errors.login}</Form.Control.Feedback>
				</Form.Group>

				<Form.Group>
					<Form.Label>Blog name</Form.Label>
					<Form.Control
						type="text"
						name="blogName"
						required={true}
						value={values.blogName}
						isInvalid={touched.blogName && errors.blogName}
						onChange={handleChange}
						placeholder="Enter your blog name"
					/>
					<Form.Control.Feedback type="invalid">{errors.blogName}</Form.Control.Feedback>
				</Form.Group>

				<Form.Group controlId="formBasicEmail">
					<Form.Label>Email address</Form.Label>
					<Form.Control
						onChange={handleChange}
						type="email"
						required={true}
						name="email"
						value={values.email}
						isInvalid={touched.email && errors.email}
						placeholder="Enter email"
					/>
					<Form.Text className="text-muted">
						We'll never share your email with anyone else.
					</Form.Text>
					<Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
				</Form.Group>

				<Form.Group controlId="formBasicPassword">
					<Form.Label>Password</Form.Label>
					<Form.Control
						name="password"
						onChange={handleChange}
						required={true}
						value={values.password}
						isInvalid={touched.password && errors.password}
						type="password"
						placeholder="Password"
					/>
					<Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
				</Form.Group>
				<Form.Group controlId="formBasicPassword">
					<Form.Label>Repeat Password</Form.Label>
					<Form.Control
						name="repPassword"
						onChange={handleChange}
						type="password"
						required={true}
						value={values.repPassword}
						isInvalid={touched.repPassword && errors.repPassword}
						placeholder="Repeat Password"
					/>
					<Form.Control.Feedback type="invalid">
						{errors.repPassword}
					</Form.Control.Feedback>
				</Form.Group>
				<Button variant="primary" type="submit" block>
					Register
				</Button>
			</Form>
			{alert}
		</div>
	);
};

SignUpForm.propTypes = {
	errors: PropTypes.exact({
		login: PropTypes.string,
		email: PropTypes.string,
		blogName: PropTypes.string,
		password: PropTypes.string,
		repPassword: PropTypes.string,
	}),
	values: PropTypes.exact({
		login: PropTypes.string.isRequired,
		email: PropTypes.string.isRequired,
		blogName: PropTypes.string.isRequired,
		rememberMe: PropTypes.string.isRequired,
		password: PropTypes.string.isRequired,
		repPassword: PropTypes.string.isRequired,
	}),
	touched: PropTypes.exact({
		login: PropTypes.bool.isRequired,
		email: PropTypes.bool.isRequired,
		blogName: PropTypes.bool.isRequired,
		rememberMe: PropTypes.bool.isRequired,
		password: PropTypes.bool.isRequired,
		repPassword: PropTypes.bool.isRequired,
	}),
	handleChange: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func.isRequired,
	loading: PropTypes.bool.isRequired,
	resultMessage: PropTypes.string,
	resultError: PropTypes.bool,
};
