import React from "react";
import { VerticalList } from "../components/VerticalList";
import { connect } from "react-redux";
import { getArticles } from "../actions/articles";
import { getFetchedArticles } from "../assets/selectors/articles";
import { SmallImageArticlePreview } from "../components/SmallmageArticlePreview";
import { BigImageArticlePreview } from "../components/BigImageArticlePreview";
import { showUpdateStoryModal } from "../actions/session";

class HomePage extends React.Component {
	componentDidMount() {
		this.props.getArticles(null);
		this.loadedAllTheArticles = false;
		this.maunted = true;
	}

	componentDidUpdate(prevProps) {
		if (prevProps.articles.length !== this.props.articles.length) {
			this.loadedAllTheArticles = false;
		}
	}

	componentWillUnmount() {
		this.maunted = false;
	}

	loadMoreArticles = () => {
		if (!this.loadedAllTheArticles && this.maunted) {
			this.loadedAllTheArticles = true;
			this.props.getArticles(null, true, false);
		}
	};

	handleArticleChange = (article) => {
		this.props.showUpdateStoryModal(article);
	};

	render() {
		return (
			<VerticalList key="home" onBottomReached={this.loadMoreArticles}>
				{this.props.articles.map((article) => (
					<BigImageArticlePreview
						article={article}
						key={article.verbose}
						onChangeArticleClicked={this.handleArticleChange}
					/>
				))}
			</VerticalList>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		articles: getFetchedArticles(state),
	};
};

const mapDispatchToProps = {
	showUpdateStoryModal,
	getArticles,
};

HomePage = connect(mapStateToProps, mapDispatchToProps)(HomePage);
export { HomePage };
