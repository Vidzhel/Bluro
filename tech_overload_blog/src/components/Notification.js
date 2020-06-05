import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

const StyledContainer = styled.div`
	width: 400px;
	white-space: break-spaces;
	word-wrap: break-word;
	padding: 5px 1.5rem;
	background-color: ${(props) => (props.hasRead ? "white" : "#f8f9fa")};
	position: relative;

	.title {
		font-weight: bold;
		font-size: 15px;
	}
	.date {
		color: #999;
		font-size: 12px;
		margin-bottom: 10px;
	}
	.message {
		font-size: 13px;
	}

	&:hover .overlay {
		opacity: 1;
	}
`;

const Overlay = styled.div`
	width: 100%;
	height: 100%;
	background-color: rgba(255, 255, 255, 0.8);
	position: absolute;
	display: flex;
	top: 0;
	left: 0;
	opacity: 0;
	transition: opacity 0.2s ease-in-out;
	z-index: 2;

	.left,
	.right {
		height: 100%;
		display: flex;
		flex-grow: 1;
		justify-content: center;
		align-items: center;
		background-color: transparent;
		transition: background-color 0.2s ease-in-out;
	}

	.left:hover {
		cursor: pointer;
		background-color: rgba(90, 226, 117, 0.4);
	}

	.right:hover {
		cursor: pointer;
		background-color: rgba(226, 90, 90, 0.4);
	}
`;

export function Notification(props) {
	const { title, date, message, hasRead, onRead, onDelete } = props;

	return (
		<StyledContainer hasRead={hasRead}>
			<Overlay className="overlay">
				{hasRead ? null : (
					<div className="left" onClick={onRead}>
						Read
					</div>
				)}
				<div className="right" onClick={onDelete}>
					Delete
				</div>
			</Overlay>
			<div className="title">{title}</div>
			<div className="date">{date}</div>
			<div className="message">{message}</div>
		</StyledContainer>
	);
}

Notification.propTypes = {
	title: PropTypes.string.isRequired,
	date: PropTypes.string.isRequired,
	message: PropTypes.string.isRequired,
	hasRead: PropTypes.bool.isRequired,
	onRead: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
};
