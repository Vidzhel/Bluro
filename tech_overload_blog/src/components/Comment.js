import React from "react";
import styled from "styled-components";
import { SmallProfileImage } from "./SmallProfileImage";
import { configs } from "../assets/configs";
import { BsPencilSquare } from "react-icons/bs";
import { ChangeComment } from "../containers/ChangeComment";
import PropTypes from "prop-types";

const StyledContainer = styled.div`
	box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.1);
	display: block;
	margin: 30px auto;
	padding: 25px;
	border-radius: 5px;
	max-width: 678px;

	.info {
		margin-left: 5px;

		img {
			width: 50px !important;
			height: 50px !important;
		}

		& > div {
			margin-left: 10px;
		}

		.date {
			color: #999;
			font-size: 14px;
		}

		.userName {
			margin-right: 5px;
		}
	}

	.comment {
		margin-top: 10px;
	}
`;

const ClickableIcon = styled(BsPencilSquare)`
	&:hover {
		cursor: pointer;
	}
`;

export class Comment extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			inEditingMode: false,
		};
	}

	changeEditingMode = (modeState) => {
		this.setState({ inEditingMode: modeState });
	};

	render() {
		const {
			user,
			creationDateString,
			content,
			id,
			isCurrentUserComment,
			articleVerbose,
		} = this.props;
		const { userName, img, verbose: userVerbose } = user;

		return (
			<StyledContainer>
				{!this.state.inEditingMode ? (
					<div>
						<div className="commentInfo d-flex justify-content-between">
							<div className="left d-flex">
								<SmallProfileImage
									to={`/profiles/${userVerbose}`}
									src={`${configs.resources.profileImage}/${img}`}
								/>
								<div className="info d-flex flex-column justify-content-center">
									<div className="userName">{userName}</div>
									<div className="date">{creationDateString}</div>
								</div>
							</div>
							{isCurrentUserComment && !this.state.inEditingMode ? (
								<div className="right">
									<ClickableIcon
										onClick={this.changeEditingMode.bind(this, true)}
									/>
								</div>
							) : null}
						</div>
						<div className="comment">{content}</div>
					</div>
				) : (
					<ChangeComment
						articleVerbose={articleVerbose}
						commentId={id}
						commentContent={content}
						onFinishEditing={this.changeEditingMode.bind(this, false)}
					/>
				)}
			</StyledContainer>
		);
	}
}

Comment.propTypes = {
	user: PropTypes.object.isRequired,
	creationDateString: PropTypes.string.isRequired,
	content: PropTypes.string.isRequired,
	id: PropTypes.number.isRequired,
	isCurrentUserComment: PropTypes.bool.isRequired,
	articleVerbose: PropTypes.string.isRequired,
};
