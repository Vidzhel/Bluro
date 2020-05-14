// const { Model } = require("../../dependencies");
const Model = DependencyResolver.getDependency(null, "Model");
const structure = [
	{
		columnName: "userName",
		type: Model.DATA_TYPES.VARCHAR(10),
	},
];
class User extends Model {
	constructor() {
		super(structure);
	}
}

module.exports = User;
// const table = new User();
// (async function () {
// 	await table.up();
// })();
