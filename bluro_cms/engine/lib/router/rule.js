"use strict";

const utilities = require("./utilities");
const METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"];
const PATH_SYMBOL = "[0-9a-z-._~]";

class Rule {
	_handlers = {};

	_segmentTypes = {
		URL: "urlSegment",
		PARAM: "paramSegment",
		EXPR: "customExpr",
		UNI_SEGMENT: "universalSegment",
		UNI_CHARACTER: "universalCharacter",
	};
	_patterns = {
		urlSegment: new RegExp(`^${PATH_SYMBOL}+$`, "i"),
		paramSegment: new RegExp(`^{(${PATH_SYMBOL}+)}(?:\\((\\S+)\\))?$`, "i"),
		customExpr: new RegExp("^\\((\\S+)\\)$"),
		universalSegment: new RegExp(`^(${PATH_SYMBOL}*)\\*(${PATH_SYMBOL}*)$`),
		universalCharacter: new RegExp(`^(${PATH_SYMBOL}*)(\\?+)(${PATH_SYMBOL}*)$`),
	};

	constructor(methods, mountingPath, handlers, options = null) {
		if (!methods) {
			throw new Error("Methods have to be specified");
		}
		if (!handlers) {
			throw new Error("Handlers have to be specified");
		}
		const pathSegments = utilities.splitPathWithExpr(mountingPath);

		this.mountingPath = mountingPath;
		this.length = pathSegments.length;
		this.extractedParams = {};
		this.options = options || {
			sensitive: true,
		};
		this._mountingSegmentsData = this._processPathSegments(pathSegments);

		this.define(methods, handlers);
	}

	define(methods, handlers) {
		const _handlers = typeof handlers[Symbol.iterator] === "function" ? handlers : [handlers];

		for (const handler of _handlers) {
			if (typeof handler !== "function") {
				throw new Error("Expected function, got " + typeof handler);
			}

			this._addHandler(methods, handler);
		}
	}

	_addHandler(methods, handler) {
		let _methods = methods === "all" ? METHODS : methods;
		_methods = typeof _methods === "string" ? [methods] : _methods;

		for (let method of _methods) {
			method = method.toUpperCase();

			if (!METHODS.includes(method)) {
				throw new Error("Expected http method, got " + method);
			}

			this._addToMethod(method, handler);
		}
	}

	_addToMethod(method, handler) {
		this._handlers[method] = this._handlers[method] || [];
		this._handlers[method].push(handler);
	}

	match(method, pathSegments) {
		if (!this._handlers[method]) {
			return false;
		}
		// If a rule length is greater than request path
		// the rule won't match in any way
		if (this.length > pathSegments.length) {
			return false;
		}

		if (this.options.sensitive) {
			// If the rule match only the root, but a request path isn't root
			// than rule doesn't match
			if (pathSegments.length !== 0 && this._mountingSegmentsData.length === 0) {
				return false;
			}
		}

		this.extractedParams = {};
		let idx = 0;

		while (idx < pathSegments.length && idx < this._mountingSegmentsData.length) {
			const givenSegment = pathSegments[idx];
			const segmentData = this._mountingSegmentsData[idx];

			switch (segmentData.type) {
				case this._segmentTypes.URL:
				case this._segmentTypes.UNI_CHARACTER:
				case this._segmentTypes.EXPR:
					if (!segmentData.expression.test(givenSegment)) {
						return false;
					}
					break;
				case this._segmentTypes.PARAM:
					if (!segmentData.expression.test(givenSegment)) {
						return false;
					}

					this.extractedParams[segmentData.name] = givenSegment;
					break;
				case this._segmentTypes.UNI_SEGMENT:
					// TODO universal segment check only this and last segment as start and end segments, so /my*dear/home will work when requested path is /my/.../dear but wont work when the apth is /my/.../dear/home
					if (
						segmentData.startSegmentExpr &&
						!segmentData.startSegmentExpr.test(givenSegment)
					) {
						return false;
					}
					if (
						segmentData.endSegmentExpr &&
						!segmentData.endSegmentExpr.test(!pathSegments[pathSegments.length - 1])
					) {
						return false;
					}

					return true;
				default:
					throw new Error("Unknown segment type: " + segmentData.type);
			}

			idx++;
		}

		if (this.options.sensitive) {
			// if requested path is longer than matching path (there isn't UNI_SEGMENT)
			if (pathSegments.length > this._mountingSegmentsData.length) {
				return false;
			}
		}

		return true;
	}

