// TODO: Port this.
var _ = require('lodash'),
	async = require('async'),
	pkginfo = require('pkginfo')(module) && module.exports,
	mkdirp = require('mkdirp'),
	path = require('path'),
	fs = require('fs');

var TYPE = require('../../appc').TYPE,
	loader = require('../loader');

module.exports = {
	name: 'SOAP',
	type: TYPE,
	generator: true,
	execute: generate,
	fields: [
		{
			type: 'input',
			name: 'soapWSDL',
			message: 'URL to the Soap WSDL',
			default: 'http://wsf.cdyne.com/WeatherWS/Weather.asmx?WSDL'
		}
	]
};

// opts will contain answers to all field questions
function generate(appc, opts, callback) {
	var models,
		config;

	var localConfig = _.pick(opts, 'soapWSDL');

	var arrow = appc.arrow,
		inquirer = appc.inquirer;

	async.series([

		// create models from the soap wsdl
		function (cb) {
			_.defaults(localConfig, require('../../conf/default').connectors['appc.soap']);
			loader.loadModels(arrow, null, null, localConfig, null, function (err, _models) {
				models = _models;
				cb();
			});
		},

		// ask which of the child APIs we should generate models for
		function (cb) {
			var prompts = [
				{
					type: 'checkbox',
					name: 'apis',
					message: 'Which apis do you need?',
					choices: _.keys(models).map(function (modelName) {
						return { name: modelName, value: modelName, checked: true };
					})
				}
			];
			inquirer.prompt(prompts, function (answers) {
				models = _.pick(models, answers.apis);
				cb();
			});
		},

		// generate a generic connector
		function (cb) {
			var cli = new arrow.CLI();
			cli.runCommand('new', ['connector'], function (err, results) {
				if (err) { return cb(err); }
				config = results;
				cb();
			});
		},

		// create the local configuration
		function (cb) {
			var local = path.join(config.dir, 'conf', 'local.js');
			localConfig.dynamicallyLoadModels = false;
			var content = 'module.exports = ' + JSON.stringify(localConfig, null, '\t') + ';';
			fs.writeFile(local, content, cb);
		},

		// update the default configuration
		function (cb) {
			var from = require('../../conf/default');
			var intoPath = path.join(config.dir, 'conf', 'default.js');
			var into = require(intoPath);
			_.defaults(into, from);
			var content = 'module.exports = ' + JSON.stringify(into, function (key, value) {
					return typeof value === 'function' ? value.toString() : value;
				}, '\t').replace(/": "(function[^\n]*)"/g, function (match, capture) {
					return '": ' + capture
							.replace(/\\r/g, '\r')
							.replace(/\\n/g, '\n')
							.replace(/\\t/g, '\t');
				}) + ';';
			fs.writeFile(intoPath, content, cb);
		},

		// write out the models
		function (cb) {
			async.eachSeries(_.keys(models), function (model, done) {
				var obj = models[model];

				var buffer = "var Arrow = require('arrow');\n\n";
				buffer += "var Model = Arrow.Model.extend('" + model + "'," + JSON.stringify(obj, null, '\t') + ");\n\n";
				buffer += "module.exports = Model;\n";

				var toFile = path.join(config.dir, 'models', model.toLowerCase() + '.js');
				ensureDirExistsForFile(toFile);
				fs.writeFile(toFile, buffer, done);
			}, cb);
		},

		// create a lib/index.js
		function (cb) {
			var from = path.join(__dirname, 'index.tjs'),
				to = path.join(config.dir, 'lib', 'index.js'),
				fromBuf = fs.readFileSync(from).toString(),
				toBuf = _.template(fromBuf, config);
			fs.writeFile(to, toBuf, cb);
		},

		// copy test/connector.js
		function (cb) {
			var from = path.join(__dirname, '..', '..', 'test', 'connector.js'),
				to = path.join(config.dir, 'test', 'connector.js'),
				fromBuf = fs.readFileSync(from, 'utf8');

			ensureDirExistsForFile(to);
			fs.writeFile(to, fromBuf, cb);
		},

		// update appc.json
		function (cb) {
			var to = path.join(config.dir, 'appc.json'),
				contents = JSON.parse(fs.readFileSync(to, 'UTF-8'));

			if (!contents.dependencies) {
				contents.dependencies = {};
			}
			contents.dependencies['connector/appc.soap'] = '^' + pkginfo.version;

			fs.writeFile(to, JSON.stringify(contents, null, '\t'), cb);
		},

		// make sure all the necessary dependencies get mixed in
		function (cb) {
			var fromPKG = require(path.join(__dirname, '..', '..', 'package.json')),
				to = path.join(config.dir, 'package.json'),
				toPKG = require(to),
			// these packages don't need to be copied since they are used by this plugin
				ignore = ['inquirer', 'appc-cli-core', 'progress'];

			Object.keys(fromPKG.dependencies).forEach(function (name) {
				if (!(name in toPKG.dependencies) && ignore.indexOf(name) === -1) {
					toPKG.dependencies[name] = fromPKG.dependencies[name];
				}
			});

			fs.writeFile(to, JSON.stringify(toPKG, null, '\t'), cb);
		}

	], callback);

	function ensureDirExistsForFile(fullPath) {
		var split = fullPath.split('/');
		mkdirp.sync(path.join(split.slice(0, -1).join('/')));
	}

}