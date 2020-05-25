import React from "react";
import Button from "react-bootstrap/Button";
import styled from "styled-components";

const StyledButton = styled(Button)`
	padding: 0 10px;
	font-size: 13px;
	height: 23px;
	justify-content: center;
	align-items: center;
`;

export function SmallButton(props) {
	return (
		<StyledButton variant="outline-success" {...props} size="sm">
			{props.children}
		</StyledButton>
	);
}
