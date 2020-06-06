import React from "react";
import { connect } from "react-redux";
import { deleteMessage } from "../actions/actions";
import PropTypes from "prop-types";
import Alert from "react-bootstrap/Alert";
import styled from "styled-components";

const LIFE_TIME = 5000;
const DECREASE_OPACITY_AFTER = 3000;
const DECREASE_OPACITY_PERCENT = 0.05;
const DECREASE_OPACITY_INTERVAL =
	(LIFE_TIME - DECREASE_OPACITY_AFTER) / (1 / DECREASE_OPACITY_PERCENT);

const StyledAlert = styled(Alert)`
	opacity: ${(props) => props.opacity};
	width: 200px;
`;

class Message extends React.Component {
	constructor(props) {
		super(props);

		this.destructTimer = null;
		this.decreaseOpacityTimeout = null;
		this.decreaseOpacityInterval = null;

		this.state = {
			opacity: 1,
		};

		this.distructed = false;
	}

	componentDidMount = () => {
		this.initDestruction();
	};

	initDestruction = () => {
		if (this.distructed) {
			return;
		}
		if (this.destructTimer) {
			clearTimeout(this.destructTimer);
		}
		if (this.decreaseOpacityTimeout) {
			clearTimeout(this.decreaseOpacityTimeout);
		}
		if (this.decreaseOpacityInterval) {
			clearInterval(this.decreaseOpacityInterval);
		}

		this.setState({ opacity: 1 });
		this.destructTimer = setTimeout(this.destruct, LIFE_TIME);
		this.decreaseOpacityTimeout = setTimeout(
			this.startDecreasingOpacity,
			DECREASE_OPACITY_AFTER,
		);
	};

	startDecreasingOpacity = () => {
		this.decreaseOpacityInterval = setInterval(this.decreaseOpacity, DECREASE_OPACITY_INTERVAL);
	};

	decreaseOpacity = () => {
		this.setState({ opacity: this.state.opacity - DECREASE_OPACITY_PERCENT });
	};

	destruct = () => {
		this.distructed = true;
		if (this.destructTimer) {
			clearTimeout(this.destructTimer);
		}
		if (this.decreaseOpacityTimeout) {
			clearTimeout(this.decreaseOpacityTimeout);
		}
		if (this.decreaseOpacityInterval) {
			clearInterval(this.decreaseOpacityInterval);
		}
		this.props.deleteMessage(this.props.id);
	};

	render() {
		const { type, message } = this.props;

		return (
			<StyledAlert
				onMouseEnter={this.initDestruction}
				opacity={this.state.opacity}
				variant={type}>
				{message}
			</StyledAlert>
		);
	}
}

Message.propTypes = {
	id: PropTypes.number.isRequired,
	message: PropTypes.string.isRequired,
	type: PropTypes.oneOf(["danger", "primary", "success"]),
};

const mapDispatchToProps = {
	deleteMessage,
};

Message = connect(null, mapDispatchToProps)(Message);
export { Message };
