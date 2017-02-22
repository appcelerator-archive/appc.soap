#!groovy
@Library('pipeline-library') _

timestamps {
	node('git && (osx || linux)') {
		stage('Checkout') {
			checkout scm
		}

		stage('Configuration') {
			sh "echo \"module.exports = { 'appc.labs.soap': { soapWSDL: 'http://wsf.cdyne.com/WeatherWS/Weather.asmx?WSDL', generateModelsFromSchema: true, modelAutogen: true, handleResponse: function (result, next) { if (result.Success === false) { next(result.ResponseText); } else { next(null, result); } } }, 'screenshots.wsdl': { connector: 'appc.labs.soap', soapWSDL: 'http://api.thumbnail.ws/soap?wsdl', generateModelsFromSchema: true, modelAutogen: true, handleResponse: function (result, next) { if (result.Success === false) { next(result.ResponseText); } else { next(null, result); } } } };\" > conf/local.js"
		}

		buildConnector {
			// don't override anything yet
		}
	}
}
