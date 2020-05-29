const Model = DependencyResolver.getDependency(null, "Model");
const bcrypt = require("bcryptjs");
const VERBOSE_REGEXP = /[0-9a-z-._~]/i;
const USER_ROLES = {
	ADMIN: "ADMIN",
	USER: "USER",
	GUEST: "GUEST",
};

const EMAIL_REGEXP = RegExp(
	/^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/,
	"i",
);

class User extends Model {
	static ROLES = USER_ROLES;
}

User.init([
	{
		columnName: "userName",
		type: Model.DATA_TYPES.VARCHAR(10),
	},
	{
		columnName: "verbose",
		type: Model.DATA_TYPES.VARCHAR(50, VERBOSE_REGEXP),
		unique: true,
	},
	{
		columnName: "email",
		type: Model.DATA_TYPES.VARCHAR(20, EMAIL_REGEXP),
	},
	{
		columnName: "pass",
		verboseName: "User password",
		type: Model.DATA_TYPES.VARCHAR(100, null, null, 15),
		converters: hashPass,
		protectedProperty: true,
	},
	{
		columnName: "role",
		verboseName: "User role",
		type: Model.DATA_TYPES.VARCHAR(10),
		default: USER_ROLES.USER,
		possibleValues: Object.values(USER_ROLES),
	},
]);

function hashPass(pass) {
	return bcrypt.hashSync(pass, 8);
}

module.exports = User;
