"use strict";

/**
 * Implements Dependency Injection  by setting dependency as a property of a dependent class
 */
class DependencyResolver {
	static _registeredDependencies = new Map();
	dependencies = [];

	/**
	 * Registers callee (this) type as a dependency
	 *
	 * @param {string} name - name of a dependency (define another way to get dependency)
	 * @param {boolean} singleton - if true, all dependent objects will get only one instance of a dependency
	 */
	static registerDependency(singleton = false, name = null) {
		if (Object.is(this, DependencyResolver)) {
			throw new Error("DependencyResolver can't be registered as dependency");
		}
		if (!(this.prototype instanceof DependencyResolver)) {
			throw new Error(
				"Dependency that is being registered has to be a subclass of DependencyResolver"
			);
		}
		if (this.isRegisteredDependency(this, name)) {
			throw new Error("The dependency's already been registered");
		}

		name = !name ? this.name : name;

		const key = { name, type: this };
		let value;

		if (singleton) {
			value = new this();
		} else {
			value = this;
		}

		const dep = {
			value: value,
			isSingleton: singleton,
		};

		DependencyResolver._registeredDependencies.set(key, dep);
	}

	static isRegisteredDependency(type = null, name = null) {
		for (const [key, value] of DependencyResolver._registeredDependencies) {
			if (
				key.name === name &&
				typeof type === "function" &&
				DependencyResolver._isSubclassOrTheClass(key.type, type)
			) {
				return true;
			} else if (
				key.name === name ||
				(typeof type === "function" &&
					DependencyResolver._isSubclassOrTheClass(key.type, type))
			) {
				if (type === null || name === null) {
					return true;
				}
			}
		}

		return false;
	}

	isRegisteredDependency(type, name = null) {
		return DependencyResolver.isRegisteredDependency(type, name);
	}

	/**
	 * Searches a registered dependency with the given name or type or both
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
		if (type && !(type.prototype instanceof DependencyResolver)) {
			throw new Error("A required type has to be a subclass of the DependencyResolver");
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
		return base.prototype instanceof superClass || Object.is(base, superClass);
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
					value: new data.value(),
				});
			}
		}
	}
}

module.exports = DependencyResolver;
// class Service1 extends DependencyResolver {
// 	doSomething() {
// 		console.log("Service1");
// 	}
// }
// Service1.registerDependency(false, "service");

// class Service2 extends DependencyResolver {
// 	constructor() {
// 		super();
// 		this.counter = 0;
// 	}

// 	doSomething() {
// 		console.log("Service2 " + this.counter);
// 		this.counter++;
// 	}
// }
// Service2.registerDependency(false, "service");

// class Service3 extends Service2 {
// 	doSomething() {
// 		console.log("Service3");
// 	}
// }
// Service3.registerDependency(false, "service2");

// class Client extends DependencyResolver {
// 	constructor() {
// 		super();
// 		this.requireDependency(Service2, "service2", "service");
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