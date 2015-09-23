/*
 Welcome to your new connector!
 TODO: First things first, look at the "capabilities" array TODOs down below.
 */
var _ = require('lodash'),
	semver = require('semver');

/**
 * Creates your connector for Arrow.
 */
exports.create = function (Arrow) {
	if (semver.lt(Arrow.Version || '0.0.1', '1.2.53')) {
		throw new Error('This connector requires a greater version of Arrow; please run `appc use latest`.');
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
