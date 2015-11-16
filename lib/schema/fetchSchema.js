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

			var checkVerb = function (suffix, verb) {
				if (!messages[methodName + suffix + 'In']) {
					return false;
				}
				var retVal = {
					suffix: suffix,
					verb: verb
				};

				var lookForParts = function () {
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
				};

				retVal.input = lookForParts(methodName + suffix + 'In', methodName + 'Request', methodName);
				retVal.output = lookForParts(methodName + 'Response', methodName + suffix + 'Out');
				if (!retVal.input || !retVal.output) {
					return false;
				}
				method.verbs[suffix] = retVal;
				return retVal;
			};

			if (!checkVerb('HttpGet', 'GET')) {
				checkVerb('Soap', 'GET');
			}
			checkVerb('HttpPost', 'POST');
			checkVerb('HttpPut', 'PUT');
			checkVerb('HttpDelete', 'DELETE');

			if (_.keys(method.verbs).length > 0) {
				schema[modelName][methodName] = method;
			}
		}
		else if (_.isObject(child)) {
			for (var childKey in child) {
				if (child.hasOwnProperty(childKey)) {
					discoverModels(key + '/' + childKey, child, child[childKey]);
				}
			}
		}
		else {
			// self.logger.trace('Ignoring ' + child);
		}
	}
};
