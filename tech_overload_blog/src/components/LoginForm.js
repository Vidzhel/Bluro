import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

export const LoginForm = (props) => {
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
			<h2>Login</h2>
			<Form noValidate onSubmit={handleSubmit} className="mb-1">
				<Form.Group>
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
					<Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
				</Form.Group>

				<Form.Group>
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

				<Form.Group controlId="formBasicCheckbox">
					<Form.Check
						type="checkbox"
						label="Remember me"
						name="rememberMe"
						onChange={handleChange}
						value={values.rememberMe}
					/>
				</Form.Group>

				<Button variant="primary" type="submit" block>
					Login
				</Button>
			</Form>

			<Link to="/auth/signup">Don't have an account?</Link>

			{alert}
		</div>
	);
};

LoginForm.propTypes = {
	errors: PropTypes.shape({
		email: PropTypes.string,
		password: PropTypes.string,
	}),
	values: PropTypes.shape({
		email: PropTypes.string.isRequired,
		rememberMe: PropTypes.string.isRequired,
		password: PropTypes.string.isRequired,
	}),
	touched: PropTypes.shape({
		email: PropTypes.bool.isRequired,
		rememberMe: PropTypes.bool.isRequired,
		password: PropTypes.bool.isRequired,
	}),
	handleChange: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func.isRequired,
	loading: PropTypes.bool.isRequired,
	resultMessage: PropTypes.string,
	resultError: PropTypes.bool,
};
