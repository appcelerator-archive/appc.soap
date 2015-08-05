var _ = require('lodash'),
	Arrow = require('arrow');

/**
 * Executes SOAP Methods.
 */
exports.execute = function execute() {
	var data = arguments[0],
		self = this,
		callback = arguments[arguments.length - 1],
		method = this.method,
		context = this.context,
		Model = this.model;

	if (!_.isFunction(callback)) {
		throw new TypeError('The last argument to ' + this.methodName + ' must be a callback function.');
	}

	method.apply(context, arguments.length === 1 ? [handler] : [data, handler]);

	function handler(err, result) {
		if (err) { return callback(err); }
		if (!result) { return callback(); }

		if (self.output) {
			var schemaKey = _.keys(self.output)[0],
				mainSchema = self.output[schemaKey];

			result = result[schemaKey];

			var primaryResults = _.keys(mainSchema).filter(function (key) {
				return key.indexOf('target') !== 0;
			});
			if (primaryResults && primaryResults.length === 1) {
				mainSchema = mainSchema[primaryResults[0]];
				if (primaryResults[0].slice(-2) === '[]') {
					result = result[primaryResults[0].slice(0, -2)];
				}
				else {
					result = result[primaryResults[0]];
				}
			}

			// Infer fields based on schema.
			if (Model._hasOwnFields === false || Object.keys(Model.fields).length === 0) {
				Model._hasOwnFields = false;
				for (var key in mainSchema) {
					if (mainSchema.hasOwnProperty(key) && key.indexOf('target') !== 0) {
						var type = mainSchema[key];
						if (_.isString(type)) {
							type = type.split(':').pop();
							if (type === 'short' || type === 'int' || type === 'long') {
								type = Number;
							}
							Model.fields[key] = {type: type};
						}
						else {
							Model.fields[key] = {type: Object};
						}
					}
				}
			}
		}

		self.handleResponse(result, function (err, result) {
			if (err) { return callback(err); }
			if (!result) { return callback(); }

			if (_.isArray(result)) {
				var array = result.map(createInstance);
				result = new Arrow.Collection(Model, array);
			}
			else {
				result = createInstance(result);
			}
			callback(null, result);

			function createInstance(model) {
				// Infer fields based on data.
				if (Model._hasOwnFields === false || Object.keys(Model.fields).length === 0) {
					Model._hasOwnFields = false;
					for (var key in model) {
						if (model.hasOwnProperty(key)) {
							Model.fields[key] = {type: typeof model[key]};
						}
					}
				}
				return Model.instance(model, true);
			}
		});
	}
};
