const Model = DependencyResolver.getDependency(null, "Model");

class Follower extends Model {}
Follower.init([
	{
		columnName: "user",
		type: Model.DATA_TYPES.VARCHAR(50),
		foreignKey: {
			columnName: "verbose",
			table: "User",
			onDelete: Model.OP.CASCADE,
			onUpdate: Model.OP.CASCADE,
		},
	},
	{
		columnName: "follower",
		type: Model.DATA_TYPES.VARCHAR(50),
		foreignKey: {
			columnName: "verbose",
			table: "User",
			onDelete: Model.OP.CASCADE,
			onUpdate: Model.OP.CASCADE,
		},
	},
]);

module.exports = Follower;
