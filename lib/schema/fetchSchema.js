var _ = require('lodash'),
	Arrow = require('arrow');

/**
 * Fetches the schema for your connector.
 *
 * For example, your schema could look something like this:
 * {
 *     objects: {
 *         person: {
 *             first_name: {
 *                 type: 'string',
 *                 required: true
 *             },
 *             last_name: {
 *                 type: 'string',
 *                 required: false
 *             },
 *             age: {
 *                 type: 'number',
 *                 required: false
 *             }
 *         }
 *     }
 * }
 *
 * @param next
 * @returns {*}
 */
exports.fetchSchema = function (next) {
	// If we already have the schema, just return it.
	var self = this;
	if (this.schema) {
		return next(null, this.schema);
	}

	var messages = this.client.wsdl.definitions.messages,
		schema = {};

	for (var key in this.client) {
		if (this.client.hasOwnProperty(key) && key !== 'wsdl') {
			discoverModels(key, this.client, this.client[key]);
		}
	}

	return next(null, schema);

	/**
	 * Looks through the provided object to find models or methods.
	 * @param key
	 * @param context
	 * @param child
	 */
	function discoverModels(key, context, child) {
		if (_.isFunction(child)) {
			var split = key.split('/'),
				modelName = split.length > 1 ? split.slice(0, -1).join('/') : 'Global',
				methodName = split.pop();

			if (!schema[modelName]) {
				schema[modelName] = {};
			}
			var method = {
				context: context,
				func: child,
				params: {}
			};

			method.verbs = {};

			if (!checkVerb(method, methodName, 'Request', 'GET') && !checkVerb(methodName, 'HttpGet', 'GET')) {
				checkVerb(method, methodName, 'Soap', 'GET');
			}
			checkVerb(method, methodName, 'HttpPost', 'POST');
			checkVerb(method, methodName, 'HttpPut', 'PUT');
			checkVerb(method, methodName, 'HttpDelete', 'DELETE');

			if (_.keys(method.verbs).length > 0) {
				schema[modelName][methodName] = method;
			}
		} else if (_.isObject(child)) {
			for (var childKey in child) {
				if (child.hasOwnProperty(childKey)) {
					discoverModels(key + '/' + childKey, child, child[childKey]);
				}
			}
		} else {
			// self.logger.trace('Ignoring ' + child);
		}
	}

	/**
	 * Looks to see if we have a matching message for the specified suffix and verb.
	 * @param method
	 * @param methodName
	 * @param suffix
	 * @param verb
	 * @returns {*}
	 */
	function checkVerb(method, methodName, suffix, verb) {
		if (!messages[methodName + suffix + 'In'] && !messages[methodName + suffix]) {
			return false;
		}
		var retVal = {
			suffix: suffix,
			verb: verb
		};

		retVal.input = lookForParts(methodName + suffix + 'In', methodName + 'Request', methodName + suffix, methodName);
		retVal.output = lookForParts(methodName + 'Response', methodName + suffix + 'Out');
		method.verbs[suffix] = retVal;
		return retVal;
	}

	/**
	 * Flexibly looks for message that match the provided keys.
	 * @returns {*}
	 */
	function lookForParts() {
		var bestParts;
		for (var i = 0; i < arguments.length; i++) {
			var key = arguments[i];
			if (!messages[key]) {
				continue;
			}
			var parts = messages[key].parts;
			if (parts) {
				if (!bestParts || _.keys(parts).length > _.keys(bestParts).length) {
					bestParts = parts;
				}
			}
		}
		return bestParts;
	}

};
