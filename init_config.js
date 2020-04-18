const BYTE = "(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)";
const IP = `^(?:${BYTE}\.){3}${BYTE}$`;
const PORT = `^(?:[1-9]|[1-5]?[0-9]{2,4}|6[1-4][0-9]{3}|65[1-4][0-9]{2}|655[1-2][0-9]|6553[1-5])$`;
const IP_REGEX = new RegExp(IP);
const PORT_REGEX = new RegExp(PORT);

if (process.argv.length > 2) {
	if (IP_REGEX.test(process.argv[2])) {
		hostname = process.argv[2];
	} else {
		console.log(
			"Wrong hostname is specified, the default hostname (" + hostname + ") will be used"
		);
	}

	if (process.argv[3] && PORT_REGEX.test(process.argv[3])) {
		port = process.argv[3];
	} else {
		console.log("Wrong port is specified, the default port (" + port + ") will be used");
	}
}
