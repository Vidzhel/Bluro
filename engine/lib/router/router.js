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
	 * @param {string|string[]} methods - HTTP methods
	 * @param {string} mountingPath - if an existing mounting point is specified rules will be merged
	 * @param {Function} handlers
	 * @param {obj} options
	 */
	defineRule(methods, mountingPath, handlers, options) {
		const rule = new Rule(methods, mountingPath, handlers, options);
		const rules = this._rulesStack["rules"];

		const entry = this._getMountingPathHandler(rules, mountingPath);
		// If rule for the path is already exist, merge them
		if (entry) {
			rules[entry.index].merge(rule);
		} else {
			rules.push(rule);
		}
		this._rulesStack["rules"] = rules.sort(this._comparer());

		return this;
	}

	/**
	 *
	 * @param {string|string[]} methods - HTTP methods
	 * @param {string} mountingPath - if an existing mounting point is specified, the previous handler will be overwritten
	 * @param {Function} handler
	 * @param {object} options - additional props that will be passed to route
	 * controller, will be overwritten by the data that is filled by rules
	 */
	defineRoute(methods, mountingPath, handler, options) {
		const route = new Route(methods, mountingPath, handler, options);
		const routes = this._rulesStack["routes"];

		const entry = this._getMountingPathHandler(routes, mountingPath);

		// If rule for the path is already exist, override it
		if (entry) {
			routes[entry.index] = route;
		} else {
			routes.push(route);
		}
		this._rulesStack["routes"] = routes.sort(this._comparer(false));

		return this;
	}

	addRule(rule) {
		if (!(rule instanceof Rule)) {
			throw new TypeError("Expected Rule, got " + rule);
		}

		const mountingPath = rule.mountingPath;
		const rules = this._rulesStack["rules"];

		const entry = this._getMountingPathHandler(rules, mountingPath);
		// If rule for the path is already exist, merge them
		if (entry) {
			routes[entry.index].merge(rule);
		} else {
			rules.push(rule);
		}
		this._rulesStack["rules"] = rules.sort(this._comparer());

		return this;
	}

	addRote(route) {
		if (!(rule instanceof Route)) {
			throw new TypeError("Expected Route, got " + rule);
		}
		const mountingPath = route.mountingPath;
		const routes = this._rulesStack["routes"];

		const entry = this._getMountingPathHandler(routes, mountingPath);

		// If rule for the path is already exist, override it
		if (entry) {
			routes[entry.index] = route;
		} else {
			routes.push(route);
		}
		this._rulesStack["routes"] = routes.sort(this._comparer(false));

		return this;
	}

	_getMountingPathHandler(dict, path) {
		for (const [key, val] of Object.entries(dict)) {
			if (val.mountingPath === path) {
				return { index: key, val };
			}
		}

		return null;
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

	dispatch(req, res) {
		const pathSegments = utilities.splitPath(req.url);
		const method = req.method;
		const rules = this._rulesStack["rules"];
		const routes = this._rulesStack["routes"];
		// data that will be passed to a route handler
		const data = {};
		let error;

		// Iterate over all matching the path length rules and dispatch the rules that are match
		// rules are sorted by ascending
		for (const rule of rules) {
			if (rule.match(method, pathSegments)) {
				if (error) {
					rule.dispatch(error, req, res, data);
					error = null;
				}

				try {
					rule.dispatch(null, req, res, data);
				} catch (err) {
					error = err;
				}
			}
		}

		// Iterate over all rotes from the longest one to the shortest and
		// find that is match
		// the routes are sorted by descending
		for (const route of routes) {
			if (route.match(method, pathSegments)) {
				route.dispatch(req, res, data);
				break;
			}
		}
	}
}

// Default Rules

module.exports = RulesDispatcher;
