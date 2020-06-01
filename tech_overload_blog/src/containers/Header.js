import React from "react";
import { Navbar } from "../components/Navbar";
import { connect } from "react-redux";
import { getCurrentUserInfo } from "../assets/selectors/session";
import { logOut, showCreateStoryModal } from "../actions/session";

class Header extends React.Component {
	handleLogOut = () => {
		this.props.logOut();
	};
	handleCreateStory = () => {
		this.props.showCreateStoryModal();
	};

	render() {
		return (
			<Navbar
				{...this.props}
				handleLogOut={this.handleLogOut}
				handleCreateStory={this.handleCreateStory}
			/>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		profile: getCurrentUserInfo(state),
	};
};

const mapDispatchToProps = {
	logOut,
	showCreateStoryModal,
};

Header = connect(mapStateToProps, mapDispatchToProps)(Header);
export { Header };
