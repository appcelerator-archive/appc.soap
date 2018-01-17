var Arrow = require('arrow')

/**
 * Fetches metadata describing your connector's proper configuration.
 * @param next
 */
exports.fetchMetadata = function fetchMetadata (next) {
  next(null, {
    fields: [
      Arrow.Metadata.Text({
        name: 'soapWSDL',
        description: 'URL to a SOAP WSDL',
        required: !this.soapWSDL
      }),
      Arrow.Metadata.Checkbox({
        name: 'generateModelsFromSchema',
        description: 'Whether or not to generate models automatically from your WSDL'
      }),
      Arrow.Metadata.Checkbox({
        name: 'modelAutogen',
        description: 'Whether or not to generate API Endpoints on your generated models'
      }),
      Arrow.Metadata.Integer({
        name: 'connectionTimeout',
        description: 'Service-level Timeout',
        required: false
      })
    ]
  })
}
