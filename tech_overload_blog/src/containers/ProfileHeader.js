import React from "react";
import styled from "styled-components";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Image from "react-bootstrap/Image";
import { SmallButton } from "../components/SmallButton";
import PropTypes from "prop-types";

const Header = styled.div`
	padding: 20px 0;
`;

const ProfileImage = styled(Image)`
	margin-top: 10px;
	max-width: 140px;
	height: 100px;
	width: 100px;
	object-fit: cover;
`;
const Stats = styled.div`
	div {
		margin: 0 10px;

		&:first-child {
			margin-left: 0;
		}
	}
`;

const StyledButton = styled(SmallButton)`
	margin-left: 20px;
`;

export function ProfileHeader(props) {
	const { userName, onFollowClicked, aboutUser, followers, following, imgSrc } = props;
	return (
		<Header>
			<Container>
				<Row>
					<Col
						className="d-flex flex-column justify-content-center"
						xs={{ order: 2 }}
						sm={{ order: 1, span: 8 }}>
						<div className="d-flex align-items-center">
							<h1>{userName}</h1>
							<StyledButton onClick={onFollowClicked} size="sm">
								Follow
							</StyledButton>
						</div>
						<p>{aboutUser}</p>
						<Stats className="d-flex">
							<div>{following} Following</div>
							<div>{followers} Followers</div>
						</Stats>
					</Col>
					<Col
						className="d-flex flex-row align-items-center justify-content-center"
						xs={{ order: 1 }}
						sm={{ order: 2, span: 4 }}>
						<ProfileImage src={imgSrc} roundedCircle alt="Creator profile" />
					</Col>
				</Row>
			</Container>
		</Header>
	);
}

ProfileHeader.propTypes = {
	userName: PropTypes.string.isRequired,
	onFollowClicked: PropTypes.func.isRequired,
	aboutUser: PropTypes.string.isRequired,
	followers: PropTypes.number.isRequired,
	following: PropTypes.number.isRequired,
	imgSrc: PropTypes.string.isRequired,
};