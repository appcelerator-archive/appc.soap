module.exports = {
	connectors: {
		'appc.labs.soap': {
			// The URL to your Soap WSDL.
			soapWSDL: '',

			// Create models based on the WSDL that can be used in your API.
			generateModelsFromSchema: true,

			// Whether or not to generate APIs based on the methods in generated models. 
			modelAutogen: false
		}
	}
};