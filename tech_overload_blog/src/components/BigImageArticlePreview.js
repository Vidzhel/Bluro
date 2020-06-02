import React from "react";
import styled from "styled-components";
import { SmallProfileImage } from "./SmallProfileImage";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { configs } from "../assets/configs";
import { BsPencilSquare } from "react-icons/bs";

const StyledContainer = styled.div`
	box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.1);
	display: block;
	margin: 30px auto;
	padding: 25px;
	border-radius: 5px;
	max-width: 678px;
`;
const Header = styled.div`
	margin-bottom: 20px;
	.profileInfo {
		margin-left: 10px;

		& .date {
			font-size: 12px;
			color: #999;
		}
	}
`;

const Preview = styled(Link)`
	object-fit: cover;
	margin-bottom: 20px;
	display: block;

	img {
		width: 100%;
		height: 150px;
		object-fit: cover;
	}

	&:hover {
		cursor: pointer;
	}
`;

const ClickableIcon = styled(BsPencilSquare)`
	&:hover {
		cursor: pointer;
	}
`;

export function BigImageArticlePreview(props) {
	const {
		article,
		onChangeArticleClicked,
		previewImageName,
		isCurrentUserArticle,
		verbose,
		dateOfPublishingString,
		title,
		description,
		user,
	} = props;

	const { userName, img: userImgSrc, verbose: userVerbose } = user;

	return (
		<StyledContainer>
			<Header className="d-flex justify-content-between align-items-center">
				<Link className="left d-flex align-items-center" to={`/profiles/${userVerbose}`}>
					<SmallProfileImage
						className="profileImage"
						src={configs.resources.profileImage + userImgSrc}
						roundedCircle
						alt="Creator profile"
					/>

					<div className="profileInfo">
						<div className="name">{userName}</div>
						<div className="date">{dateOfPublishingString}</div>
					</div>
				</Link>

				{isCurrentUserArticle ? (
					<div className="right">
						<ClickableIcon onClick={onChangeArticleClicked.bind(this, article)} />
					</div>
				) : null}
			</Header>

			<Preview to={`/articles/${verbose}`}>
				<img src={configs.resources.articleImage + previewImageName} alt="" />
			</Preview>
			<Link to={`/articles/${verbose}`}>
				<h2 className="title">{title}</h2>
				<div className="about">{description}</div>
			</Link>
		</StyledContainer>
	);
}

BigImageArticlePreview.propTypes = {
	article: PropTypes.shape({
		previewImageName: PropTypes.string.isRequired,
		isCurrentUserArticle: PropTypes.bool.isRequired,
		verbose: PropTypes.string.isRequired,
		dateOfPublishing: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
		user: PropTypes.object.isRequired,
	}),
	onChangeArticleClicked: PropTypes.func.isRequired,
};
