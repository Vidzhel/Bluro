import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { configs } from "../assets/configs";
import { Link } from "react-router-dom";

const StyledContainer = styled.div`
	margin: 30px auto;
	max-height: 130px;
	overflow: hidden;

	&:hover {
		cursor: pointer;
	}
`;

const StyledTitle = styled(Link)`
	display: block;
	font-size: 15px;
	text-transform: capitalize;
`;

const PreviewImage = styled(Link)`
	display: block;

	img {
		object-fit: cover;
		height: 100%;
		width: 100%;
	}
`;

const About = styled.div`
	margin-right: 20px;
	width: 100%;

	.overline {
		color: #999;
		text-transform: uppercase;
	}

	.title {
		font-size: 20px;
	}

	.description {
		margin-bottom: 10px;
		color: #999;
	}

	.info {
		font-size: 15px;
	}

	.info div:last-child {
		color: #999;
	}
`;

export function SmallImageArticlePreview(props) {
	// const { userName, userImgSrc, article, userVerbose, onChangeArticleClicked } = props;
	const {
		previewImageName,
		isCurrentUserArticle,
		verbose,
		dateOfPublishingString,
		title,
		description,
		user,
	} = props;
	const { verbose: userVerbose, userName } = user;

	return (
		<StyledContainer className="d-flex flex-column flex-md-row">
			<About>
				<StyledTitle to={`/articles/${verbose}`} className="title">
					{title}
				</StyledTitle>
				<Link to={`/articles/${verbose}`} className="description">
					{description}
				</Link>
				<div className="d-flex flex-column info">
					<Link to={`/profiles/${userVerbose}`}>{userName}</Link>
					<div>{dateOfPublishingString}</div>
				</div>
			</About>
			<PreviewImage to={`/articles/${verbose}`}>
				<img src={configs.resources.articleImage + previewImageName} alt="" />
			</PreviewImage>
		</StyledContainer>
	);
}

SmallImageArticlePreview.propTypes = {
	previewImageName: PropTypes.string.isRequired,
	verbose: PropTypes.string.isRequired,
	dateOfPublishingString: PropTypes.string.isRequired,
	// userName: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
};
