var should = require('should'),
	Arrow = require('arrow'),
	server = new Arrow(),
	connector = server.getConnector('appc.soap');

exports.Arrow = Arrow;
exports.server = server;
exports.connector = connector;
