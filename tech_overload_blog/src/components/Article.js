import React from "react";
import ReactMarkdown from "react-markdown";
import PropTypes from "prop-types";
import styled from "styled-components";
import "../markdown.css";
import { CodeBlock } from "./MarkdownCodeBlock";

const StyledContainer = styled.div`
	font-size: 21px;
	font-family: medium-content-serif-font, Georgia, Cambria, "Times New Roman", Times, serif;
	word-break: break-word;
	//
	//h1 {
	//	font-size: 34px;
	//	font-weight: 600;
	//}
	//
	//h2 {
	//	margin-top: 1.72em;
	//	font-size: 26px;
	//	line-height: 1.18;
	//	font-weight: 600;
	//}
	//
	//img {
	//	width: 100%;
	//}
`;

export function Article(props) {
	const { text } = props;

	return (
		<StyledContainer>
			<ReactMarkdown source={text} renderers={{ code: CodeBlock }} />
		</StyledContainer>
	);
}

Article.propTypes = {
	text: PropTypes.string.isRequired,
};
