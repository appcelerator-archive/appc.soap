var Arrow = require('arrow'),
	_ = require('lodash');

/**
 * Wires up the built-in models and listens for any external models that
 * need to be wired up.
 */
exports.postCreate = function () {
	var self = this;

	this.on('init-model', function (Model) {

		if (!Model.connector || (Model.connector.name || Model.connector) !== self.name) {
			return;
		}

		var parent = Model;
		while (parent._parent && parent._parent.name) {
			parent = parent._parent;
		}
		if (parent && parent.name.indexOf(this.name) === 0) {
			for (var key in parent) {
				if (!parent.hasOwnProperty(key)) {
					continue;
				}
				var boundMethod = parent[key];
				if (!_.isFunction(boundMethod)) {
					continue;
				}
				var context = _.clone(boundMethod.__context);
				context.model = Model;
				Model[key] = boundMethod.__method.bind(context);
			}
		}
	});
};
