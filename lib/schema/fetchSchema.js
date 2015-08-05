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
	if (this.metadata.schema) {
		return next(null, this.metadata.schema);
	}

	var schema = {},
		wsdl = this.client.wsdl,
		messages = wsdl.definitions.messages;

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

			method.input = (messages[methodName] || messages[methodName + 'In'] || {}).parts;
			method.output = (messages[methodName + 'Response'] || messages[methodName + 'Out'] || {}).parts;

			schema[modelName][methodName] = method;
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
