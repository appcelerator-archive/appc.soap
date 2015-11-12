var parseString = require('xml2js').parseString;

module.exports = {
	logs: './logs',
	quiet: false,
	logLevel: 'error',
	apikey: '7OconkD1qE64SKasb3jt2MIgJZih5Th1',
	admin: {
		enabled: true,
		prefix: '/arrow'
	},
	session: {
		encryptionAlgorithm: 'aes256',
		encryptionKey: 'VDqTueB3Ab4vebhpAPlBn7ZmdsUu/lfVzJ3te1Vt5sU=',
		signatureAlgorithm: 'sha512-drop256',
		signatureKey: 'j0F7YqoUJRxLQUdOeEQ7cGhBAh/J+9rwdn/6jNfEcphIisRpMIJS8blKyOAmX42uX8Xo0f2jaURpgTUhY+vUBw==',
		secret: 'SCsOXXkFwNcJv8aWHNsTRCF4T/NmXJjy', // should be a large unguessable string
		duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
		activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
	},
	connectors: {
		'appc.labs.soap': {
			// The URL to your Soap WSDL.
			soapWSDL: 'http://wsf.cdyne.com/WeatherWS/Weather.asmx?WSDL',

			// Create models based on the WSDL that can be used in your API.
			generateModelsFromSchema: true,
			// Whether or not to generate APIs based on the methods in generated models. 
			modelAutogen: true
		},
		'screenshots.wsdl': {
			connector: 'appc.labs.soap',

			// The URL to your Soap WSDL.
			soapWSDL: 'http://api.thumbnail.ws/soap?wsdl',

			// Create models based on the WSDL that can be used in your API.
			generateModelsFromSchema: true,
			// Whether or not to generate APIs based on the methods in generated models. 
			modelAutogen: true
		},
		'stocks.wsdl': {
			connector: 'appc.labs.soap',

			// The URL to your Soap WSDL.
			soapWSDL: 'http://www.webservicex.com/stockquote.asmx?WSDL',

			// Create models based on the WSDL that can be used in your API.
			generateModelsFromSchema: true,
			// Whether or not to generate APIs based on the methods in generated models. 
			modelAutogen: true
		},
		'stocks.file.wsdl': {
			connector: 'appc.labs.soap',

			// The URL to your Soap WSDL.
			soapWSDL: './conf/stockquote.wsdl',

			// Create models based on the WSDL that can be used in your API.
			generateModelsFromSchema: true,
			// Whether or not to generate APIs based on the methods in generated models. 
			modelAutogen: true,

			// Make the stocks a bit more palatable.
			handleResponse: function (result, next) {
				require('xml2js').parseString(result, {explicitArray: false}, function (err, result) {
					if (err) {
						next(err);
					} else {
						next(null, result.StockQuotes.Stock);
					}
				});
			}
		}
	}
};
