import React from "react";
import size from "react-sizeme";
import PropTypes from "prop-types";

const THRESHOLD = 200;

class VerticalList extends React.Component {
	componentDidMount() {
		window.addEventListener("scroll", this.handleScroll);
	}

	handleScroll = () => {
		const size = this.props.size;
		const absoluteComponentHeight = size.height + size.position.top;
		const pageOffset = window.scrollY + window.innerHeight;

		if (absoluteComponentHeight - pageOffset < THRESHOLD && this.props.onBottomReached) {
			this.props.onBottomReached();
		}
	};

	render() {
		if (!this.props.children) {
			return null;
		}

		return (
			<div>
				{this.props.children.length
					? this.props.children
					: this.props.children.map((child) => child)}
			</div>
		);
	}
}

VerticalList.propTypes = {
	onBottomReached: PropTypes.func,
};

VerticalList = size({ monitorHeight: true, monitorWidth: false, monitorPosition: true })(
	VerticalList,
);
export { VerticalList };
