import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { WriteCommentForm } from "../components/WriteCommentForm";
import { createComment, deleteComment, updateComment } from "../actions/articles";
import PropTypes from "prop-types";
import { isUserLoggedIn } from "../assets/selectors/session";
import Button from "react-bootstrap/Button";

const StyledContainer = styled.div`
	a {
		color: #007bff !important;

		&:hover {
			color: white !important;
		}
	}
`;

class ChangeComment extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			errors: {
				comment: null,
			},
			values: {
				comment: props.commentContent || "",
			},
			touched: {
				comment: false,
			},
			loading: false,
		};
		this.originalContent = props.commentContent || "";
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

	handleCommentSubmit = (event) => {
		event.preventDefault();
		event.stopPropagation();
		if (!this.validate()) {
			return;
		}

		const values = this.state.values;

		if (!this.props.commentId) {
			this.props.createComment(this.props.articleVerbose, values.comment);
		} else {
			if (values.comment !== this.originalContent) {
				this.props.updateComment(this.props.commentId, values.comment);
			}
		}

		if (this.props.onFinishEditing) {
			this.props.onFinishEditing();
		}

		this.setState({
			values: {
				comment: "",
			},
		});
	};

	handleDeleteComment = (event) => {
		event.preventDefault();
		event.stopPropagation();

		this.props.deleteComment(this.props.commentId);
		this.props.onFinishEditing();
	};

	handleCancelEditing = () => {
		this.props.onFinishEditing();
	};

	validate = () => {
		if (this.state.values.comment.length < 10 || this.state.values.comment.length > 500) {
			this._setError(
				"comment",
				"Comment length have to be greater than 10 and no more than 500 symbols in length",
			);
			return;
		} else {
			this._setError("comment", "");
		}

		return true;
	};

	render() {
		return (
			<StyledContainer>
				{this.props.isUserRegistered ? (
					<WriteCommentForm
						{...this.state}
						handleChange={this.handleChange}
						handleSubmit={this.handleCommentSubmit}
						handleDelete={this.handleDeleteComment}
						handleCancel={this.handleCancelEditing}
						allowDeletion={!!this.props.commentId}
					/>
				) : (
					<div className="d-flex justify-content-center">
						<Button as={"a"} href={"/auth/login"} variant={"outline-primary"}>
							Log in to write comments
						</Button>
					</div>
				)}
			</StyledContainer>
		);
	}
}

ChangeComment.propTypes = {
	articleVerbose: PropTypes.string.isRequired,
	commentId: PropTypes.number,
	commentContent: PropTypes.string,
	onFinishEditing: PropTypes.func,
};

const mapDispatchToProps = {
	createComment,
	deleteComment,
	updateComment,
};

const mapStateToProps = (store) => {
	return {
		isUserRegistered: isUserLoggedIn(store),
	};
};

ChangeComment = connect(mapStateToProps, mapDispatchToProps)(ChangeComment);
export { ChangeComment };
