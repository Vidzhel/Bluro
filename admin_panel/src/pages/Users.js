import React from "react";
import { DataList } from "./DataList";
import { connect } from "react-redux";
import { getUsers } from "../assets/selectors/selectors";
import { fetchUsers, deleteUser, sendNotification } from "../actions/actions";
import { ListItem } from "../components/ListItem";
import { configs } from "../assets/configs";
import {HISTORY} from "../assets/constants";

class UsersPage extends React.Component {
	constructor(props) {
		super(props);

		this.searchParameters = {
			userName: "User name",
			email: "Email",
			about: "About",
			role: "Role",
			verbose: "Verbose name"
		};
		this.query = "";
	}

	fetchUsers = (start, params = null) => {
		this.props.fetchUsers(start, params);
	};

	handleDeleteUser = ({userVerbose}, cause) => {
		this.props.deleteUser(userVerbose, cause);
	};

	handleSendNotification = ({userVerbose}, title, message) => {
		this.props.sendNotification(userVerbose, title, message);
	};

	handleOpenUserProfile = ({userVerbose}) => {
		HISTORY.push(`${configs.blogEndpoints.profiles}/${userVerbose}`);
	};

	getUsersAdditionalData = (user) => {
		return {
			verbose: user.verbose,
			email: user.email,
			about: user.about,
			role: user.role,
			followers: user.followers,
			following: user.following,
		};
	};

	render() {
		const users = this.props.users;

		return (
			<DataList fetchData={this.fetchUsers} searchOptions={this.searchParameters}>
				{users.map((user) => {
					return (
						<ListItem
							key={user.verbose}
							title={user.userName}
							isUserItem={true}
							id={{userVerbose: user.verbose}}
							additionalInfo={this.getUsersAdditionalData(user)}
							onNotification={this.handleSendNotification}
							onDelete={this.handleDeleteUser}
							onInfo={this.handleOpenUserProfile}
						/>
					);
				})}
			</DataList>
		);
	}
}

const mapStateToProps = (store) => {
	return {
		users: getUsers(store),
	};
};

const mapDispatchToProps = {
	fetchUsers,
	sendNotification,
	deleteUser,
};

UsersPage = connect(mapStateToProps, mapDispatchToProps)(UsersPage);
export { UsersPage };
