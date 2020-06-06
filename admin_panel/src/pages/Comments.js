import React from "react";
import { DataList } from "./DataList";
import { connect } from "react-redux";
import { getComments } from "../assets/selectors/selectors";
import { deleteComment, fetchComments } from "../actions/actions";
import { ListItem } from "../components/ListItem";
import { configs } from "../assets/configs";
import {HISTORY} from "../assets/constants";

class CommentsPage extends React.Component {
	constructor(props) {
		super(props);

		this.searchParameters = {
			id: "id",
			user: "User id",
			article: "Article id",
			content: "Content",
		};
	}

	fetchComments = (start, params = null) => {
		this.props.fetchComments(start, params);
	};

	handleDeleteComment = ({ userVerbose, commentId, userName }, cause) => {
		this.props.deleteComment(userVerbose, commentId, userName, cause);
	};

	getCommentsAdditionalData = (comment) => {
		return {
			content: comment.content,

			userName: comment.user.userName,
			userEmail: comment.user.email,
			userVerbose: comment.user.verbose,
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
								userName: comment.user.userName
							}}
							additionalInfo={this.getCommentsAdditionalData(comment)}
							onDelete={this.handleDeleteComment}
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
