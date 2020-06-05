import React from "react";
import Modal from "react-bootstrap/esm/Modal";
import Button from "react-bootstrap/Button";
import { ChangeStoryFrom } from "../components/ChangeStoryModal";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import {
	ARTICLE_STATE_DRAFT,
	ARTICLE_STATE_PUBLISH,
	CONTENT_EXTENSION_REGEXP,
	IMAGE_EXTENSION_REGEXP,
	VERBOSE_REGEXP,
} from "../assets/constants";
import { createArticle, deleteArticle, updateArticle } from "../actions/articles";

class StoryModal extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			errors: {
				title: null,
				verbose: null,
				description: null,
				previewImg: null,
				content: null,
			},
			values: {
				title: "",
				verbose: "",
				description: "",
			},
			touched: {
				title: false,
				verbose: false,
				description: false,
				previewImg: false,
				content: false,
			},
			loading: false,
			showModal: true,
		};

		this.previewImgFile = React.createRef();
		this.contentFile = React.createRef();
		this.setData = false;
	}

	componentDidUpdate = (prevProps) => {
		const { article, showModal } = this.props;
		if (prevProps.showModal !== showModal) {
			this.setData = false;
		}

		if (!this.setData) {
			this.setData = true;
			this.setState({
				values: {
					title: (article && article.title) || "",
					verbose: (article && article.verbose) || "",
					description: (article && article.description) || "",
				},
			});
		}
	};

	handleChange = (event) => {
		const input = event.target;
		const name = input.name;
		const value = input.value;

		if (!input.checkValidity()) {
			this._setError(name, "Wrong format");
		} else {
			this._setError(name, "");
		}
		this._setValue(name, value);
	};

	_setError = (field, message) => {
		const errors = Object.assign({}, this.state.errors);
		errors[field] = message;
		this.setState({
			errors,
		});
	};

	_setValue = (field, value) => {
		const values = Object.assign({}, this.state.values);
		const touched = Object.assign({}, this.state.touched);
		if (values[field] === undefined) {
			return;
		}

		values[field] = value;
		touched[field] = true;

		this.setState({
			values,
			touched,
		});
	};

	validateCreate = () => {
		const values = this.state.values;

		this.setState({
			touched: {
				title: true,
				verbose: true,
				description: true,
				previewImg: true,
				content: true,
			},
		});

		if (!values.title || values.title > 100) {
			this._setError("title", "Title has have more the 0 and less then 100 symbols");
			return;
		} else {
			this._setError("title", "");
		}

		if (values.verbose && !VERBOSE_REGEXP.test(values.verbose)) {
			this._setError(
				"verbose",
				"Verbose name can only contain the following symbols (spaces are forbidden):a-z0-9A-Z-._~",
			);
			return;
		} else {
			this._setError("verbose", "");
		}

		if (!values.description || values.description.length > 250) {
			this._setError(
				"description",
				"Description has have more the 0 and less then 250 symbols",
			);
			return;
		} else {
			this._setError("description", "");
		}

		const img = this.previewImgFile.current.files[0];
		if (!img) {
			this._setError("previewImg", "Preview image has to be specified");
			return;
		} else {
			this._setError("previewImg", "");
		}

		if (!IMAGE_EXTENSION_REGEXP.test(img.name)) {
			this._setError(
				"previewImg",
				'Only those image types are allowed: ".jpg", ".jpeg", ".bmp", ".gif", ".png"',
			);
			return;
		} else {
			this._setError("previewImg", "");
		}

		const content = this.contentFile.current.files[0];
		if (!content) {
			this._setError("content", "Content has to be specified");
			return;
		} else {
			this._setError("content", "");
		}

		if (!CONTENT_EXTENSION_REGEXP.test(content.name)) {
			this._setError("content", 'Only those content types are allowed: ".md", ".markdown"');
			return;
		} else {
			this._setError("content", "");
		}

		return true;
	};

	validateUpdate = () => {
		const values = this.state.values;

		this.setState({
			touched: {
				title: true,
				verbose: true,
				description: true,
				previewImg: true,
				content: true,
			},
		});

		if ((values.title && !values.title) || values.title > 100) {
			this._setError("title", "Title has have more the 0 and less then 100 symbols");
			return;
		} else {
			this._setError("title", "");
		}

		if (values.verbose && values.verbose && !VERBOSE_REGEXP.test(values.verbose)) {
			this._setError(
				"verbose",
				"Verbose name can only contain the following symbols (spaces are forbidden):a-z0-9A-Z-._~",
			);
			return;
		} else {
			this._setError("verbose", "");
		}

		if (values.title && values.description.length > 250) {
			this._setError("description", "Can't contain more than 250 symbols");
			return;
		} else {
			this._setError("description", "");
		}

		const img = this.previewImgFile.current.files[0];
		if (img && !IMAGE_EXTENSION_REGEXP.test(img.name)) {
			this._setError(
				"previewImg",
				'Only those image types are allowed: ".jpg", ".jpeg", ".bmp", ".gif", ".png"',
			);
			return;
		} else {
			this._setError("previewImg", "");
		}

		const content = this.contentFile.current.files[0];
		if (content && !CONTENT_EXTENSION_REGEXP.test(content.name)) {
			this._setError("content", 'Only those content types are allowed: ".md", ".markdown"');
			return;
		} else {
			this._setError("content", "");
		}

		return true;
	};

	handleDelete = (event) => {
		event.preventDefault();
		event.stopPropagation();

		this.props.deleteArticle(this.props.article.verbose);
		this.props.handleClose();
	};

	handleArticlesModification = (state, event) => {
		event.preventDefault();
		event.stopPropagation();
		const valid = this.props.isUpdateStory ? this.validateUpdate() : this.validateCreate();
		if (!valid) {
			return;
		}

		const data = this.props.isUpdateStory ? this.getChangedData(state) : this.getData(state);

		if (this.props.isUpdateStory) {
			this.props.updateArticle(this.props.article.verbose, data);
		} else {
			this.props.createArticle(data);
		}
		this.props.handleClose();
	};

	getChangedData = (state) => {
		const article = this.props.article;
		const values = this.state.values;

		return {
			title: values.title !== article.title ? values.title : void 0,
			verbose: values.verbose !== article.verbose ? values.verbose : void 0,
			description: values.description !== article.description ? values.description : void 0,
			state,
			previewImg: this.previewImgFile.current.files[0] || void 0,
			content: this.contentFile.current.files[0] || void 0,
		};
	};

	getData = (state) => {
		const values = this.state.values;
		return {
			title: values.title,
			verbose: values.verbose,
			description: values.description,
			state,
			previewImg: this.previewImgFile.current.files[0],
			content: this.contentFile.current.files[0],
		};
	};

	render() {
		return (
			<Modal show={this.props.showModal} onHide={this.props.handleClose}>
				<Modal.Header closeButton>
					<Modal.Title>
						{this.props.isUpdateStory ? "Update a story" : "Upload new story"}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<ChangeStoryFrom
						values={this.state.values}
						errors={this.state.errors}
						touched={this.state.touched}
						loading={this.state.loading}
						handleChange={this.handleChange}
						previewImgFile={this.previewImgFile}
						contentFile={this.contentFile}
					/>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={this.props.handleClose}>
						Cancel
					</Button>

					{this.props.isUpdateStory ? (
						<Button variant="danger" onClick={this.handleDelete}>
							Delete
						</Button>
					) : null}

					<Button
						variant="primary"
						onClick={this.handleArticlesModification.bind(this, ARTICLE_STATE_DRAFT)}>
						Save drafts
					</Button>
					<Button
						variant="success"
						onClick={this.handleArticlesModification.bind(this, ARTICLE_STATE_PUBLISH)}>
						Publish
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}

StoryModal.propTypes = {
	isUpdateStory: PropTypes.bool.isRequired,
	article: PropTypes.shape({
		title: PropTypes.string.isRequired,
		verbose: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
		state: PropTypes.string.isRequired,
	}),
	handleClose: PropTypes.func.isRequired,
	showModal: PropTypes.bool.isRequired,
};

const mapDispatchToProps = {
	createArticle,
	deleteArticle,
	updateArticle,
};

StoryModal = connect(null, mapDispatchToProps)(StoryModal);
export { StoryModal };
