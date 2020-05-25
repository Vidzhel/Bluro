import React from "react";
import Image from "react-bootstrap/Image";
import styled from "styled-components";

const StyledImage = styled(Image)`
	width: 40px;
	height: 40px;
	object-fit: cover;
`;

export function SmallProfileImage(props) {
	return <StyledImage {...props} roundedCircle />;
}
