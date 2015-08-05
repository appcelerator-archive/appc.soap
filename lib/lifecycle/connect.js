var soap = require('soap');

/**
 * Creates a client for communicating with the SOAP Endpoint.
 * @param next
 */
exports.connect = function (next) {
	var self = this;

	soap.createClient(this.config.soapWSDL, function parseClient(err, client) {
		if (err) {
			return next(err);
		}

		self.client = client;
		next();
	});
};
