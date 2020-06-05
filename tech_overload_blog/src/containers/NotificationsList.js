import React from "react";
import { connect } from "react-redux";
import { getNotifications } from "../assets/selectors/session";
import { deleteNotification, readNotification } from "../actions/session";
import { Notification } from "../components/Notification";
import { NOTIFICATION_STATUS_READ } from "../assets/constants";
import styled from "styled-components";

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
	handleNotificationDeletion = (id, ...other) => {
		console.log(id, other);
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
								onRead={this.handleNotificationDeletion.bind(this, notification.id)}
								onDelete={this.handleNotificationRead}
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

const mapStateToProps = (store) => {
	return { notifications: getNotifications(store) };
};

NotificationsList = connect(mapStateToProps, mapDispatchToProps)(NotificationsList);
export { NotificationsList };
