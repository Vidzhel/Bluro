const Model = DependencyResolver.getDependency(null, "Model");
const NOTIFICATION_STATUS = {
	SENT: "SENT",
	READ: "READ",
};

class Notification extends Model {
	static STATUS = NOTIFICATION_STATUS;
}

Notification.init([
	{
		columnName: "id",
		type: Model.DATA_TYPES.INT(),
		autoincrement: true,
		primaryKey: true,
	},
	{
		columnName: "sender",
		verboseName: "Notification sender",
		type: Model.DATA_TYPES.VARCHAR(50),
		foreignKey: {
			columnName: "verbose",
			table: "User",
			onDelete: Model.OP.CASCADE,
			onUpdate: Model.OP.CASCADE,
		},
	},
	{
		columnName: "receiver",
		verboseName: "Notification receiver",
		type: Model.DATA_TYPES.VARCHAR(50),
		foreignKey: {
			columnName: "verbose",
			table: "User",
			onDelete: Model.OP.CASCADE,
			onUpdate: Model.OP.CASCADE,
		},
	},
	{
		columnName: "message",
		verboseName: "Notification text",
		type: Model.DATA_TYPES.VARCHAR(600),
	},
	{
		columnName: "title",
		verboseName: "Notification title",
		type: Model.DATA_TYPES.VARCHAR(50),
	},
	{
		columnName: "status",
		verboseName: "Notification status",
		type: Model.DATA_TYPES.VARCHAR(5),
		possibleValues: Object.values(NOTIFICATION_STATUS),
	},
	{
		columnName: "date",
		verboseName: "Date of sending",
		type: Model.DATA_TYPES.DATE_TIME(),
		validators: Model.CUSTOM_VALIDATORS_GENERATORS.dateInterval(),
	},
]);

module.exports = Notification;
