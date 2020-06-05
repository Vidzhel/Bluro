import React from "react";
import { Navbar } from "../components/Navbar";
import { connect } from "react-redux";
import { getCurrentUserInfo, getNotifications } from "../assets/selectors/session";
import { logOut, showCreateStoryModal } from "../actions/session";

class Header extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			fixedTop: true,
		};
	}

	componentDidMount() {
		window.addEventListener("scroll", this.handlePageScrolling);
	}

	handlePageScrolling = () => {
		if (window.pageYOffset > 0) {
			this.setState({
				fixedTop: false,
			});
		} else {
			this.setState({
				fixedTop: true,
			});
		}
	};

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
				fixedTop={this.state.fixedTop}
			/>
		);
	}
}

const mapStateToProps = (store) => {
	return {
		profile: getCurrentUserInfo(store),
		notifications: getNotifications(store),
	};
};

const mapDispatchToProps = {
	logOut,
	showCreateStoryModal,
};

Header = connect(mapStateToProps, mapDispatchToProps)(Header);
export { Header };
