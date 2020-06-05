import React from "react";
import styled from "styled-components";
import Form from "react-bootstrap/Form";
import { VerticalList } from "../components/VerticalList";
import { connect } from "react-redux";
import { getFetchedArticles } from "../assets/selectors/articles";
import { getArticles } from "../actions/articles";
import { BigImageArticlePreview } from "../components/BigImageArticlePreview";
import { showUpdateStoryModal } from "../actions/session";
import qs from "qs";
import Container from "react-bootstrap/Container";

const SEARCH_DELAY = 1000;

const StyledContainer = styled(Container)`
	margin-top: 100px;

	input {
		border-radius: 0;
		border-left: none;
		border-right: none;
		border-top: none;

		&:focus {
			outline: none;
			box-shadow: none;
			border-color: inherit;
		}
	}

	.message {
		margin: 20px auto 0 auto;
		display: flex;
		justify-content: center;
	}
`;

class SearchPage extends React.Component {
	constructor(props) {
		super(props);

		this.searchTimer = null;
	}

	componentDidMount() {
		const parameters = {};

		try {
			const query = qs.parse(this.props.location.search, { ignoreQueryPrefix: true });
			this.query = query["search"];

			query["search"].split(";").forEach((value) => {
				const [param, val] = value.split(":");
				if (param && val) {
					parameters[param] = val;
				}
			});
		} catch (e) {}

		this.searchParams = parameters;
		this.loadArticles(true, parameters);
	}

	loadArticles = (start, searchParams = null) => {
		this.props.getArticles(null, true, start, searchParams);
	};

	handleSearchFieldChanged = (event) => {
		const input = event.target;
		const value = input.value;

		if (value) {
			clearTimeout(this.searchTimer);
			this.searchTimer = setTimeout(() => this.handleSearch(value), SEARCH_DELAY);
		}
	};

	handleSearch = (val) => {
		const query = `?search=description:${val}`;
		if (this.query !== query) {
			this.props.history.push(this.props.location.pathname + query);
			this.query = query;

			this.searchParams = { description: val };
			this.loadArticles(true, this.searchParams);
		}
	};

	handleChangeArticleClicked = (article) => {
		this.props.showUpdateStoryModal(article);
	};

	render() {
		const articles = this.props.articles;

		return (
			<StyledContainer>
				<Form.Control
					type="text"
					onChange={this.handleSearchFieldChanged}
					placeholder="Search articles"
				/>
				{articles.length ? (
					<VerticalList>
						{articles.map((article) => {
							return (
								<BigImageArticlePreview
									key={article.verbose}
									article={article}
									onChangeArticleClicked={this.handleChangeArticleClicked}
								/>
							);
						})}
					</VerticalList>
				) : (
					<div className="message">Nothing to show here</div>
				)}
			</StyledContainer>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		articles: getFetchedArticles(state),
	};
};

const mapDispatchToProps = {
	getArticles,
	showUpdateStoryModal,
};

SearchPage = connect(mapStateToProps, mapDispatchToProps)(SearchPage);

export { SearchPage };
