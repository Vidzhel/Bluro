import React from "react";
import { ArticleHead } from "../components/ArticleHead";
import { NarrowLayout } from "../components/NarrowLayout";
import { Article } from "../components/Article";
import styled from "styled-components";
import { connect } from "react-redux";
import { openArticle, fetchArticleContent } from "../actions/articles";
import { getArticleContent, getOpenedArticle } from "../assets/selectors/articles";
import { getChosenProfile } from "../assets/selectors/profile";
import { getProfileInfo } from "../actions/profile";

const StyledLayout = styled(NarrowLayout)`
	& > div {
		margin-bottom: 100px;
	}
`;

class BlogPostPage extends React.Component {
	sendRequest = false;

	componentDidMount = () => {
		this.props.openArticle(this.props.match.params.verbose);
	};

	componentDidUpdate = () => {
		if (this.props.article && !this.props.text && !this.sendRequest) {
			this.sendRequest = true;
			this.props.fetchArticleContent(this.props.article.textSourceName);
			this.props.getProfileInfo(this.props.article.user.verbose);
		}
	};

	handleFollowClicked = () => {};
	handleUnfollowClicked = () => {};

	render() {
		if (!this.props.article || !this.props.text || !this.props.profile) {
			return null;
		}

		const article = this.props.article;
		const user = this.props.profile;

		return (
			<StyledLayout>
				<ArticleHead
					userImgSrc={user.img}
					userName={user.userName}
					title={article.title}
					onFollowClicked={this.handleFollowClicked}
					onUnfollowClicked={this.handleUnfollowClicked}
					isFollowing={user.isFollowing}
					isCurrentUser={user.isCurrentUser}
					date={article.dateOfPublishing}
					state={article.state}
				/>
				<Article text={this.props.text} />
			</StyledLayout>
		);
	}
}

const mapStateToProps = (store) => {
	return {
		article: getOpenedArticle(store),
		text: getArticleContent(store),
		profile: getChosenProfile(store),
	};
};

const mapDispatchToProps = {
	openArticle,
	fetchArticleContent,
	getProfileInfo,
};

BlogPostPage = connect(mapStateToProps, mapDispatchToProps)(BlogPostPage);
export { BlogPostPage };
