var Arrow = require('arrow'),
	_ = require('lodash');

/**
 * Creates models from your schema (see "fetchSchema" for more information on the schema).
 */
exports.createModelsFromSchema = function () {
	var self = this,
		models = {},
		wsdl = this.config.soapWSDL,
		schema = this.schema;

	for (var modelName in schema) {
		if (schema.hasOwnProperty(modelName)) {
			var methodNames = _.keys(schema[modelName]);
			if (methodNames.length === 0) {
				continue;
			}

			var fields = {},
				verbs;

			for (var i = 0; i < methodNames.length; i++) {
				verbs = _.values(schema[modelName][methodNames[i]].verbs);
				for (var j = 0; j < verbs.length; j++) {
					defineFields(fields, verbs[j]);
				}
			}
			
			var Model = Arrow.Model.extend(this.name + '/' + modelName, {
				generated: true,
				name: this.name + '/' + modelName,
				connector: self,
				autogen: self.config.modelAutogen,
				actions: Object.keys(schema[modelName]),
				fields: fields
			});

			for (var k = 0; k < methodNames.length; k++) {
				var name = methodNames[k],
					method = schema[modelName][name];
				verbs = _.values(method.verbs);

				for (var l = 0; l < verbs.length; l++) {
					var verb = verbs[l],
						executionContext = {
							model: Model,
							connector: self,
							methodName: name,
							method: method.func,
							verb: verb.verb,
							input: verb.input,
							output: verb.output,
							context: method.context,
							handleResponse: self.config.handleResponse
						};

					if (!Model[name] && name !== 'get') {
						Model[name] = self.execute.bind(executionContext);
						Model[name + 'API'] = self.describe.bind(executionContext);
					}
					else {
						Model[name + verb.suffix] = self.execute.bind(executionContext);
						Model[name + verb.suffix + 'API'] = self.describe.bind(executionContext);
					}
				}
			}

			models[this.name + '/' + modelName] = Model;
		}
	}

	self.models = _.defaults(self.models || {}, models);
};

function defineFields(fields, verb) {
	var output = verb.output;
	if (!output) {
		return;
	}

	var outputKeys = _.keys(output),
		mainSchema = output;

	if (outputKeys.length === 1) {
		var schemaKey = outputKeys[0];
		if (_.isObject(output[schemaKey])) {
			mainSchema = output[schemaKey];
		}
	}

	var primaryResults = _.keys(mainSchema).filter(function (key) {
		return key.indexOf('target') !== 0;
	});
	if (primaryResults && primaryResults.length === 1) {
		mainSchema = mainSchema[primaryResults[0]];
	}

	// Infer fields based on schema.
	for (var key in mainSchema) {
		if (mainSchema.hasOwnProperty(key) && key.indexOf('target') !== 0 && fields[key] === undefined) {
			var type = mainSchema[key];
			if (_.isString(type)) {
				type = type.split(':').pop();
				if (type === 'short' || type === 'int' || type === 'long') {
					type = Number;
				}
				fields[key] = {type: type};
			}
			else {
				fields[key] = {type: Object};
			}
		}
	}
}
