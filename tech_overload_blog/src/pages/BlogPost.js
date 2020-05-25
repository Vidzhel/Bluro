import React from "react";
import { ArticleHead } from "../components/ArticleHead";
import { NarrowLayout } from "../components/NarrowLayout";
import { Article } from "../components/Article";
import PropTypes from "prop-types";
import styled from "styled-components";

const StyledLayout = styled(NarrowLayout)`
	& > div {
		margin-bottom: 100px;
	}
`;

export function BlogPostPage(props) {
	const { text, articleInfo } = props;

	return (
		<StyledLayout>
			<ArticleHead {...articleInfo} />
			<Article text={text} />
		</StyledLayout>
	);
}

BlogPostPage.propTypes = {
	text: PropTypes.string.isRequired,

	articleInfo: PropTypes.exact({
		title: PropTypes.string.isRequired,
		userImgSrc: PropTypes.string.isRequired,
		userName: PropTypes.string.isRequired,
		date: PropTypes.string.isRequired,
		onFollowClicked: PropTypes.func.isRequired,
	}),
};
