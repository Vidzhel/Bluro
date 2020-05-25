import React from "react";
import styled from "styled-components";
import { SmallProfileImage } from "./SmallProfileImage";
import PropTypes from "prop-types";

const StyledContainer = styled.div`
	box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.1);
	display: block;
	margin: 30px auto;
	padding: 25px;
	border-radius: 5px;
	max-width: 678px;

	&:hover {
		cursor: pointer;
	}
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

const Preview = styled.img`
	width: 100%;
	height: 150px;
	object-fit: cover;
	margin-bottom: 20px;
`;

export function BigImageArticlePreview(props) {
	const {
		date,
		description,
		previewImgSrc,
		title,
		userImgSrc,
		userName,
		articleSrc,
		history,
	} = props;

	function navigateToArticle() {
		history.push(articleSrc);
	}

	return (
		<StyledContainer onClick={navigateToArticle}>
			<Header className="d-flex align-items-center">
				<SmallProfileImage
					className="profileImage"
					src={userImgSrc}
					roundedCircle
					alt="Creator profile"
				/>
				<div className="profileInfo">
					<div className="name">{userName}</div>
					<div className="date">{date}</div>
				</div>
			</Header>
			<Preview src={previewImgSrc} />
			<div>
				<h2 className="title">{title}</h2>
				<div className="about">{description}</div>
			</div>
		</StyledContainer>
	);
}

BigImageArticlePreview.propTypes = {
	previewImgSrc: PropTypes.string.isRequired,
	userImgSrc: PropTypes.string.isRequired,
	articleSrc: PropTypes.string.isRequired,
	date: PropTypes.string.isRequired,
	userName: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	history: PropTypes.object.isRequired,
};
