var should = require('should'),
  Arrow = require('arrow'),
  server = new Arrow(),
  connector = server.getConnector('appc.labs.soap'),
  connectorScreenshots = server.getConnector('screenshots.wsdl')

exports.Arrow = Arrow
exports.server = server
exports.connector = connector
exports.connectorScreenshots = connectorScreenshots
