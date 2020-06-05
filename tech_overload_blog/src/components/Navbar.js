import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { SmallProfileImage } from "./SmallProfileImage";
import BootstrapNavbar from "react-bootstrap/Navbar";
import Dropdown from "react-bootstrap/Dropdown";
import { BsSearch } from "react-icons/bs";
import { BsBell } from "react-icons/bs";
import { GiOverlordHelm } from "react-icons/gi";
import { configs } from "../assets/configs";
import PropTypes from "prop-types";
import { NotificationsList } from "../containers/NotificationsList";
import { NOTIFICATION_STATUS_SENT } from "../assets/constants";

const StyledNav = styled.div`
	width: 100%;
`;

const StyledBootNavbar = styled(BootstrapNavbar)`
	box-shadow: ${(props) => (!props.transparent ? "0 -5px 10px #000" : "none")};
	min-height: ${(props) => props.height || 80}px;

	.search {
		margin-bottom: 2px !important;
	}
`;

const Brand = styled(BootstrapNavbar.Brand)``;

const Links = styled.div`
	a {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		padding: 0 10px;
		color: #373737;
		text-decoration: none;

		&:hover {
			color: #000;
		}
	}
`;

const Options = styled.div`
	& > * {
		margin: 0 10px;
	}
`;

const StyledLinkItem = styled(Link)`
	&:active {
		background-color: #cdd3db;
		color: #16181b;
	}
`;

const StyledItem = styled(Dropdown.Item)`
	&:active {
		background-color: #cdd3db;
		color: #16181b;
	}
`;

const SmallProfile = styled(StyledLinkItem)`
	.left {
		margin-right: 10px;
	}

	.userName {
		font-weight: 500;
	}

	.email {
		font-size: 14px;
		color: #999;
	}
`;

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
	<div
		ref={ref}
		onClick={(e) => {
			e.preventDefault();
			onClick(e);
		}}>
		{children}
	</div>
));

const StyledProfileImage = styled(SmallProfileImage)`
	&:hover {
		cursor: pointer;
	}
`;

const StyledLogo = styled(GiOverlordHelm)`
	background-color: #f8f9fa;
	border-radius: 50%;
	border: 1px solid black;
`;

const NotificationsCount = styled.div`
	height: 15px;
	width: 15px;
	background-color: red;
	color: white;
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 50%;
	font-size: 10px;
	position: absolute;
	right: 20px;
	top: 0;
	z-index: 2;
`;

const UserInfo = styled.div`
	margin: 0 !important;

	.notifications {
		position: relative;

		.dropdown-menu {
			overflow-y: auto;
			max-height: 400px;
		}
	}

	svg:hover {
		cursor: pointer;
	}
`;

export class Navbar extends React.Component {
	render() {
		const {
			height,
			transparent,
			profile,
			handleCreateStory,
			handleLogOut,
			notifications,
		} = this.props;

		let unreadNotifications = 0;
		for (const notification of notifications) {
			if (notification.status === NOTIFICATION_STATUS_SENT) {
				unreadNotifications++;
			}
		}

		return (
			<StyledBootNavbar bg="light" expand={true} transparent={transparent} height={height}>
				<Brand href="/" className="d-flex align-items-center">
					<StyledLogo size="2em" className="mr-2" />
					<span className="d-none d-sm-block">Tech overload</span>
				</Brand>
				<BootstrapNavbar.Collapse id="basic-navbar-nav">
					<StyledNav className="d-flex pl-1 pl-md-5 justify-content-md-between justify-content-end  align-items-center">
						<Links className="d-none d-sm-flex align-items-center">
							<Link to="/">Home</Link>
							{!profile && <Link to="/auth">Become a member</Link>}
						</Links>

						<Options className="d-flex align-items-center">
							<Link to="/search" className="search">
								<BsSearch />
							</Link>

							{profile && (
								<UserInfo className="d-flex align-items-center mo">
									<div className="notifications">
										{unreadNotifications ? (
											<NotificationsCount>
												{unreadNotifications}
											</NotificationsCount>
										) : null}
										<Dropdown>
											<Dropdown.Toggle
												as={CustomToggle}
												variant="success"
												id="dropdown-basic">
												<BsBell className="mr-4 ml-4" size="1.2em" />
											</Dropdown.Toggle>

											<Dropdown.Menu alignRight={true}>
												<NotificationsList notifications={notifications} />
											</Dropdown.Menu>
										</Dropdown>
									</div>
									<Dropdown>
										<Dropdown.Toggle
											as={CustomToggle}
											variant="success"
											id="dropdown-basic">
											<StyledProfileImage
												src={configs.resources.profileImage + profile.img}
											/>
										</Dropdown.Toggle>

										<Dropdown.Menu alignRight={true}>
											<Dropdown.Item
												to={`/profiles/${profile.verbose}`}
												as={SmallProfile}
												className="d-flex align-items-center">
												<div className="left">
													<SmallProfileImage
														width={50}
														height={50}
														src={
															configs.resources.profileImage +
															profile.img
														}
													/>
												</div>
												<div className="right">
													<div className="userName">
														{profile.userName}
													</div>
													<div className="email">{profile.email}</div>
												</div>
											</Dropdown.Item>
											<Dropdown.Divider />
											<StyledItem onClick={handleCreateStory}>
												Create story
											</StyledItem>
											<StyledItem onClick={handleLogOut}>Log out</StyledItem>
										</Dropdown.Menu>
									</Dropdown>
								</UserInfo>
							)}
						</Options>
					</StyledNav>
				</BootstrapNavbar.Collapse>
			</StyledBootNavbar>
		);
	}
}

Navbar.propTypes = {
	height: PropTypes.number,
	transparent: PropTypes.bool,
	profile: PropTypes.object,
	handleCreateStory: PropTypes.func.isRequired,
	handleLogOut: PropTypes.func.isRequired,
	notifications: PropTypes.arrayOf(
		PropTypes.shape({
			message: PropTypes.string.isRequired,
			title: PropTypes.string.isRequired,
			id: PropTypes.number.isRequired,
			status: PropTypes.string.isRequired,
			dateString: PropTypes.string.isRequired,
		}),
	),
};
