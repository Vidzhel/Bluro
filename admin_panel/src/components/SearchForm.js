import React from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import PropTypes from "prop-types";
import Button from "react-bootstrap/Button";

export function SearchForm(props) {
	const { searchOptions, values, onChange, onSubmit } = props;
	const nothingToFilter = !Object.values(searchOptions).length;

	return (
		<Form className="mb-2">
			<Form.Row className="align-items-center">
				<Col xs="5">
					<Form.Label for="inlineFormInput" srOnly>
						Search string
					</Form.Label>
					<Form.Control
						name="search"
						onChange={onChange}
						id="inlineFormInput"
						value={values.search}
						placeholder="Search string"
					/>
				</Col>
				<Col xs="4">
					<Form.Label for="inlineFormInputGroup" srOnly>
						Search parameter
					</Form.Label>
					<InputGroup>
						<InputGroup.Prepend>
							<InputGroup.Text>#</InputGroup.Text>
						</InputGroup.Prepend>
						<FormControl
							as="select"
							onChange={onChange}
							id="inlineFormInputGroup"
							disabled={nothingToFilter}
							name="param"
							value={values.param}
							placeholder="Search parameter">
							{nothingToFilter ? (
								<option value="null">Nothing to filter</option>
							) : (
								Object.entries(searchOptions).map(([value, name], index) => {
									return (
										<option
											defaultChecked={index === 1}
											value={value}
											key={value}>
											{name}
										</option>
									);
								})
							)}
						</FormControl>
					</InputGroup>
				</Col>
				<Col xs={3}>
					<Button variant="outline-success" type="submit" onClick={onSubmit} block>
						Search
					</Button>
				</Col>
			</Form.Row>
		</Form>
	);
}

SearchForm.propTypes = {
	searchOptions: PropTypes.object.isRequired,
	values: PropTypes.shape({
		search: PropTypes.string.isRequired,
		param: PropTypes.string.isRequired,
	}),
	onChange: PropTypes.func.isRequired,
	onSubmit: PropTypes.func.isRequired,
};
