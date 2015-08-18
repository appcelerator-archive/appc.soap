module.exports = {
	connectors: {
		'appc.soap': {
			// The URL to your Soap WSDL.
			soapWSDL: '',

			// Create models based on the WSDL that can be used in your API.
			generateModelsFromSchema: true,

			// Whether or not to generate APIs based on the methods in generated models. 
			modelAutogen: false,

			/**
			 * Detect if the response is an error, or a successful response.
			 */
			handleResponse: function (result, next) {
				if (result.Success === false) {
					next(result.ResponseText);
				}
				else {
					next(null, result);
				}
			}
		}
	}
};