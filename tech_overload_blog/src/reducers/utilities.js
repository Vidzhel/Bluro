export function copyObject(obj) {
	// const copiedObj = JSON.parse(JSON.stringify(obj, filterEventHandlers));
	// copyEventHandlers(copiedObj, obj);
	return JSON.parse(JSON.stringify(obj));
}
//
// function filterEventHandlers(key, value) {
// 	if (value === null || value === undefined) {
// 		return null;
// 	}
// 	if (!(value instanceof EventSubscription) && value["unsubscribe"] === undefined) {
// 		return value;
// 	}
//
// 	return void 0;
// }
//
// function copyEventHandlers(target, source) {
// 	for (const [key, value] of Object.entries(source)) {
// 		if (
// 			value &&
// 			typeof value === "object" &&
// 			(value instanceof EventSubscription || value["unsubscribe"])
// 		) {
// 			target[key] = value;
// 		} else if (value !== null && typeof value === "object") {
// 			copyEventHandlers(target[key], source[key]);
// 		}
// 	}
// }
