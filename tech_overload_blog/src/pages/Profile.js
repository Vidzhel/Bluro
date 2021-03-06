import React from "react";
import { NarrowLayout } from "../components/NarrowLayout";
import { ProfileHeader } from "../containers/ProfileHeader";
import { VerticalList } from "../components/VerticalList";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import styled from "styled-components";
import { BigImageArticlePreview } from "../components/BigImageArticlePreview";
import { connect } from "react-redux";
import { getChosenProfile } from "../assets/selectors/profile";
import { getFetchedArticles } from "../assets/selectors/articles";
import { followUser, getProfileInfo, unfollowUser } from "../actions/profile";
import { getArticles } from "../actions/articles";
import { ChangeProfile } from "../containers/ChangerProfile";
import { ARTICLE_STATE_DRAFT, ARTICLE_STATE_PUBLISHED } from "../assets/constants";
import { showUpdateStoryModal } from "../actions/session";

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

const StyledMessage = styled.div``;

class ProfilePage extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			publishedArticles: [],
			unpublishedArticles: [],
		};
		this.loadedAllTheArticles = false;
		this.maunted = true;
	}

	componentDidUpdate = (prevProps) => {
		if (prevProps.articles.length !== this.props.articles.length) {
			this.loadedAllTheArticles = false;
		}
	};

	componentWillUnmount() {
		this.maunted = false;
	}

	componentDidMount = () => {
		const userVerbose = this.props.match.params.verbose;
		this.props.getProfileInfo(userVerbose);
		this.props.getProfileInfo(userVerbose);
		this.props.getArticles(userVerbose, false);
	};

	handleFollow = (userVerbose) => {
		this.props.followUser(userVerbose);
	};

	handleUnfollow = (userVerbose) => {
		this.props.unfollowUser(userVerbose);
	};

	handleChangeArticle = (article) => {
		this.props.showUpdateStoryModal(article);
	};

	loadMoreArticles = () => {
		const userVerbose = this.props.match.params.verbose;

		if (!this.loadedAllTheArticles && this.maunted) {
			this.loadedAllTheArticles = true;
			this.props.getArticles(userVerbose, false, false);
		}
	};

	render() {
		const { articles, profile } = this.props;

		if (!profile) {
			return null;
		}

		const publishedArticles = [];
		const unpublishedArticles = [];

		articles.forEach((article) => {
			if (article.state === ARTICLE_STATE_PUBLISHED) {
				publishedArticles.push(article);
			} else {
				unpublishedArticles.push(article);
			}
		});

		return (
			<NarrowLayout>
				<ProfileHeader
					{...profile}
					onFollowClicked={this.handleFollow}
					onUnfollowClicked={this.handleUnfollow}
				/>
				<StyledTabs defaultActiveKey="profile" id="uncontrolled-tab-example">
					<Tab transition={false} eventKey="profile" title="Profile">
						{publishedArticles.length ? (
							<VerticalList key="published" onBottomReached={this.loadMoreArticles}>
								{publishedArticles.map((article) => {
									return (
										<BigImageArticlePreview
											article={article}
											onChangeArticleClicked={this.handleChangeArticle}
											key={article.verbose}
										/>
									);
								})}
							</VerticalList>
						) : (
							<StyledMessage className="mt-5 d-flex justify-content-center">
								Nothing to show yet
							</StyledMessage>
						)}
					</Tab>
					{profile.isCurrentUser ? (
						<Tab transition={false} eventKey="settings" title="Settings">
							<ChangeProfile />
						</Tab>
					) : null}
					{profile.isCurrentUser ? (
						<Tab transition={false} eventKey="drafts" title="Drafts">
							{unpublishedArticles.length ? (
								<VerticalList key="drafts" onBottomReached={this.loadMoreArticles}>
									{unpublishedArticles.map((article) => {
										return (
											<BigImageArticlePreview
												article={article}
												onChangeArticleClicked={this.handleChangeArticle}
												key={article.verbose}
											/>
										);
									})}
								</VerticalList>
							) : (
								<StyledMessage className="mt-5 d-flex justify-content-center">
									Nothing to show yet
								</StyledMessage>
							)}
						</Tab>
					) : null}
				</StyledTabs>
			</NarrowLayout>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		profile: getChosenProfile(state),
		articles: getFetchedArticles(state),
	};
};

const mapDispatchToProps = {
	getProfileInfo,
	getArticles,
	showUpdateStoryModal,
	followUser,
	unfollowUser,
};

ProfilePage = connect(mapStateToProps, mapDispatchToProps)(ProfilePage);
export { ProfilePage };
