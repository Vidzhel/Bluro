import React from "react";
import styled from "styled-components";
import { SearchForm } from "../components/SearchForm";
import PropTypes from "prop-types";
import { VerticalList } from "../components/VerticalList";
import qs from "qs";

const StyledContainer = styled.div`
	margin-top: 20px;
	margin-right: 10px;
`;

class DataList extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			values: {
				search: "",
				param: Object.keys(this.props.searchOptions)[0] || "",
			},
		};

		this.searchParams = {};
		this.query = "";
	}

	componentDidMount = () => {
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
		this.props.fetchData(true, parameters);
	}

	handleFormChange = (event) => {
		const input = event.target;
		const name = input.name;
		const value = input.value;

		this._setValue(name, value);
	};

	_setValue = (field, value) => {
		const values = Object.assign({}, this.state.values);
		const touched = Object.assign({}, this.state.touched);
		values[field] = value;
		touched[field] = true;

		this.setState({
			values,
			touched,
		});
	};

	handleSearch = (event) => {
		event.preventDefault();
		event.stopPropagation();

		const values = this.state.values;

		this.search(values.param, values.search)
	};

	search = (param, val) => {
		const query = `?search=${param}:${val}`;
		if (this.query !== query) {
			this.props.history.push(this.props.location.pathname + query);
			this.query = query;

			this.searchParams = { [param]: val };
			this.props.fetchData(true, this.searchParams);
		}
	}

	handleLoadMoreData = () => {
		this.props.fetchData(false, this.searchParams);
	};

	render() {
		const { searchOptions, children } = this.props;

		return (
			<StyledContainer>
				<SearchForm
					{...this.state}
					searchOptions={searchOptions}
					onChange={this.handleFormChange}
					onSubmit={this.handleSearch}
				/>
				{children ? (
					<VerticalList onBottomReached={this.handleLoadMoreData} children={children}/>
				) : (
					"Nothing to show here"
				)}
			</StyledContainer>
		);
	}
}

DataList.propTypes = {
	searchOptions: PropTypes.object.isRequired,
	fetchData: PropTypes.func.isRequired,
};

export { DataList };
