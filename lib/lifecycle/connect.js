var soap = require('soap'),
	path = require('path');

/**
 * Creates a client for communicating with the SOAP Endpoint.
 * @param next
 */
exports.connect = function (next) {
	var self = this;

	var uri = this.config.soapWSDL;
	if (!/^https?/.test(uri)) {
		uri = path.resolve(uri);
	}
	soap.createClient(uri, {
		ignoredNamespaces: {
			namespaces: ['targetNamespace', 'typedNamespace'],
			override: true
		}
	}, function parseClient(err, client) {
		if (err) {
			return next(err);
		}

		self.client = client;
		next();
	});
};
