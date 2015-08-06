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
			var methodNames = _.keys(schema[modelName]);
			if (methodNames.length === 0) {
				continue;
			}

			var Model = Arrow.Model.extend(modelName, {
				generated: true,
				name: modelName,
				connector: self,
				methods: schema[modelName],
				autogen: self.config.modelAutogen,
				actions: Object.keys(schema[modelName]),
				fields: {}
			});

			for (var i = 0; i < methodNames.length; i++) {
				var name = methodNames[i],
					method = Model.methods[name];
				for (var j = 0; j < method.verbs.length; j++) {
					var verb = method.verbs[j],
						executionContext = {
							model: Model,
							connector: self,
							methodName: name,
							method: method.func,
							verb: verb,
							input: method.input,
							output: method.output,
							context: method.context,
							handleResponse: self.config.handleResponse
						};
					if (!Model[name]) {
						Model[name] = self.execute.bind(executionContext);
						Model[name + 'API'] = self.describe.bind(executionContext);
					}
					else {
						Model[name + verb] = self.execute.bind(executionContext);
						Model[name + verb + 'API'] = self.describe.bind(executionContext);
					}
				}
			}

			models[modelName] = Model;
		}
	}

	self.models = _.defaults(self.models || {}, models);
};
