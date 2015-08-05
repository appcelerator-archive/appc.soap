exports.describe = function describe() {
	var path = './' + this.methodName,
		params = {};

	for (var inputName in this.input) {
		if (this.input.hasOwnProperty(inputName)) {
			// TODO: What about other input types when not using GET?
			params[inputName] = {
				type: 'query', description: inputName,
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
		method: 'GET', // TODO: Need to determine proper method verb.
		parameters: params,
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
