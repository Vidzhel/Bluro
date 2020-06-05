import React from "react";
import { DataList } from "./DataList";
import { connect } from "react-redux";
import { getComments } from "../assets/selectors/selectors";
import { deleteComment, fetchComments } from "../actions/actions";
import { ListItem } from "../components/ListItem";
import { configs } from "../assets/configs";

class CommentsPage extends React.Component {
	constructor(props) {
		super(props);

		this.searchParameters = {
			verbose: "Verbose name",
			user: "User id",
			article: "Article id",
			content: "Content",
		};
	}

	fetchComments = (start, params = null) => {
		this.props.fetchComments(start, params);
	};

	handleDeleteComment = ({ userVerbose, commentId, articleTitle }, cause) => {
		this.props.deleteComment(userVerbose, commentId, articleTitle, cause);
	};

	handleOpenArticle = ({ articleVerbose }) => {
		this.props.history.push(`${configs.endpoints.articles}/${articleVerbose}`);
	};

	getCommentsAdditionalData = (comment) => {
		return {
			content: comment.content,

			// articleVerbose: comment.article.verbose,

			userName: comment.user.userName,
			userEmail: comment.user.email,
			userVerbose: comment.user.verbose,

			// articleTitle: comment.article.title,
		};
	};

	render() {
		const comments = this.props.comments;

		return (
			<DataList fetchData={this.fetchComments} searchOptions={this.searchParameters}>
				{comments.map((comment) => {
					return (
						<ListItem
							key={comment.id}
							title={
								comment.content > 20
									? comment.content.slice(null, 20) + "..."
									: comment.content
							}
							id={{
								userVerbose: comment.user.verbose,
								commentId: comment.id,
								// articleVerbose: comment.article.verbose,
								// articleTitle: comment.article.title,
							}}
							additionalInfo={this.getCommentsAdditionalData(comment)}
							onDelete={this.handleDeleteComment}
							onInfo={this.handleOpenArticle}
						/>
					);
				})}
			</DataList>
		);
	}
}

const mapStateToProps = (store) => {
	return {
		comments: getComments(store),
	};
};

const mapDispatchToProps = {
	fetchComments,
	deleteComment,
};

CommentsPage = connect(mapStateToProps, mapDispatchToProps)(CommentsPage);
export { CommentsPage };
