var _ = require('lodash'),
  xml2js = require('xml2js'),
  Arrow = require('arrow')

/**
 * Executes SOAP Methods.
 */
exports.execute = function execute () {
  var data = arguments[0],
    self = this,
    callback = arguments[arguments.length - 1],
    method = this.method,
    context = this.context,
    Model = this.childModel || this.model,
    options = {}

  if (!_.isFunction(callback)) {
    throw new TypeError('The last argument to ' + this.methodName + ' must be a callback function.')
  }

	// Set api request timeout option
  if (this.connector.config && typeof this.connector.config.connectionTimeout !== 'undefined') {
    options.timeout = this.connector.config.connectionTimeout
  }
  if (arguments.length > 1 && data && Object.keys(data).length === 0) {
    data = null
  }
  method.apply(context, arguments.length === 1 ? [null, handler, options] : [data, handler, options])

	/**
	 * Handles a method being called.
	 */
  function handler (err, result) {
    if (err) {
      if (err.body && err.body.indexOf('<faultstring>') >= 0) {
        err = err.body.split('<faultstring>').pop().split('</faultstring>')[0]
      }
      return callback(err.body || err)
    }
    if (!result) { return callback() }

    if (self.output) {
      var outputKeys = _.keys(self.output),
        mainSchema = self.output

      if (outputKeys.length === 1) {
        var schemaKey = outputKeys[0]
        if (_.isObject(self.output[schemaKey])) {
          mainSchema = self.output[schemaKey]
          result = result[schemaKey]
        }
      }

      var primaryResults = _.keys(mainSchema).filter(function (key) {
        return key.indexOf('target') !== 0
      })
      if (primaryResults && primaryResults.length === 1) {
        mainSchema = mainSchema[primaryResults[0]]
        if (primaryResults[0].slice(-2) === '[]') {
          result = result[primaryResults[0].slice(0, -2)]
        } else {
          result = result[primaryResults[0]]
        }
      }

			// Infer fields based on schema.
      if (_.isObject(mainSchema) && Model._hasOwnFields === false || Object.keys(Model.fields).length === 0) {
        Model._hasOwnFields = false
        for (var key in mainSchema) {
          if (mainSchema.hasOwnProperty(key) && key.indexOf('target') !== 0) {
            var type = mainSchema[key]
            if (_.isString(type)) {
              type = type.split(':').pop()
              if (type === 'short' || type === 'int' || type === 'long') {
                type = Number
              }
              Model.fields[key] = {type: type}
            } else {
              Model.fields[key] = {type: Object}
            }
          }
        }
      }
    }

    if (result === 'exception') {
      return callback(result)
    }

    if (self.handleResponse) {
      self.handleResponse(result, handledResponse)
    } else {
      if (typeof result === 'string' && result.indexOf('<') >= 0 && result.indexOf('>') >= 0) {
        xml2js.parseString(result, self.xmlOptions || {explicitArray: false}, handledResponse)
      } else if (result.Success === false) {
        handledResponse(result.ResponseText)
      } else {
        handledResponse(null, result)
      }
    }

		/**
		 * Handles a response from the server, creating the proper Arrow objects.
		 */
    function handledResponse (err, result) {
      if (err) { return callback(err) }
      if (!result) { return callback() }

      if (typeof result === 'string') {
        return callback(null, result)
      } else if (_.isArray(result)) {
        var array = result.map(createInstance)
        result = new Arrow.Collection(Model, array)
      } else {
        result = createInstance(result)
      }
      callback(null, result)

			/**
			 * Creates an instance from the provided result.
			 * @param result
			 */
      function createInstance (result) {
				// Infer fields based on data.
        var definedFields = Object.keys(Model.fields),
          resultFields = Object.keys(result),
          noDefinedFields = definedFields.length === 0,
          noMatchingFields = resultFields.filter(function (name) {
            return Model.fields[name] || _.findKey(Model.fields, {name: name})
          }).length === 0
        if (Model._hasOwnFields === false || noDefinedFields || noMatchingFields) {
          Model._hasOwnFields = false
          for (var key in result) {
            if (result.hasOwnProperty(key)) {
              Model.fields[key] = {type: typeof result[key]}
            }
          }
        }
        return Model.instance(result, true)
      }
    }
  }
}
