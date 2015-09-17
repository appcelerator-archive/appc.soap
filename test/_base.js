var should = require('should'),
	Arrow = require('arrow'),
	server = new Arrow({
		connectors: {
			'appc.labs.soap': {
				soapWSDL: 'http://wsf.cdyne.com/WeatherWS/Weather.asmx?WSDL',
				generateModelsFromSchema: true,
				modelAutogen: true,
				handleResponse: function (result, next) {
					if (result.Success === false) {
						next(result.ResponseText);
					}
					else {
						next(null, result);
					}
				}
			},
			'screenshots.wsdl': {
				connector: 'appc.labs.soap',
				soapWSDL: 'http://api.thumbnail.ws/soap?wsdl',
				generateModelsFromSchema: true,
				modelAutogen: true,
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
	}),
	connector = server.getConnector('appc.labs.soap'),
	connectorScreenshots = server.getConnector('screenshots.wsdl');

exports.Arrow = Arrow;
exports.server = server;
exports.connector = connector;
exports.connectorScreenshots = connectorScreenshots;
