import React from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import PropTypes from "prop-types";

export const ChangerProfileDataForm = (props) => {
	const {
		errors,
		handleSubmit,
		handleChange,
		values,
		touched,
		fileInput,
		onDeleteProfile,
	} = props;

	return (
		<div>
			<h2>Update profile</h2>
			<Form noValidate onSubmit={handleSubmit} className="mb-1">
				<Form.Group>
					<Form.Label>User name</Form.Label>
					<Form.Control
						type="text"
						name="login"
						value={values.login}
						isInvalid={touched.login && errors.login}
						onChange={handleChange}
						placeholder="Enter login"
					/>
					<Form.Control.Feedback type="invalid">{errors.login}</Form.Control.Feedback>
				</Form.Group>

				<Form.Group controlId="formBasicEmail">
					<Form.Label>Email address</Form.Label>
					<Form.Control
						onChange={handleChange}
						type="email"
						name="email"
						value={values.email}
						isInvalid={touched.email && errors.email}
						placeholder="Enter email"
					/>
					<Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
				</Form.Group>

				<Form.Group>
					<Form.Label>Verbose name (readable url)</Form.Label>
					<Form.Control
						onChange={handleChange}
						type="text"
						name="verbose"
						value={values.verbose}
						isInvalid={touched.verbose && errors.verbose}
						placeholder="Enter verbose name"
					/>
					<Form.Control.Feedback type="invalid">{errors.verbose}</Form.Control.Feedback>
				</Form.Group>

				<Form.Group>
					<Form.Label>About</Form.Label>
					<Form.Control
						onChange={handleChange}
						name="about"
						as="textarea"
						value={values.about}
						isInvalid={touched.about && errors.about}
					/>
					<Form.Control.Feedback type="invalid">{errors.about}</Form.Control.Feedback>
				</Form.Group>

				<Form.Group>
					<Form.Label>Profile photo</Form.Label>
					<Form.Control
						onChange={handleChange}
						type="file"
						name="img"
						ref={fileInput}
						isInvalid={touched.img && errors.img}
					/>
					<Form.Control.Feedback type="invalid">{errors.img}</Form.Control.Feedback>
				</Form.Group>

				<Form.Group>
					<Form.Label>Password</Form.Label>
					<Form.Control
						name="password"
						onChange={handleChange}
						value={values.password}
						isInvalid={touched.password && errors.password}
						type="password"
						placeholder="Password"
					/>
					<Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
				</Form.Group>
				<Form.Group>
					<Form.Label>Repeat Password</Form.Label>
					<Form.Control
						name="repPassword"
						onChange={handleChange}
						type="password"
						value={values.repPassword}
						isInvalid={touched.repPassword && errors.repPassword}
						placeholder="Repeat Password"
					/>
					<Form.Control.Feedback type="invalid">
						{errors.repPassword}
					</Form.Control.Feedback>
				</Form.Group>
				<Button variant="primary" type="submit" block>
					Update
				</Button>
			</Form>

			<Button variant="danger" block onClick={onDeleteProfile}>
				Delete
			</Button>
		</div>
	);
};

ChangerProfileDataForm.propTypes = {
	errors: PropTypes.exact({
		login: PropTypes.string,
		email: PropTypes.string,
		verbose: PropTypes.string,
		about: PropTypes.string,
		img: PropTypes.string,
		password: PropTypes.string,
		repPassword: PropTypes.string,
	}),
	values: PropTypes.exact({
		login: PropTypes.string.isRequired,
		email: PropTypes.string.isRequired,
		verbose: PropTypes.string.isRequired,
		about: PropTypes.string.isRequired,
		password: PropTypes.string.isRequired,
		repPassword: PropTypes.string.isRequired,
	}),
	touched: PropTypes.exact({
		login: PropTypes.bool.isRequired,
		email: PropTypes.bool.isRequired,
		verbose: PropTypes.bool.isRequired,
		about: PropTypes.bool.isRequired,
		img: PropTypes.bool.isRequired,
		password: PropTypes.bool.isRequired,
		repPassword: PropTypes.bool.isRequired,
	}),
	handleChange: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func.isRequired,
	onDeleteProfile: PropTypes.func.isRequired,
	loading: PropTypes.bool.isRequired,
};
