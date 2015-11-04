# appc.labs.soap

This is an Arrow connector to SOAP based Web Services.

# Installation

~~~
$ appc install connector/appc.labs.soap
~~~

# Usage

If you set `generateModelsFromSchema` and `modelAutogen` to true in your configuration, then Models and APIs will
be generated for you based on the WSDL you provide in your configuration.

But in order for these to work properly, you will need to write a `handleResponse`
method in the config. This special method handles SOAP responses, turning them in to
JavaScript objects or arrays for setting up the models or collections.

For example, a certain SOAP service for fetching current Stock prices...

	http://www.webservicex.com/stockquote.asmx?WSDL

... Might return a string of XML from an endpoint (simplified for brevity):

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
	require('xml2js').parseString(result, {explicitArray: false}, next);
}
~~~

Now the connector will receive a nice JavaScript object, instead of the XML string it was given, which it can then
properly return from your endpoint.

~~~
{
	StockQuotes: {
		Stock: {
			Symbol: 'AAPL',
			Last: 121.89,
			Name: 'Apple Inc.'
		}
	}
}
~~~

You might ask yourself, "Gosh, that's a lot of work. Why do I have to do that? Why can't you do it for me?" Well, to be
fair, it's only 3 lines of code. And those 3 lines of code will vary drastically from SOAP server to SOAP server. The
connector does a fair bit of work to normalize the data, and infer fields based on that data, but it is up to you to get
it across the finish line.

You can also reference the connector in your model, if you want to explicitly dictate which fields to include:

~~~
var Account = Arrow.Model.extend('Account', {
    fields: {
        Name: { type: String, required: true, validator: /[a-zA-Z]{3,}/ }
    },
    connector: 'appc.labs.soap'
});
~~~


# Contributing

This project is open source and licensed under the Apache Public License (version 2). Please consider forking this project to improve, enhance or fix issues. If you feel like the community will benefit from your fork, please open a pull request.

To protect the interests of the contributors, Appcelerator, customers and end users we require contributors to sign a Contributors License Agreement (CLA) before we pull the changes into the main repository. Our CLA is simple and straightforward - it requires that the contributions you make to any Appcelerator open source project are properly licensed and that you have the legal authority to make those changes. This helps us significantly reduce future legal risk for everyone involved. It is easy, helps everyone, takes only a few minutes, and only needs to be completed once.

You can digitally sign the CLA online. Please indicate your email address in your first pull request so that we can make sure that will locate your CLA. Once you’ve submitted it, you no longer need to send one for subsequent submissions.

# Legal Stuff

Appcelerator is a registered trademark of Appcelerator, Inc. Arrow and associated marks are trademarks of Appcelerator. All other marks are intellectual property of their respective owners. Please see the LEGAL information about using our trademarks, privacy policy, terms of usage and other legal information at http://www.appcelerator.com/legal.

