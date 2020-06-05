import React from "react";
import { connect } from "react-redux";
import { getSessionErrors, getSessionInfo, getSessionSuccess } from "../assets/selectors/session";
import { VerticalList } from "../components/VerticalList";
import { Message } from "../components/Message";
import styled from "styled-components";

const StyledContainer = styled.div`
	position: fixed;
	top: 100px;
	right: 40px;
	z-index: 10;
`;

class MessagesController extends React.Component {
	render() {
		const { messages } = this.props;

		return (
			<StyledContainer>
				<VerticalList>
					{messages.map((message) => {
						return <Message key={message.id} {...message} />;
					})}
				</VerticalList>
			</StyledContainer>
		);
	}
}

const mapStateToProps = (state) => {
	const messages = [];

	for (const error of getSessionErrors(state)) {
		messages.push({
			...error,
			type: "danger",
		});
	}

	for (const info of getSessionInfo(state)) {
		messages.push({
			...info,
			type: "primary",
		});
	}

	for (const success of getSessionSuccess(state)) {
		messages.push({
			...success,
			type: "success",
		});
	}

	return {
		messages,
	};
};

MessagesController = connect(mapStateToProps)(MessagesController);
export { MessagesController };
