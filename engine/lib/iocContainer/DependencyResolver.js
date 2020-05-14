"use strict";

/**
 * Implements Dependency Injection  by setting dependency as a property of a dependent class
 */
class DependencyResolver {
	static _registeredDependencies = new Map();
	dependencies = [];

	/**
	 * If the registered dependency is a singleton an instance of it will be returned
	 * @param {object} configs - config object
	 * @param {Function} configs.dependency - constructor of the dependency
	 * @param {string?} configs.name - name of a dependency (define another way to get dependency)
	 * @param {string?} configs.setAsGlobal - if true than the dependency will be set as a global
	 *     variable as vel as registered as dependency
	 * @param {boolean?} configs.singleton - if true, all dependent objects will get only one
	 *     instance of a dependency
	 * @param {...any} args - arguments that will be passed to the dependency constructor
	 * @returns {object}
	 */
	static registerDependency(configs, ...args) {
		let { dependency, singleton = false, setAsGlobal = false, name = null } = configs;

		if (Object.is(dependency, DependencyResolver)) {
			throw new Error("DependencyResolver can't be registered as dependency");
		}
		if (DependencyResolver.isRegisteredDependency(dependency, name)) {
			throw new Error("The dependency's already been registered");
		}
		if (setAsGlobal && singleton !== setAsGlobal) {
			throw new Error("Global variable have to be singleton");
		}

		name = !name ? dependency.name : name;

		const key = { name, type: dependency };
		let value;

		if (singleton) {
			value = new dependency(...args);

			if (setAsGlobal) {
				this.registerGlobalDependency(value, name);
			}
		} else {
			value = dependency;
		}

		const dep = {
			value: value,
			isSingleton: singleton,
			args,
		};

		DependencyResolver._registeredDependencies.set(key, dep);
		if (singleton) {
			return value;
		}
	}

	/**
	 * if the registered dependency is a singleton an instance of it will be returned
	 * @param {object} configs - config object
	 * @param {Function} configs.dependency - type to register
	 * @param {string?} configs.name - name of a dependency (define another way to get dependency)
	 * @param {string?} configs.setAsGlobal - if true than the dependency will be set as a global
	 *     variable as vel as registered as dependency
	 */
	static registerType(configs) {
		let { dependency, setAsGlobal = false, name = null } = configs;

		if (Object.is(dependency, DependencyResolver)) {
			throw new Error("DependencyResolver can't be registered as dependency");
		}
		if (DependencyResolver.isRegisteredDependency(dependency, name)) {
			throw new Error("The dependency's already been registered");
		}

		name = !name ? dependency.name : name;

		const key = { name, type: null };

		if (setAsGlobal) {
			DependencyResolver.registerGlobalDependency(dependency, name);
		}
		const dep = {
			value: dependency,
			singleton: true,
		};
		DependencyResolver._registeredDependencies.set(key, dep);
	}

	/**
	 * Set's a dependency as a global variable
	 * You really shouldn't do it without strong need
	 * The variable will be in memory throughout the whole app life
	 *
	 * @param {*} dependency - the dependency to be set as a variable variable
	 * @param {string} name - name of the global variable
	 */
	static registerGlobalDependency(dependency, name) {
		global[name] = dependency;
	}

	static isRegisteredDependency(type = null, name = null) {
		return !!DependencyResolver._getRegisteredDependency(type, name);
	}

	isRegisteredDependency(type, name = null) {
		return DependencyResolver.isRegisteredDependency(type, name);
	}

	/**
	 * Searches a registered dependency with the given name or type or both
	 * Type dependency you cant require only by name
	 *
	 * @returns the first dependency that matches all requirements
	 * @param {function} type - a base type or the type of the dependency to get
	 * @param {string} name - a name of the dependency
	 * @param {string} injectionName - the dependency name to set on callee object
	 */
	requireDependency(type = null, name = null, injectionName = null) {
		if (!(this instanceof DependencyResolver)) {
			throw new Error("A Callee has to be a subclass of the DependencyResolver");
		}

		const dep = DependencyResolver._getRegisteredDependency(type, name);
		if (!dep) {
			throw new Error("A required dependency doesn't exist");
		}

		let depName, depData;
		[{ name: depName }, depData] = dep;
		injectionName = injectionName || depName;

		this.dependencies.push({ type, name: injectionName, data: depData });
	}

	/**
	 * Searches a registered dependency with the given name or type or both
	 * Type dependency you cant require only by name
	 *
	 * @returns the first dependency that matches all requirements
	 * @param {function} type - a base type or the type of the dependency to get
	 * @param {string} name - a name of the dependency
	 */
	static getDependency(type = null, name = null) {
		const dep = DependencyResolver._getRegisteredDependency(type, name);
		if (!dep) {
			throw new Error("A required dependency doesn't exist");
		}

		let depName, depData;
		[{ name: depName }, depData] = dep;

		return depData.value;
	}

	static _getRegisteredDependency(type = null, name = null) {
		for (const [key, value] of DependencyResolver._registeredDependencies) {
			if (
				key.name === name &&
				typeof type === "function" &&
				DependencyResolver._isSubclassOrTheClass(key.type, type)
			) {
				return [key, value];
			} else if (
				key.name === name ||
				(typeof type === "function" &&
					DependencyResolver._isSubclassOrTheClass(key.type, type))
			) {
				if (type === null || name === null) {
					return [key, value];
				}
			}
		}

		return null;
	}

	/**
	 * Returns true if a base class is a subclass of a super class or they are the same class
	 *
	 * @param {Function} base
	 * @param {Function} superClass
	 */
	static _isSubclassOrTheClass(base, superClass) {
		if (base !== null) {
			return Object.is(base, superClass) || base.prototype instanceof superClass;
		}

		return base === superClass;
	}

	resolveDependencies() {
		if (!(this instanceof DependencyResolver)) {
			throw new Error("A callee has to be a subclass of the DependencyResolver");
		}
		const deps = this.dependencies;
		this.dependencies = [];

		for (const { name, data } of deps) {
			if (data.isSingleton) {
				Object.defineProperty(this, name, {
					value: data.value,
				});
			} else {
				Object.defineProperty(this, name, {
					value: new data.value(...data.args),
				});
			}
		}
	}
}
DependencyResolver.registerGlobalDependency(DependencyResolver, "DependencyResolver");

module.exports = DependencyResolver;
// class Service1 {
// 	doSomething() {
// 		console.log("Service1");
// 	}
// }
// DependencyResolver.registerDependency(Service1, false, "service");

// class Service2 {
// 	constructor() {
// 		this.counter = 0;
// 	}

// 	doSomething() {
// 		console.log("Service2 " + this.counter);
// 		this.counter++;
// 	}
// }
// DependencyResolver.registerDependency(Service2, false, "service");

// class Service3 extends Service2 {
// 	doSomething() {
// 		console.log("Service3");
// 	}
// }
// DependencyResolver.registerDependency(Service3, false, "service2");

// class Client extends DependencyResolver {
// 	constructor() {
// 		super();
// 		this.requireDependency(Service2, null, "service");
// 		this.resolveDependencies();
// 	}

// 	work() {
// 		this.service.doSomething();
// 	}
// }

// // Client.require

// // Client = decorator(Client, "Hello world");

// let a = new Client();
// let b = new Client();

// a.work();
// b.work();
