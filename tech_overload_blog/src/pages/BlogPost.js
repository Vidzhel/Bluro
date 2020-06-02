import React from "react";
import { ArticleHead } from "../components/ArticleHead";
import { NarrowLayout } from "../components/NarrowLayout";
import { Article } from "../components/Article";
import styled from "styled-components";
import { connect } from "react-redux";
import { openArticle, fetchArticleContent } from "../actions/articles";
import { getArticleContent, getOpenedArticle } from "../assets/selectors/articles";

const StyledLayout = styled(NarrowLayout)`
	& > div {
		margin-bottom: 100px;
	}
`;

class BlogPostPage extends React.Component {
	componentDidMount = () => {
		this.props.openArticle(this.props.match.params.verbose);
	};

	handleFollowClicked = () => {};
	handleUnfollowClicked = () => {};

	render() {
		if (!this.props.article || !this.props.text) {
			return null;
		}

		const article = this.props.article;

		return (
			<StyledLayout>
				<ArticleHead
					article={article}
					onFollowClicked={this.handleFollowClicked}
					onUnfollowClicked={this.handleUnfollowClicked}
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
	};
};

const mapDispatchToProps = {
	openArticle,
};

BlogPostPage = connect(mapStateToProps, mapDispatchToProps)(BlogPostPage);
export { BlogPostPage };
