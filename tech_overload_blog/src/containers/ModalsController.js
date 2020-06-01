import React from "react";
import { connect } from "react-redux";
import { StoryModal } from "./StoryModal";
import { getShowStoryModal, getIsUpdateStoryModal } from "../assets/selectors/session";
import { hideStoryModal } from "../actions/session";
import { getEditingArticle } from "../assets/selectors/articles";

class ModalsController extends React.Component {
	handleClose = () => {
		this.props.hideStoryModal();
	};

	render() {
		return (
			<StoryModal
				showModal={this.props.showStoryModel}
				handleClose={this.handleClose}
				isUpdateStory={this.props.isUpdateStoryModal}
				article={this.props.isUpdateStoryModal ? this.props.editingArticle : null}
			/>
		);
	}
}

const mapStateToProps = (store) => {
	return {
		showStoryModel: getShowStoryModal(store),
		isUpdateStoryModal: getIsUpdateStoryModal(store),
		editingArticle: getEditingArticle(store),
	};
};

const mapDispatchToProps = {
	hideStoryModal,
};

ModalsController = connect(mapStateToProps, mapDispatchToProps)(ModalsController);
export { ModalsController };
