import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import styled from "styled-components";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import PropTypes from "prop-types";

const StyledContainer = styled.div`
	a {
		text-decoration: none;
		color: #000;

		&:hover {
			color: #007bff;
		}
	}

	.row {
		margin-right: 0;
	}
`;

export function MainFrame(props) {
	return (
		<StyledContainer>
			<Row>
				<Col>
					<Navbar bg="light" expand={true}>
						<Navbar.Brand href="#home">Admin panel</Navbar.Brand>
						<Navbar.Toggle aria-controls="basic-navbar-nav" />
						<Navbar.Collapse id="basic-navbar-nav">
							<Nav.Link href="/">Return to the site</Nav.Link>
						</Navbar.Collapse>
					</Navbar>
				</Col>
			</Row>
			<Row>
				<Col xs={3}>
					<ListGroup>
						<ListGroup.Item
							action
							href="/admin/users"
							active={window.location.pathname.startsWith("/admin/users")}>
							Users
						</ListGroup.Item>
						<ListGroup.Item
							action
							href="/admin/articles"
							active={window.location.pathname.startsWith("/admin/articles")}>
							Articles
						</ListGroup.Item>
						<ListGroup.Item
							action
							href="/admin/comments"
							active={window.location.pathname.startsWith("/admin/comments")}>
							Comments
						</ListGroup.Item>
					</ListGroup>
				</Col>
				<Col xs={9}>{props.page}</Col>
			</Row>
		</StyledContainer>
	);
}

MainFrame.propTypes = {
	page: PropTypes.elementType.isRequired,
};
