var should = require('should'),
	Arrow = require('arrow'),
	server = new Arrow({
		connectors: {
			'appc.soap': {
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
				connector: 'appc.soap',
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
	connector = server.getConnector('appc.soap'),
	connectorScreenshots = server.getConnector('screenshots.wsdl');

exports.Arrow = Arrow;
exports.server = server;
exports.connector = connector;
exports.connectorScreenshots = connectorScreenshots;
