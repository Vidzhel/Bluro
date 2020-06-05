import React from "react";
import { DataList } from "./DataList";
import { connect } from "react-redux";
import {getArticles} from "../assets/selectors/selectors";
import { deleteArticle, fetchArticles } from "../actions/actions";
import { ListItem } from "../components/ListItem";
import { configs } from "../assets/configs";

class ArticlesPage extends React.Component {
	constructor(props) {
		super(props);

		this.searchParameters = {
			verbose: "Verbose name",
			user: "User id",
			title: "Title",
			description: "Description",
			state: "State",
		};
	}

	fetchArticles = (start, params = null) => {
		this.props.fetchArticles(start, params);
	};

	handleDeleteArticle = ({ userVerbose, articleVerbose, articleTitle }, cause) => {
		this.props.deleteArticle(userVerbose, articleVerbose, articleTitle, cause);
	};

	handleOpenArticle = ({ articleVerbose }) => {
		this.props.history.push(`${configs.endpoints.articles}/${articleVerbose}`);
	};

	getArticlesAdditionalData = (article) => {
		return {
			articleVerbose: article.verbose,

			userName: article.user.userName,
			userEmail: article.user.email,
			userVerbose: article.user.verbose,

			title: article.title,
			description: article.description,
			state: article.state,
		};
	};

	render() {
		const articles = this.props.articles;

		return (
			<DataList fetchData={this.fetchArticles} searchOptions={this.searchParameters}>
				{articles.map((article) => {
					return (
						<ListItem
							key={article.verbose}
							title={article.title}
							id={{
								userVerbose: article.user.verbose,
								articleVerbose: article.verbose,
								articleTitle: article.title,
							}}
							additionalInfo={this.getArticlesAdditionalData(article)}
							onDelete={this.handleDeleteArticle}
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
		articles: getArticles(store),
	};
};

const mapDispatchToProps = {
	fetchArticles,
	deleteArticle,
};

ArticlesPage = connect(mapStateToProps, mapDispatchToProps)(ArticlesPage);
export { ArticlesPage };
