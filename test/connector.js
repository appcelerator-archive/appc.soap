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
			var model = server.getModel('appc.labs.soap/Global');
			should(model).be.ok;

			model.GetWeatherInformation(function (err, results) {
				should(err).be.not.ok;
				should(results).be.ok;
				should(results.length).be.ok;
				should(results[0]).be.an.Object;
				next();
			});
		});

		it.skip('should allow passing params', function (next) {
			var model = server.getModel('appc.labs.soap/Global');
			should(model).be.ok;

			model.GetCityWeatherByZIP({ZIP: '21921'}, function (err, result) {
				should(err).be.not.ok;
				should(result).be.ok;
				should(result).be.an.Object;
				should(result.City).be.eql('Elkton');
				next();
			});
		});

		it('should support soap-only wsdl', function (next) {
			var model = server.getModel('screenshots.wsdl/Global');
			should(model).be.ok;
			model.getSoap({
				apikey: 'ab92960c78f446cb2bf4dd6365fe755a4f73755c2c0e',
				url: 'http://www.google.com/',
				width: 400,
				format: 'JPEG',
				fullscreen: false,
				mobile: false
			}, function (err, result) {
				should(err).be.not.ok;
				should(result).be.ok;
				should(result.encoding).be.eql('base64');
				should(result.image).be.not.empty;
				next();
			});
		});

		it('should interpret errors properly', function (next) {
			var model = server.getModel('appc.labs.soap/Global');
			should(model).be.ok;

			model.GetCityWeatherByZIP({ZIP: 'zip so bad, i cried a little'}, function (err, result) {
				should(err).be.ok;
				next();
			});
		});

		it.skip('should stand up GET APIs for methods', function makeSureAuthIsRequired(cb) {
			request({
				method: 'GET',
				uri: 'http://localhost:' + server.port + '/api/appc.labs.soap/global/GetCityWeatherByZIP?ZIP=21921',
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

		it.skip('should stand up POST APIs for methods', function makeSureAuthIsRequired(cb) {
			request({
				method: 'POST',
				uri: 'http://localhost:' + server.port + '/api/appc.labs.soap/weather/weathersoap/GetCityForecastByZIP',
				body: {
					ZIP: '21921'
				},
				auth: {
					user: server.config.apikey,
					password: ''
				},
				json: true
			}, function (err, response, body) {
				should(body.success).be.true;
				should(body.weathersoap).be.ok;
				should(body.weathersoap.City).be.eql('Elkton');
				should(body.weathersoap.ForecastResult).be.an.Object;
				cb();
			});
		});

		it('should handle errors through API', function makeSureAuthIsRequired(cb) {
			request({
				method: 'GET',
				uri: 'http://localhost:' + server.port + '/api/appc.labs.soap/global/GetCityWeatherByZIP?ZIP=such-bad-zip',
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