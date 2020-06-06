import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Collapse from "react-bootstrap/Collapse";
import Button from "react-bootstrap/Button";

const StyledContainer = styled.div`
	min-height: 38px;
	border: 1px solid #ced4da;
	color: #495057;
	border-radius: 0.25rem;
	overflow: hidden;
	margin-bottom: 10px;
	transition: background-color 0.1s ease-in-out;

	&:hover {
		cursor: pointer;
		background-color: rgba(0, 0, 0, 0.03);
	}

	.header {
		border-bottom: 1px solid #ced4da;

		.title {
			padding: 6px 12px;
		}

		.button {
			height: 100%;
			padding: 6px 12px;
			border-left: 1px solid #ced4da;
			transition: background-color 0.1s ease-in-out, color 0.1s ease-in-out;
		}

		.info:hover {
			background-color: #007bff;
			color: white;
		}

		.block:hover {
			background-color: #dc3545;
			color: white;
		}
	}
`;

const Dropdown = styled(Collapse)`
	& > div {
		padding: 6px 12px;
	}
`;

export class ListItem extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			values: {
				cause: "",
				message: "",
				title: "",
			},
			errors: {
				cause: "",
				message: "",
				title: "",
			},
			expand: false,
		};
	}

	handleExpand = () => {
		this.setState({
			expand: !this.state.expand,
		});
	};

	handleFieldChange = (event) => {
		const input = event.target;
		const name = input.name;
		const value = input.value;

		this._setValue(name, value);
	};

	handleDelete = () => {
		const cause = this.state.values.cause;

		if (!cause) {
			this._setError("cause", "Cause has to be specified");
			return;
		}

		if (cause.length < 10) {
			this._setError("cause", "Cause is too short");
			return;
		}

		this.setState({
			values: {
				...this.state.values,
				cause: "",
			},
		});

		this._setError("cause", "");
		this.props.onDelete(this.props.id, cause);
	};

	handleSendNotification = () => {
		const title = this.state.values.title;
		const message = this.state.values.message;

		if (!title) {
			this._setError("title", "Title has to be specified");
			return;
		} else {
			this._setError("title", "");
		}

		if (!title.length > 50) {
			this._setError("title", "Title is too long, 50 symbols at most can be specified");
			return;
		} else {
			this._setError("title", "");
		}

		if (!message) {
			this._setError("message", "Message has to be specified");
			return;
		} else {
			this._setError("message", "");
		}

		if (!message.length > 100) {
			this._setError("message", "Message is too long, 100 symbols at most can be specified");
			return;
		} else {
			this._setError("message", "");
		}

		this.setState({
			values: {
				...this.state.values,
				title: "",
				message: "",
			},
		});

		this.props.onNotification(this.props.id, title, message);
	};

	_setError = (field, message) => {
		const errors = Object.assign({}, this.state.errors);
		errors[field] = message;
		this.setState({
			errors,
			expand: true,
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

	render() {
		const { additionalInfo, onInfo, title, isUserItem } = this.props;
		const { values, errors, expand: showDropdown } = this.state;

		return (
			<StyledContainer>
				<div className="header d-flex">
					<div className="flex-grow-1 title" onClick={this.handleExpand}>
						{title}
					</div>
					{onInfo ? (
						<div className="button info" onClick={() => onInfo(this.props.id)}>
							Info
						</div>
					) : null}

					<div className="button block" onClick={this.handleDelete}>
						Block
					</div>
				</div>
				<Dropdown in={showDropdown}>
					<div>
						{isUserItem ? (
							<div className="sendNotification">
								<Form.Group className="mb-1">
									<Form.Control
										name="title"
										onChange={this.handleFieldChange}
										value={values.title}
										isInvalid={!!errors.title}
										placeholder="Enter notification title"
									/>
									<Form.Control.Feedback type="invalid">
										{errors.title}
									</Form.Control.Feedback>
								</Form.Group>

								<Form.Group className="mb-1">
									<Form.Control
										name="message"
										as="textarea"
										onChange={this.handleFieldChange}
										value={values.message}
										isInvalid={!!errors.message}
										placeholder="Enter notification message"
									/>
									<Form.Control.Feedback type="invalid">
										{errors.message}
									</Form.Control.Feedback>
								</Form.Group>

								<Button
									variant={"outline-primary"}
									className="mb-1"
									block
									onClick={this.handleSendNotification}>
									Send notification
								</Button>
							</div>
						) : null}

						<div className="info">
							<Table striped bordered hover>
								<tbody>
									{Object.entries(additionalInfo).map(([name, val]) => {
										return (
											<tr key={name}>
												<td>{name}</td>
												<td>{val}</td>
											</tr>
										);
									})}
								</tbody>
							</Table>
						</div>

						<Form.Group className="mb-1">
							<Form.Control
								name="cause"
								onChange={this.handleFieldChange}
								value={values.cause}
								isInvalid={!!errors.cause}
								placeholder="Enter block cause"
							/>
							<Form.Control.Feedback type="invalid">
								{errors.cause}
							</Form.Control.Feedback>
						</Form.Group>
					</div>
				</Dropdown>
			</StyledContainer>
		);
	}
}

ListItem.propTypes = {
	additionalInfo: PropTypes.object.isRequired,
	onDelete: PropTypes.func.isRequired,
	onInfo: PropTypes.func,
	onNotification: PropTypes.func,
	title: PropTypes.string.isRequired,
	isUserItem: PropTypes.bool,
	id: PropTypes.object.isRequired,
};
