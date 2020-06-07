import React from "react";
import ReactMarkdown from "react-markdown";
import PropTypes from "prop-types";
import styled from "styled-components";
import "../assets/styles/markdown.css";
import { CodeBlock } from "./MarkdownCodeBlock";

const StyledContainer = styled.div`
	font-size: 21px;
	word-break: break-word;
`;

export function Article(props) {
	const { text } = props;

	return (
		<StyledContainer className="markdown">
			<ReactMarkdown source={text} renderers={{ code: CodeBlock }} />
		</StyledContainer>
	);
}

Article.propTypes = {
	text: PropTypes.string.isRequired,
};
