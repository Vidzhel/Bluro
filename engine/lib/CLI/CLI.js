const SCRIPTS = { "make-migration": "makemigration" };
const args = process.argv;
const script = args[2];

if (!(script && Object.keys(SCRIPTS).includes(script))) {
	throw new Error(
		`Wrong command '${script}', one of the command have to be specified ${SCRIPTS}`,
	);
}

require(`${module.path}/scripts/${SCRIPTS[script]}`)(args.slice(3));
