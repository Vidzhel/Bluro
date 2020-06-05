import React from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import PropTypes from "prop-types";

export const WriteCommentForm = (props) => {
	const {
		errors,
		handleSubmit,
		handleChange,
		values,
		touched,
		loading,
		allowDeletion,
		handleCancel,
		handleDelete,
	} = props;

	return (
		<div>
			<Form noValidate onSubmit={handleSubmit} className="mb-1">
				<Form.Group>
					<Form.Control
						onChange={handleChange}
						as="textarea"
						name="comment"
						value={values.comment}
						isInvalid={touched.comment && errors.comment}
						placeholder="Enter comment message"
					/>
					<Form.Control.Feedback type="invalid">{errors.comment}</Form.Control.Feedback>
				</Form.Group>

				<div className="buttons d-flex">
					<Button variant="outline-primary" type="submit" size="sm">
						Publish
					</Button>
					{allowDeletion ? (
						<div>
							<Button
								variant="outline-danger"
								onClick={handleDelete}
								size="sm"
								className="ml-2">
								Delete
							</Button>
							<Button
								variant="outline-dark"
								onClick={handleCancel}
								className="ml-2"
								size="sm">
								Cancel
							</Button>
						</div>
					) : null}
				</div>
			</Form>
		</div>
	);
};

WriteCommentForm.propTypes = {
	errors: PropTypes.shape({
		comment: PropTypes.string,
	}),
	values: PropTypes.shape({
		comment: PropTypes.string.isRequired,
	}),
	touched: PropTypes.shape({
		comment: PropTypes.bool.isRequired,
	}),
	handleChange: PropTypes.func.isRequired,
	handleSubmit: PropTypes.func.isRequired,
	handleDelete: PropTypes.func.isRequired,
	handleCancel: PropTypes.func.isRequired,
	allowDeletion: PropTypes.bool.isRequired,
	loading: PropTypes.bool.isRequired,
};
