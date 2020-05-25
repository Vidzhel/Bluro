import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

const StyledContainer = styled.div`
	margin: 30px auto;

	&:hover {
		cursor: pointer;
	}
`;

const PreviewImage = styled.img`
	object-fit: cover;
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
	const {
		articleSrc,
		date,
		description,
		overline,
		previewImgSrc,
		title,
		userName,
		history,
	} = props;

	function navigateToArticle() {
		history.push(articleSrc);
	}

	return (
		<StyledContainer onClick={navigateToArticle} className="d-flex">
			<About>
				<div className="overline">{overline}</div>
				<h2 className="title">{title}</h2>
				<div className="description">{description}</div>
				<div className="d-flex flex-column info">
					<div>{userName}</div>
					<div>{date}</div>
				</div>
			</About>
			<PreviewImage src={previewImgSrc} />
		</StyledContainer>
	);
}

SmallImageArticlePreview.propTypes = {
	previewImgSrc: PropTypes.string.isRequired,
	articleSrc: PropTypes.string.isRequired,
	date: PropTypes.string.isRequired,
	userName: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	overline: PropTypes.string.isRequired,
	history: PropTypes.object.isRequired,
};
