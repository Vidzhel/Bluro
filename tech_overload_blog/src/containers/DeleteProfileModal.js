import React from "react";
import Modal from "react-bootstrap/esm/Modal";
import Button from "react-bootstrap/Button";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { deleteProfile } from "../actions/profile";

class DeleteProfileModal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			showModal: true,
		};

		this.previewImgFile = React.createRef();
		this.contentFile = React.createRef();
		this.setData = false;
	}

	componentDidUpdate = (prevProps) => {
		const { showModal } = this.props;
		if (prevProps.showModal !== showModal) {
			this.setData = false;
		}
	};

	handleDelete = (event) => {
		event.preventDefault();
		event.stopPropagation();

		this.props.deleteProfile();
		this.props.handleClose();
	};

	render() {
		return (
			<Modal show={this.props.showModal} onHide={this.props.handleClose}>
				<Modal.Header closeButton>
					<Modal.Title>Delete Profile</Modal.Title>
				</Modal.Header>
				<Modal.Body>Are you sure that you want to delete your profile?</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={this.props.handleClose}>
						Cancel
					</Button>

					<Button variant="danger" onClick={this.handleDelete}>
						Delete
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}

DeleteProfileModal.propTypes = {
	handleClose: PropTypes.func.isRequired,
	showModal: PropTypes.bool.isRequired,
};

const mapDispatchToProps = {
	deleteProfile,
};

DeleteProfileModal = connect(null, mapDispatchToProps)(DeleteProfileModal);
export { DeleteProfileModal };
