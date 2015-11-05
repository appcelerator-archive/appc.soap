exports.connect = {
	goodConfig: {
		soapWSDL: 'http://wsf.cdyne.com/WeatherWS/Weather.asmx?WSDL',
		generateModelsFromSchema: true,
		modelAutogen: true
	},
	badConfig: {
		soapWSDL: 'http://google.com/'
	}
};
