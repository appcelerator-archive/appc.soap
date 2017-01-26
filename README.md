# appc.labs.soap

This is an Arrow connector to SOAP based Web Services.

# Installation

~~~
$ appc install connector/appc.labs.soap
~~~

In the generated configuration file, you will need to update the "soapWSDL" property. This can be either the URL to a
WSDL, such as:

~~~
http://www.webservicex.com/stockquote.asmx?WSDL
~~~

Or, it can be the path to a locally stored WSDL file. This path will be relative to your project's directory:

~~~
./conf/stockquote.wsdl
~~~

# Usage

If you set `generateModelsFromSchema` and `modelAutogen` to true in your configuration, then Models and APIs will be
generated for you based on the WSDL you provide in your configuration.

You can also reference the connector in your model, if you want to explicitly dictate which fields to include:

~~~
var Account = Arrow.Model.extend('Account', {
    fields: {
        Name: { type: String, required: true, validator: /[a-zA-Z]{3,}/ }
    },
    connector: 'appc.labs.soap'
});
~~~

# Customizing

## Other Connector Options

- `connectionTimeout` - Service-level Timeout. Represents integer containing the number of milliseconds to wait for a server to send response headers (and start the response body) before aborting the request. Note that if the underlying TCP connection cannot be established, the OS-wide TCP connection timeout will overrule the timeout option

~~~
{connectionTimeout: 5000}
~~~

You can customize the connector by adding any of the following options to your configuration file:

~~~
{
	connectors: {
		'appc.labs.soap': {
			// any connector options
		}
	}
}
~~~

## Unwrapping or Parsing Payloads

The built in parsing will work for most scenarios. But, if it isn't properly parsing your endpoint, or you want to
further unwrap the response, you can add your own "handleResponse" method to the config, as follows. This special method
handles SOAP responses, turning them in to JavaScript objects or arrays for setting up the models or collections.

For example, a certain SOAP service for fetching current Stock prices...

~~~
http://www.webservicex.com/stockquote.asmx?WSDL
~~~

... might return a string of XML from an endpoint (simplified for brevity):

~~~
<StockQuotes>
	<Stock>
		<Symbol>AAPL</Symbol>
		<Last>121.89</Last>
		<Name>Apple Inc.</Name>
	</Stock>
</StockQuotes>
~~~

To make this more palatable, we need to write our handleResponse method to turn that to a plain JavaScript object:

~~~
handleResponse: function (result, next) {
	require('xml2js').parseString(result, {explicitArray: false}, function (err, result) {
		if (err) {
			next(err);
		} else {
			next(null, result.StockQuotes.Stock);
		}
	});
}
~~~

Now the connector will receive a nice JavaScript object, instead of the XML string it was given, which it can then
properly return from your endpoint.

~~~
{
	Symbol: 'AAPL',
	Last: 121.89,
	Name: 'Apple Inc.'
}
~~~

## Customize XML Parsing Options

Does your server return an XML string? By default, it will be parsed with the `xml2js` library with the following:

~~~
{explicitArray: false}
~~~

You can customize this in your config by specifying `xmlOptions`:

~~~
{
	xmlOptions: {
		// any options from https://github.com/Leonidas-from-XIV/node-xml2js#options
	}
}
~~~

# Contributing

This project is open source and licensed under the Apache Public License (version 2). Please consider forking this project to improve, enhance or fix issues. If you feel like the community will benefit from your fork, please open a pull request.

To protect the interests of the contributors, Appcelerator, customers and end users we require contributors to sign a Contributors License Agreement (CLA) before we pull the changes into the main repository. Our CLA is simple and straightforward - it requires that the contributions you make to any Appcelerator open source project are properly licensed and that you have the legal authority to make those changes. This helps us significantly reduce future legal risk for everyone involved. It is easy, helps everyone, takes only a few minutes, and only needs to be completed once.

You can digitally sign the CLA online. Please indicate your email address in your first pull request so that we can make sure that will locate your CLA. Once you’ve submitted it, you no longer need to send one for subsequent submissions.

# Legal Stuff

Appcelerator is a registered trademark of Appcelerator, Inc. Arrow and associated marks are trademarks of Appcelerator. All other marks are intellectual property of their respective owners. Please see the LEGAL information about using our trademarks, privacy policy, terms of usage and other legal information at http://www.appcelerator.com/legal.

