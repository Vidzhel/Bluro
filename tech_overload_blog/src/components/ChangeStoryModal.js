import React from "react";
import Form from "react-bootstrap/Form";
import PropTypes from "prop-types";

export const ChangeStoryFrom = (props) => {
	const {
		errors,
		handleSubmit,
		handleChange,
		values,
		touched,
		previewImgFile,
		contentFile,
	} = props;

	return (
		<div>
			<Form noValidate onSubmit={handleSubmit} className="mb-1">
				<Form.Group>
					<Form.Label>Title</Form.Label>
					<Form.Control
						type="text"
						name="title"
						value={values.title}
						isInvalid={touched.title && errors.title}
						onChange={handleChange}
						placeholder="Enter title"
					/>
					<Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
				</Form.Group>

				<Form.Group>
					<Form.Label>Verbose name (human readable url name)</Form.Label>
					<Form.Control
						type="text"
						name="verbose"
						value={values.verbose}
						isInvalid={touched.verbose && errors.verbose}
						onChange={handleChange}
						placeholder="Enter verbose"
					/>
					<Form.Control.Feedback type="invalid">{errors.verbose}</Form.Control.Feedback>
					<Form.Text className="text-muted">Optional</Form.Text>
				</Form.Group>

				<Form.Group>
					<Form.Label>Description</Form.Label>
					<Form.Control
						name="description"
						value={values.description}
						isInvalid={touched.description && errors.description}
						onChange={handleChange}
						placeholder="Enter description"
					/>
					<Form.Control.Feedback type="invalid">
						{errors.description}
					</Form.Control.Feedback>
				</Form.Group>

				<Form.Group>
					<Form.Label>Preview image</Form.Label>
					<Form.Control
						type="file"
						name="previewImg"
						ref={previewImgFile}
						isInvalid={touched.previewImg && errors.previewImg}
						onChange={handleChange}
					/>
					<Form.Control.Feedback type="invalid">
						{errors.previewImg}
					</Form.Control.Feedback>
				</Form.Group>

				<Form.Group>
					<Form.Label>Content file</Form.Label>
					<Form.Control
						type="file"
						name="content"
						ref={contentFile}
						isInvalid={touched.content && errors.content}
						onChange={handleChange}
					/>
					<Form.Control.Feedback type="invalid">{errors.content}</Form.Control.Feedback>
				</Form.Group>
				<Form.Text className="text-muted">Markdown content file</Form.Text>
			</Form>
		</div>
	);
};

ChangeStoryFrom.propTypes = {
	errors: PropTypes.exact({
		title: PropTypes.string,
		verbose: PropTypes.string,
		description: PropTypes.string,
		previewImg: PropTypes.string,
		content: PropTypes.string,
	}),
	values: PropTypes.exact({
		title: PropTypes.string.isRequired,
		verbose: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
	}),
	touched: PropTypes.exact({
		title: PropTypes.bool.isRequired,
		verbose: PropTypes.bool.isRequired,
		description: PropTypes.bool.isRequired,
		previewImg: PropTypes.bool.isRequired,
		content: PropTypes.bool.isRequired,
	}),
	handleChange: PropTypes.func.isRequired,
	loading: PropTypes.bool.isRequired,
	previewImgFile: PropTypes.object.isRequired,
	contentFile: PropTypes.object.isRequired,
};
