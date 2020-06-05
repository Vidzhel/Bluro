import React from "react";
import Image from "react-bootstrap/Image";
import styled from "styled-components";
import { Link } from "react-router-dom";

const StyledLink = styled(Link)`
	display: block;
	border-radius: 50%;

	&:hover {
		cursor: pointer;
	}
`;

const StyledImage = styled(Image)`
	width: ${(props) => props.width || 40}px;
	height: ${(props) => props.height || 40}px;
	object-fit: cover;
`;

export function SmallProfileImage(props) {
	if (props.to) {
		return (
			<StyledLink to={props.to}>
				<StyledImage {...props} roundedCircle />
			</StyledLink>
		);
	} else {
		return <StyledImage {...props} roundedCircle />;
	}
}