	async dispatch(error, req, res, data) {
		data.params = this.extractedParams;

		if (error) {
			const { idx, preventPropagation } = await this._dispatchError(error, req, res, data, 0);

			if (preventPropagation) {
				return preventPropagation;
			}

			return await this._dispatchRequest(req, res, data, idx);
		} else {
			return await this._dispatchRequest(req, res, data);
		}
	}

	async _dispatchError(error, req, res, data, handler_index = 0) {
		const method = req.method;
		const handlers = this._handlers[method];

		while (handler_index < handlers.length) {
			const handler = handlers[handler_index++];

			// if error handler
			if (handler.length > 3) {
				const preventPropagation = await handler(error, req, res, data);
				return { idx: handler_index, preventPropagation };
			}
		}

		throw error;
	}

	async _dispatchRequest(req, res, data, handler_index = 0) {
		const method = req.method;
		const handlers = this._handlers[method];
		let stopPropagating = false;

		for (let i = handler_index; i < handlers.length && !stopPropagating; i++) {
			const handler = handlers[i];

			try {
				// if a handler is a request handler
				if (!(handler.length > 3)) {
					stopPropagating = await handler(req, res, data);
				}
			} catch (error) {
				// if no error handler was specified
				stopPropagating = await this._dispatchError(error, req, res, data, i);
			}
		}

		return stopPropagating;
	}

	_processPathSegments(pathSegments) {
		const processedPath = [];
		const patterns = this._patterns;
		const segmentTypes = this._segmentTypes;
		const flags = this._getRegExpFags();

		let segmentData = null;

		for (const segment of pathSegments) {
			if (patterns[segmentTypes.URL].test(segment)) {
				segmentData = {
					type: segmentTypes.URL,
					expression: new RegExp(`^${segment}$`, flags),
				};
			} else if (patterns[segmentTypes.PARAM].test(segment)) {
				const match = patterns[segmentTypes.PARAM].exec(segment);
				const expr = match[2]
					? new RegExp(match[2], flags)
					: new RegExp(`^${PATH_SYMBOL}+$`, "i");

				segmentData = {
					type: segmentTypes.PARAM,
					name: match[1],
					expression: expr,
				};
			} else if (patterns[segmentTypes.EXPR].test(segment)) {
				segmentData = {
					type: segmentTypes.EXPR,
					expression: new RegExp(patterns[segmentTypes.EXPR].exec(segment)[1], flags),
				};
			} else if (patterns[segmentTypes.UNI_CHARACTER].test(segment)) {
				const match = patterns[segmentTypes.UNI_CHARACTER].exec(segment);

				segmentData = {
					type: segmentTypes.UNI_CHARACTER,
					expression: new RegExp("^" + match[0].replace(/\?/g, PATH_SYMBOL) + "$", flags),
				};
			} else if (patterns[segmentTypes.UNI_SEGMENT].test(segment)) {
				const match = patterns[segmentTypes.UNI_SEGMENT].exec(segment);

				segmentData = {
					type: segmentTypes.UNI_SEGMENT,
					startSegmentExpr: new RegExp("^" + match[1], flags),
					endSegmentExpr: new RegExp(match[2] + "$", flags),
				};
			} else {
				throw new Error("Wrong path segment " + segment);
			}

			processedPath.push(segmentData);
		}

		return processedPath;
	}

	_getRegExpFags() {
		let flags = "";

		if (!this.options.sensitive) {
			flags += "i";
		}

		return flags;
	}

	merge(other) {
		if (!(other instanceof Rule)) {
			throw new TypeError("Expected another Rule, got " + other);
		}

		for (const [method, handlers] of Object.entries(other._handlers)) {
			for (const handler of handlers) {
				this._addToMethod(method, handler);
			}
		}
	}
}

module.exports = Rule;
