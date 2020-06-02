import React from "react";
import { VerticalList } from "../components/VerticalList";
import { connect } from "react-redux";
import { fetchChunkOfArticles } from "../actions/articles";
import { getFetchedArticles } from "../assets/selectors/articles";
import { SmallImageArticlePreview } from "../components/SmallmageArticlePreview";
import { BigImageArticlePreview } from "../components/BigImageArticlePreview";

class HomePage extends React.Component {
	componentDidMount() {
		this.props.fetchChunkOfArticles();
		this.loadedAllTheArticles = false;
	}

	componentWillUnmount() {
		console.log("Unmount");
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (prevProps.articles.length !== this.props.articles.length) {
			this.loadedAllTheArticles = false;
		}
	}

	loadMoreArticles = () => {
		if (!this.loadedAllTheArticles) {
			this.loadedAllTheArticles = true;
			this.props.fetchChunkOfArticles();
		}
	};

	render() {
		return (
			<VerticalList onBottomReached={this.loadMoreArticles}>
				{this.props.articles.map((article) => (
					<BigImageArticlePreview {...article} key={article.verbose} />
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
	fetchChunkOfArticles,
};

HomePage = connect(mapStateToProps, mapDispatchToProps)(HomePage);
export { HomePage };
