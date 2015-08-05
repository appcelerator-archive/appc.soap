/*
 Welcome to your new connector!
 TODO: First things first, look at the "capabilities" array TODOs down below.
 */
var _ = require('lodash');

/**
 * Creates your connector for Arrow.
 */
exports.create = function (Arrow) {
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
