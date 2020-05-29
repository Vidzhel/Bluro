const Model = DependencyResolver.getDependency(null, "Model");

class Comment extends Model {}

Comment.init([
	{
		columnName: "id",
		type: Model.DATA_TYPES.INT(),
		primaryKey: true,
		autoincrement: true,
	},
	{
		columnName: "user",
		type: Model.DATA_TYPES.INT(),
		foreignKey: {
			table: "User",
			columnName: "id",
			onUpdate: Model.OP.CASCADE,
			onDelete: Model.OP.CASCADE,
		},
	},
	{
		columnName: "article",
		type: Model.DATA_TYPES.INT(),
		foreignKey: {
			table: "Article",
			columnName: "id",
			onUpdate: Model.OP.CASCADE,
			onDelete: Model.OP.CASCADE,
		},
		protectedProperty: true,
	},
	{
		columnName: "content",
		type: Model.DATA_TYPES.VARCHAR(500),
	},
	{
		columnName: "creationDate",
		type: Model.DATA_TYPES.DATE_TIME(),
		validators: Model.CUSTOM_VALIDATORS_GENERATORS.dateInterval(),
	},
	{
		columnName: "lastUpdateDate",
		type: Model.DATA_TYPES.DATE_TIME(),
		validators: Model.CUSTOM_VALIDATORS_GENERATORS.dateInterval(),
	},
]);

module.exports = Comment;
