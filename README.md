# zFetch

[![Build Status](https://semaphoreci.com/api/v1/jenriquejr/zfetch/branches/master/badge.svg)](https://semaphoreci.com/jenriquejr/zfetch)

node-fetch wrapper with some minor changes.

This library allows pre-configuring fetch requests per domain, allowing pre-configured headers and query parameters. 

## Key Differences
- Fetch methods accept a path instead of url
- QueryParams are passed in the fetch options as `{ queryParams: {} }`;
- Server errors causes the returned promise to be rejected.

Errors are returned as an Error object with a data property containing the server response. If a `'Content-Type'` header with value `'application/json'` is present in the the response header the data will automatically be parsed as an object.

## Installation

Using npm:
```sh
npm install --save zfetch
```

## Available methods

### zFetch.createApi(apiName, baseUrl[, config])
- apiName (string): identifier name for the api
- baseUrl (string): url of the server to be reached (including protocol E.G. `https://www.example.com/v1`)
- config (object): 

Property         | Meaning
---------------- | -----------------------
`headers`        | Pre-configured headers (used for all subsequent requests)
`queryParams`    | Pre-configured queryParams (used for all subsequent requests)

### api.fetch(pathname[, options])
Resolves to the response object returned by node-fetch
### api.fetchJSON(pathname[, options])
Resolves to an object parsed from the json returned by the server
### api.fetchText(pathname[, options])
Resolves to an string containing the data in the response

Params:
- pathname (string): endpoint to be requested.
- options (object): all options from [node-fetch options](https://github.com/bitinn/node-fetch#fetch-options), plus `queryParams` option


## Sample usage
```js
const zFetch = require('zfetch');

const exampleApi = zFetch.createApi('example-api', 'https://www.example.com/', {
  headers: { 'X-Custom-Header': 'value' },
  queryParams: { customParam: 'XYZ' },
});

/**
 * Example using get method, headers and query parameters automatically included
 * GET https://www.example.com/examples/get?customParam=XYZ
 */
exampleApi.fetch('examples/get').then(/*...*/);
// or
exampleApi.fetchJSON('examples/get').then(/*...*/);
// or
exampleApi.fetchText('examples/get').then(/*...*/);

/**
 * Example using get method, headers and query parameters automatically
 * POST https://www.example.com/examples/post?customParam=XYZ
 */
exampleApi.fetch('examples/post', { method: 'POST', body: /*...*/ })
  .then(/*...*/);
// or
exampleApi.fetchJSON('examples/post', { method: 'POST', body: /*...*/ })
  .then(/*...*/);
// or
exampleApi.fetchText('examples/post', { method: 'POST', body: /*...*/ })
  .then(/*...*/);
```
