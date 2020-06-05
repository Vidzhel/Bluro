import React from "react";
import { connect } from "react-redux";
import { getNotifications } from "../assets/selectors/session";
import { deleteNotification, readNotification } from "../actions/session";
import { Notification } from "../components/Notification";
import { NOTIFICATION_STATUS_READ } from "../assets/constants";
import styled from "styled-components";
import PropTypes from "prop-types";

const StyledContainer = styled.div`
	width: 400px;
`;

const FakeMessage = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100px;
`;

class NotificationsList extends React.Component {
	handleNotificationDeletion = (id) => {
		this.props.deleteNotification(id);
	};
	handleNotificationRead = (id) => {
		this.props.readNotification(id);
	};

	render() {
		return (
			<StyledContainer>
				{this.props.notifications.length ? (
					this.props.notifications.map((notification) => {
						return (
							<Notification
								key={notification.id}
								title={notification.title}
								date={notification.dateString}
								message={notification.message}
								hasRead={notification.status === NOTIFICATION_STATUS_READ}
								onRead={() => this.handleNotificationRead(notification.id)}
								onDelete={() => this.handleNotificationDeletion(notification.id)}
							/>
						);
					})
				) : (
					<FakeMessage>There is nothing to show yet</FakeMessage>
				)}
			</StyledContainer>
		);
	}
}

const mapDispatchToProps = {
	readNotification,
	deleteNotification,
};

NotificationsList.propTypes = {
	notifications: PropTypes.array.isRequired,
};

NotificationsList = connect(null, mapDispatchToProps)(NotificationsList);
export { NotificationsList };
