var base = require('./_base'),
	Arrow = base.Arrow,
	server = base.server,
	request = require('request'),
	should = require('should');

describe('Connector', function () {

	before(function (next) {
		server.start(next);
	});

	after(function (next) {
		server.stop(next);
	});

	describe('Model Generation', function () {

		it('should expose simple methods', function (next) {
			var model = server.getModel('appc.soap/Global');
			should(model).be.ok;

			model.GetWeatherInformation(function (err, results) {
				should(err).be.not.ok;
				should(results).be.ok;
				should(results.length).be.ok;
				should(results[0]).be.an.Object;
				next();
			});
		});

		it('should allow passing params', function (next) {
			var model = server.getModel('appc.soap/Global');
			should(model).be.ok;

			model.GetCityWeatherByZIP({ZIP: '21921'}, function (err, result) {
				should(err).be.not.ok;
				should(result).be.ok;
				should(result).be.an.Object;
				next();
			});
		});

		it('should interpret errors properly', function (next) {
			var model = server.getModel('appc.soap/Global');
			should(model).be.ok;

			model.GetCityWeatherByZIP({ZIP: 'zip so bad, i cried a little'}, function (err, result) {
				should(err).be.ok;
				next();
			});
		});

		it('should stand up APIs for methods', function makeSureAuthIsRequired(cb) {
			request({
				method: 'GET',
				uri: 'http://localhost:' + server.port + '/api/global/GetCityWeatherByZIP?ZIP=21921',
				auth: {
					user: server.config.apikey,
					password: ''
				},
				json: true
			}, function (err, response, body) {
				should(body.success).be.true;
				should(body.global).be.ok;
				should(body.global.City).be.eql('Elkton');
				cb();
			});
		});

		it('should handle errors through API', function makeSureAuthIsRequired(cb) {
			request({
				method: 'GET',
				uri: 'http://localhost:' + server.port + '/api/global/GetCityWeatherByZIP?ZIP=such-bad-zip',
				auth: {
					user: server.config.apikey,
					password: ''
				},
				json: true
			}, function (err, response, body) {
				should(body.success).be.false;
				cb();
			});
		});

	});

});