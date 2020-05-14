const ConfigsManager = require("../../configs/ConfigsManager");
const MudolesManger = require("../../modulesManager/moduleManager");

const OPTIONS = ["up", "down"];
module.exports = function (args) {
	const configsManager = new ConfigsManager();
	const modulesManager = new MudolesManger();
	const projRoot = configsManager.getEntry("root");
	const modulesRoot = projRoot + "/Modules";

	require(modulesRoot)(modulesManager);
	console.log(modulesManager.modules);
};
