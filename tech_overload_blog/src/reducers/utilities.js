export function copyObject(obj) {
	const copy = JSON.parse(JSON.stringify(obj));

	for (const [param, val] of Object.entries(obj)) {
		if (val instanceof Map) {
			copy[param] = val;
		}
	}

	return copy;
}
