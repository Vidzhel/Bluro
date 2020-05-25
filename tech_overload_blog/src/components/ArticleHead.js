import React from "react";
import styled from "styled-components";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import { SmallButton } from "./SmallButton";
import { SmallProfileImage } from "./SmallProfileImage";
import PropTypes from "prop-types";

const StyledContainer = styled(Container)`
	padding: 0;
	margin: 0 0 40px 0;

	div.title > h1 {
		margin: 40px 0 20px 0;
		line-height: 48px;
		font-weight: 400 !important;
		font-size: 40px !important;
		font-family: medium-content-serif-font, Georgia, Cambria, "Times New Roman", Times, serif;
	}
`;

const UserInfo = styled.div`
	img {
		width: 50px;
		height: 50px;
	}

	& > div {
		margin-left: 10px;
	}

	.date {
		color: #999;
		font-size: 14px;
	}
`;

const StyledButton = styled(SmallButton)`
	margin-left: 5px;
`;

export function ArticleHead(props) {
	const { date, onFollowClicked, userName, title, userImgSrc } = props;

	return (
		<StyledContainer>
			<Row className={"title"}>
				<h1>{title}</h1>
			</Row>
			<Row className={"info"}>
				<Col className="d-flex justify-content-between">
					<UserInfo className="d-flex align-items-center">
						<SmallProfileImage src={userImgSrc} />
						<div>
							<div className="d-flex">
								<div>{userName}</div>
								<StyledButton onClick={onFollowClicked} size="sm">
									Follow
								</StyledButton>
							</div>
							<div className="date">{date}</div>
						</div>
					</UserInfo>
				</Col>
			</Row>
		</StyledContainer>
	);
}

ArticleHead.propTypes = {
	title: PropTypes.string.isRequired,
	userName: PropTypes.string.isRequired,
	userImgSrc: PropTypes.string.isRequired,
	date: PropTypes.string.isRequired,
	onFollowClicked: PropTypes.func.isRequired,
};
