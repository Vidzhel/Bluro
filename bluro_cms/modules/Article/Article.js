const Model = DependencyResolver.getDependency(null, "Model");
const ARTICLE_STATES = {
	PUBLISHED: "PUBLISHED",
	PENDING_PUBLISHING: "PENDING_PUBLISHING",
};
const VERBOSE_REGEXP = /[0-9a-z-._~]/i;

class Article extends Model {
	static STATES = ARTICLE_STATES;
}

Article.init([
	{
		columnName: "verbose",
		type: Model.DATA_TYPES.VARCHAR(50, VERBOSE_REGEXP),
		unique: true,
	},
	{
		columnName: "user",
		foreignKey: {
			table: "User",
			columnName: "id",
			onDelete: Model.OP.CASCADE,
			onUpdate: Model.OP.CASCADE,
		},
		type: Model.DATA_TYPES.INT(),
	},
	{
		columnName: "dateOfPublishing",
		verboseName: "Date of publishing",
		type: Model.DATA_TYPES.DATE_TIME(),
		nullable: true,
		validators: Model.CUSTOM_VALIDATORS_GENERATORS.dateInterval(),
	},
	{
		columnName: "dateOfChanging",
		verboseName: "Date of changing",
		type: Model.DATA_TYPES.DATE_TIME(),
		validators: Model.CUSTOM_VALIDATORS_GENERATORS.dateInterval(),
	},
	{
		columnName: "title",
		type: Model.DATA_TYPES.VARCHAR(100),
	},
	{
		columnName: "description",
		type: Model.DATA_TYPES.VARCHAR(250),
	},
	{
		columnName: "state",
		verboseName: "Article state",
		type: Model.DATA_TYPES.VARCHAR(18),
		possibleValues: Object.values(ARTICLE_STATES),
	},
	{
		columnName: "textSourceName",
		type: Model.DATA_TYPES.VARCHAR(50),
		validators: Model.CUSTOM_VALIDATORS_GENERATORS.file(),
	},
	{
		columnName: "previewImageName",
		type: Model.DATA_TYPES.VARCHAR(50),
		validators: Model.CUSTOM_VALIDATORS_GENERATORS.file(),
	},
]);

module.exports = Article;
