var verbToParamType = {
	GET: 'query',
	POST: 'body',
	PUT: 'body',
	DELETE: 'query'
};

exports.describe = function describe() {
	var path = './' + this.methodName,
		params = {};

	for (var inputName in this.input) {
		if (this.input.hasOwnProperty(inputName)) {
			params[inputName] = {
				type: verbToParamType[this.verb], description: inputName,
				required: true, optional: false
			};
		}
	}

	return {
		generated: true,
		uiSort: path.length,
		description: this.method.meta && this.method.meta.summary || this.methodName,
		path: path,
		actionGroup: this.methodName,
		method: this.verb,
		parameters: params,
		dependsOnAll: ['execute'],
		enabled: true,
		action: function describedAction(req, resp, next) {
			try {
				resp.stream(this.model[this.methodName], req.params, next);
			}
			catch (E) {
				return next(E);
			}
		}.bind(this)
	};
};