/*
 Welcome to the SOAP connector!
 */
var _ = require('lodash'),
	semver = require('semver');

/**
 * Creates the SOAP connector for Arrow.
 */
exports.create = function (Arrow) {
	if (semver.lt(Arrow.Version || '0.0.1', '1.2.53')) {
		throw new Error('This connector requires at least version 1.2.53 of Arrow; please run `appc use latest`.');
	}
	var Connector = Arrow.Connector,
		Capabilities = Connector.Capabilities;

	return Connector.extend({
		filename: module.filename,
		capabilities: [
			Capabilities.ConnectsToADataSource,
			Capabilities.GeneratesModels,
			Capabilities.ValidatesConfiguration
		]
	});
};
