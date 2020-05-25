import React from "react";
import Container from "react-bootstrap/Container";
import styled from "styled-components";

const StyledContainer = styled(Container)`
	max-width: 700px;
`;

export const NarrowLayout = (props) => {
	return <StyledContainer className="px-md-4 px-xs-0">{props.children}</StyledContainer>;
};
