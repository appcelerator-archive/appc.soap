var base = require('./_base'),
  Arrow = base.Arrow,
  connector = base.connector

describe('Capabilities', Arrow.Connector.generateTests(connector, module))
