var Arrow = require('arrow'),
	_ = require('lodash');

/**
 * Creates models from your schema (see "fetchSchema" for more information on the schema).
 */
exports.createModelsFromSchema = function () {
	var self = this,
		models = {},
		schema = this.schema;

	for (var modelName in schema) {
		if (schema.hasOwnProperty(modelName)) {
			var Model = Arrow.Model.extend(modelName, {
				generated: true,
				name: modelName,
				connector: self,
				methods: schema[modelName],
				autogen: self.config.modelAutogen,
				actions: Object.keys(schema[modelName]),
				fields: {}
			});

			var methods = _.keys(Model.methods);
			for (var i = 0; i < methods.length; i++) {
				var name = methods[i],
					method = Model.methods[name],
					executionContext = {
						model: Model,
						connector: self,
						methodName: name,
						method: method.func,
						input: method.input,
						output: method.output,
						context: method.context,
						handleResponse: self.config.handleResponse
					};
				Model[name] = self.execute.bind(executionContext);
				Model[name + 'API'] = self.describe.bind(executionContext);
			}

			models[modelName] = Model;
		}
	}

	self.models = _.defaults(self.models || {}, models);
};
