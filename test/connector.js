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

		it('should allow passing params', function (next) {
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

		it('should get stocks', function (next) {
			var model = server.getModel('stocks.wsdl/Global');
			should(model).be.ok;
			model.GetQuote({
				symbol: 'AAPL'
			}, function (err, result) {
				should(err).be.not.ok;
				should(result).be.ok;
				should(result).have.property('StockQuotes');
				should(result.StockQuotes).have.property('Stock');
				should(result.StockQuotes.Stock).have.property('Symbol', 'AAPL');
				should(result.StockQuotes.Stock).have.property('Name', 'Apple Inc.');
				should(result.StockQuotes.Stock).have.property('Last');
				should(result.StockQuotes.Stock).have.property('Date');
				should(result.StockQuotes.Stock).have.property('Time');
				should(result.StockQuotes.Stock).have.property('Change');
				should(result.StockQuotes.Stock).have.property('Open');
				should(result.StockQuotes.Stock).have.property('High');
				should(result.StockQuotes.Stock).have.property('Low');
				should(result.StockQuotes.Stock).have.property('Volume');
				next();
			});
		});

		it('should get stocks using wsdl stored on disk', function (next) {
			var model = server.getModel('stocks.file.wsdl/Global');
			should(model).be.ok;
			model.GetQuote({
				symbol: 'AAPL'
			}, function (err, result) {
				should(err).be.not.ok;
				should(result).be.ok;
				should(result).have.property('Symbol', 'AAPL');
				should(result).have.property('Name', 'Apple Inc.');
				should(result).have.property('Last');
				should(result).have.property('Date');
				should(result).have.property('Time');
				should(result).have.property('Change');
				should(result).have.property('Open');
				should(result).have.property('High');
				should(result).have.property('Low');
				should(result).have.property('Volume');
				next();
			});
		});

		it('should allow reducing models', function (next) {
			var model = Arrow.Model.reduce('stocks.file.wsdl/Global', 'SmallerStock', {
				fields: {
					symbol: {name: 'Symbol', type: String},
					name: {name: 'Name', type: String},
					Last: {type: Number}
				}
			});
			should(model).be.ok;
			should(model.GetQuote).be.ok;
			model.GetQuote({
				symbol: 'AAPL'
			}, function (err, result) {
				should(err).be.not.ok;
				should(result).be.ok;
				should(result).have.property('symbol', 'AAPL');
				should(result).have.property('name', 'Apple Inc.');
				should(result).have.property('Last');
				should(result).not.have.property('Date');
				should(result).not.have.property('Time');
				should(result).not.have.property('Change');
				should(result).not.have.property('Open');
				should(result).not.have.property('High');
				should(result).not.have.property('Low');
				should(result).not.have.property('Volume');
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

		it('should stand up GET APIs for methods', function makeSureAuthIsRequired(cb) {
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

		it('should stand up POST APIs for methods', function makeSureAuthIsRequired(cb) {
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