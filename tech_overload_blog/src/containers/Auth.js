import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const StyledContainer = styled.div`
	margin-top: 50px;
	border: 1px solid #999;
	padding: 20px;
	border-radius: 10px;
`;

export const Auth = (props) => {
	return (
		<Container>
			<Row className="justify-content-center align-items-center">
				<Col md={6}>
					<StyledContainer>{props.form(props)}</StyledContainer>
				</Col>
			</Row>
		</Container>
	);
};

Auth.propTypes = {
	form: PropTypes.elementType.isRequired,
};
