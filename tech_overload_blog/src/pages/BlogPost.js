import React from "react";
import { ArticleHead } from "../components/ArticleHead";
import { NarrowLayout } from "../components/NarrowLayout";
import { Article } from "../components/Article";
import styled from "styled-components";
import { connect } from "react-redux";
import { openArticle, getArticlesComments, fetchNextChunkOfComments } from "../actions/articles";
import {
	getArticleComments,
	getArticleContent,
	getOpenedArticle,
} from "../assets/selectors/articles";
import { ChangeComment } from "../containers/ChangeComment";
import { VerticalList } from "../components/VerticalList";
import { Comment } from "../components/Comment";

const StyledLayout = styled(NarrowLayout)`
	& > div {
		margin-bottom: 100px;
	}
`;

class BlogPostPage extends React.Component {
	componentDidMount = () => {
		this.props.openArticle(this.props.match.params.verbose);
		this.props.getArticlesComments(this.props.match.params.verbose);
	};

	handleFollowClicked = () => {};
	handleUnfollowClicked = () => {};

	loadMoreComments = () => {
		this.props.fetchNextChunkOfComments(this.props.match.params.verbose);
	};

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
				<ChangeComment articleVerbose={article.verbose} />
				<VerticalList onBottomReached={this.loadMoreComments}>
					{this.props.comments.map((comment) => {
						return (
							<Comment
								{...comment}
								key={comment.id}
								articleVerbose={article.verbose}
							/>
						);
					})}
				</VerticalList>
			</StyledLayout>
		);
	}
}

const mapStateToProps = (store) => {
	return {
		article: getOpenedArticle(store),
		text: getArticleContent(store),
		comments: getArticleComments(store),
	};
};

const mapDispatchToProps = {
	openArticle,
	getArticlesComments,
	fetchNextChunkOfComments,
};

BlogPostPage = connect(mapStateToProps, mapDispatchToProps)(BlogPostPage);
export { BlogPostPage };
