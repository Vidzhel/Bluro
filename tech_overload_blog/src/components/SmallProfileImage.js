import React from "react";
import Image from "react-bootstrap/Image";
import styled from "styled-components";

const StyledImage = styled(Image)`
	width: ${(props) => props.width || 40}px;
	height: ${(props) => props.height || 40}px;
	object-fit: cover;
`;

export function SmallProfileImage(props) {
	return <StyledImage {...props} roundedCircle />;
}
