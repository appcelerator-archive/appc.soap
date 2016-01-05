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
			Model._hasOwnFields = false;
			self.logger.trace('┏');
			self.logger.trace('┃ ' + this.name + '/' + modelName);

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
							handleResponse: self.config.handleResponse,
							xmlOptions: self.config.xmlOptions
						};

					if (!Model[name] && name !== 'get') {
						reversibleBind(Model, name, self.execute, executionContext);
						reversibleBind(Model, name + 'API', self.describe, executionContext);
						self.logger.trace('┣ .' + name + '([data, ]cb);');
					} else {
						reversibleBind(Model, name + verb.suffix, self.execute, executionContext);
						reversibleBind(Model, name + verb.suffix + 'API', self.describe, executionContext);
						self.logger.trace('┣ .' + name + verb.suffix + '([data, ]cb);');
					}
				}
			}

			models[this.name + '/' + modelName] = Model;
			self.logger.trace('┗');
		}
	}

	self.models = _.defaults(self.models || {}, models);
};

/**
 * Binds a method to a particular context in a way that we can reverse later. This is useful when we want
 * to unbind and rebind a method during inheritance.
 * @param obj
 * @param key
 * @param method
 * @param context
 */
function reversibleBind(obj, key, method, context) {
	var boundMethod = method.bind(context);
	boundMethod.__method = method;
	boundMethod.__context = context;
	obj[key] = boundMethod;

}

/**
 * Looks at the provided verb definition to figure out what fields it is expecting. If the verb does not have an
 * "output" that was found in the schema, then we don't know enough to figure out the fields.
 * @param fields
 * @param verb
 */
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
		return key.indexOf('target') >= 0;
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
			} else {
				fields[key] = {type: Object};
			}
		}
	}
}
