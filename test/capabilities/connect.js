exports.connect = {
	goodConfig: {
		soapWSDL: 'http://wsf.cdyne.com/WeatherWS/Weather.asmx?WSDL',
		generateModelsFromSchema: true,
		modelAutogen: true,

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
	},
	badConfig: {
		soapWSDL: 'http://google.com/'
	}
};
