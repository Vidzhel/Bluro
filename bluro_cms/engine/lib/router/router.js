"use strict";
const Rule = require("./rule");
const Route = require("./route");
const utilities = require("./utilities");

class RulesDispatcher {
	_rulesStack = {
		rules: [],
		routes: [],
	};

	/**
	 * Creates a rule that will be given response and request methods
	 * and data object to fill (the data will be passed to a route)
	 *
	 *  NOTE: if handler specified with 4 parameters (error in the beginning) it will be defined as
	 *  error handler and won't be called except the situation when an exception was occurred in
	 *  previous rules
	 *
	 *  If Handler returns true, further rules will be ignored
	 * @param {string|string[]} methods - HTTP methods
	 * @param {string} mountingPath - if an existing mounting point is specified rules will be
	 *     merged
	 * @param {Function} handlers
	 * @param {object} options
	 */
	defineRule(methods, mountingPath, handlers, options) {
		const rule = new Rule(methods, mountingPath, handlers, options);
		const rules = this._rulesStack["rules"];

		const entry = this._getMountingPathHandler(rules, mountingPath, options);
		// If rule for the path is already exist, merge them
		if (entry) {
			rules[entry.index].merge(rule);
		} else {
			rules.push(rule);
		}
		this._rulesStack["rules"] = rules.sort(this._comparer());

		Logger.logInfo(`Rule mounted '${mountingPath}', methods: ${JSON.stringify(methods)}`, {
			prefix: "ROUTER",
		});

		return this;
	}

	/**
	 *
	 * @param {string|string[]} methods - HTTP methods
	 * @param {string} mountingPath - if an existing mounting point is specified, the previous
	 *     handler will be overwritten
	 * @param {Function} handler
	 * @param {object} options - additional props that will be passed to route
	 * controller, will be overwritten by the data that is filled by rules
	 */
	defineRoute(methods, mountingPath, handler, options) {
		const route = new Route(methods, mountingPath, handler, options);
		const routes = this._rulesStack["routes"];

		const entry = this._getMountingPathHandler(routes, mountingPath, options);

		// If rule for the path is already exist, override it
		if (entry) {
			routes[entry.index] = route;
		} else {
			routes.push(route);
		}
		this._rulesStack["routes"] = routes.sort(this._comparer(false));

		Logger.logInfo(`Route mounted '${mountingPath}', methods: ${JSON.stringify(methods)}`, {
			prefix: "ROUTER",
		});
		return this;
	}

	_getMountingPathHandler(dict, path, options) {
		for (const [key, rule] of Object.entries(dict)) {
			if (rule.mountingPath === path && this._compareObjects(rule.options, options)) {
				return { index: key, rule };
			}
		}

		return null;
	}

	_compareObjects(first, second) {
		if (!(first && second)) {
			return false;
		}
		const checked = [];

		for (const [key, val] of Object.entries(first)) {
			if (second[key] !== val) {
				return false;
			}

			checked.push(key);
		}

		for (const [key, val] of Object.entries(second)) {
			if (!checked.includes(key) && first[key] !== val) {
				return false;
			}
		}

		return true;
	}

	_comparer(ascending = true) {
		return function sortByPathLength(first_val, second_val) {
			if (first_val.length > second_val.length) {
				return ascending ? 1 : -1;
			} else if (first_val.length < second_val.length) {
				return ascending ? -1 : 1;
			}

			return 0;
		};
	}

	async dispatch(req, res) {
		const pathSegments = utilities.splitPath(req.url);
		const method = req.method;
		const rules = this._rulesStack["rules"];
		const routes = this._rulesStack["routes"];
		// data that will be passed to a route handler
		const data = {};
		let error;
		let requestHandled = false;

		// Iterate over all matching the path length rules and dispatch the rules that are match
		// rules are sorted by ascending
		for (const rule of rules) {
			if (rule.match(method, pathSegments)) {
				let preventPropagation = false;

				if (error) {
					preventPropagation = await rule.dispatch(error, req, res, data);
					error = null;
				}

				try {
					preventPropagation = await rule.dispatch(null, req, res, data);
				} catch (err) {
					error = err;
				}

				if (preventPropagation) {
					requestHandled = true;
					break;
				}
			}
		}

		// Iterate over all rotes from the longest one to the shortest and
		// find that is match
		// the routes are sorted by descending
		for (const route of routes) {
			if (route.match(method, pathSegments)) {
				requestHandled = true;
				await route.dispatch(req, res, data);
				break;
			}
		}

		if (!requestHandled) {
			res.code(res.CODES.NotFound);
			res.error("Endpoint doesn't exist");
		}
	}
}

// Default Rules

module.exports = RulesDispatcher;
