import React from "react";
import styled from "styled-components";

const StyledContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;

	.code {
		font-size: 30px;
		font-weight: bold;
	}

	.message {
		font-size: 30px;
		border-left: 3px solid #000;
		background-color: white;
		margin-left: -8px;
		padding-left: 10px;
	}
`;

export function NotFoundPage(props) {
	return (
		<StyledContainer>
			<span className="code">404</span>
			<span className="message">Page wasn't found</span>
		</StyledContainer>
	);
}
