/**
 * Cleans up the SOAP Client.
 * @param next
 */
exports.disconnect = function (next) {
  if (this.client) {
    this.client = null
  }
  next()
}
