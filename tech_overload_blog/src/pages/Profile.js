import React from "react";
import { NarrowLayout } from "../components/NarrowLayout";
import { ProfileHeader } from "../containers/ProfileHeader";
import { VerticalList } from "../components/VerticalList";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import styled from "styled-components";
import { BigImageArticlePreview } from "../components/BigImageArticlePreview";
import PropTypes from "prop-types";

const StyledTabs = styled(Tabs)`
	border-top-width: 0 !important;
	border-left-width: 0 !important;
	border-right-width: 0 !important;

	.nav-item {
		border-top-width: 0 !important;
		border-left-width: 0 !important;
		border-right-width: 0 !important;
		border-bottom: 1px solid #dee2e6;
		color: #999;

		&:focus {
			outline: none !important;
		}

		&.active {
			border-bottom: 1px solid #999;
		}
	}
`;

export function ProfilePage(props) {
	const { articles, profile } = props;
	return (
		<NarrowLayout>
			<ProfileHeader {...profile} />
			<StyledTabs defaultActiveKey="profile" id="uncontrolled-tab-example">
				<Tab transition={false} eventKey="profile" title="Profile">
					<VerticalList>
						{articles.map((article) => {
							return <BigImageArticlePreview {...article} history={props.history} />;
						})}
					</VerticalList>
				</Tab>
				<Tab transition={false} eventKey="settings" title="Settings">
					hello
				</Tab>
			</StyledTabs>
		</NarrowLayout>
	);
}

ProfilePage.propTypes = {
	articles: PropTypes.arrayOf(
		PropTypes.exact({
			previewImgSrc: PropTypes.string.isRequired,
			userImgSrc: PropTypes.string.isRequired,
			articleSrc: PropTypes.string.isRequired,
			date: PropTypes.string.isRequired,
			userName: PropTypes.string.isRequired,
			title: PropTypes.string.isRequired,
			description: PropTypes.string.isRequired,
		}),
	),
	profile: PropTypes.exact({
		userName: PropTypes.string.isRequired,
		onFollowClicked: PropTypes.func.isRequired,
		aboutUser: PropTypes.string.isRequired,
		followers: PropTypes.number.isRequired,
		following: PropTypes.number.isRequired,
		imgSrc: PropTypes.string.isRequired,
	}),
};
