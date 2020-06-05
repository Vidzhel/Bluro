import React from "react";
import { connect } from "react-redux";
import { StoryModal } from "./StoryModal";
import {
	getShowStoryModal,
	getIsUpdateStoryModal,
	getShowDeleteProfileModal,
} from "../assets/selectors/session";
import { hideDeleteProfileModal, hideStoryModal } from "../actions/session";
import { getEditingArticle } from "../assets/selectors/articles";
import { DeleteProfileModal } from "./DeleteProfileModal";

class ModalsController extends React.Component {
	handleUpdateStoryClose = () => {
		this.props.hideStoryModal();
	};

	handleDeleteProfileClose = () => {
		this.props.hideDeleteProfileModal();
	};

	render() {
		return (
			<>
				<StoryModal
					showModal={this.props.showStoryModel}
					handleClose={this.handleUpdateStoryClose}
					isUpdateStory={this.props.isUpdateStoryModal}
					article={this.props.isUpdateStoryModal ? this.props.editingArticle : null}
				/>
				<DeleteProfileModal
					handleClose={this.handleDeleteProfileClose}
					showModal={this.props.showDeleteProfileModal}
				/>
			</>
		);
	}
}

const mapStateToProps = (store) => {
	return {
		showStoryModel: getShowStoryModal(store),
		isUpdateStoryModal: getIsUpdateStoryModal(store),
		editingArticle: getEditingArticle(store),

		showDeleteProfileModal: getShowDeleteProfileModal(store),
	};
};

const mapDispatchToProps = {
	hideStoryModal,
	hideDeleteProfileModal,
};

ModalsController = connect(mapStateToProps, mapDispatchToProps)(ModalsController);
export { ModalsController };
