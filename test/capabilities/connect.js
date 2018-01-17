exports.connect = {
  goodConfig: {
    soapWSDL: 'https://ws.cdyne.com/creditcardverify/luhnchecker.asmx?wsdl',
    generateModelsFromSchema: true,
    modelAutogen: true
  },
  badConfig: {
    soapWSDL: 'http://google.com/'
  }
}
