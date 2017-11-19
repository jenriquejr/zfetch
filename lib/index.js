const url = require('url');
const fetch = require('node-fetch');
const { ApiError } = require('./utils');

class API {
  constructor(apiName, baseUrl, config = {}) {
    this.apiName = apiName;
    const { host, protocol, pathname } = url.parse(baseUrl);

    this.host = host;
    this.protocol = protocol;
    this.basePath = pathname.replace(/^\//, '');
    this.config = config;
  }

  processResponse(response) {
    const { apiName } = this;
    const { status, headers } = response;

    if (status < 400) {
      return response;
    }

    const contentType = headers.get('content-type') || '';
    let resolvingError;
    if (contentType.includes('application/json')) {
      resolvingError = response.json();
    } else {
      resolvingError = response.text();
    }

    return resolvingError.then((err) => { throw new ApiError(apiName, status, err); });
  }

  executeFetch(endpoint, requestOptions = {}) {
    const { host, protocol, basePath, config } = this;
    const pathname = `${basePath}/${endpoint}`.replace(/^\/\//, '/');

    const queryParams = Object.assign({}, config.queryParams, requestOptions.queryParams);
    const fetchUrl = url.format({ protocol, host, pathname, query: queryParams });
    const fetchOptions = Object.assign({}, requestOptions);
    fetchOptions.headers = Object.assign({}, config.headers, requestOptions.headers);

    if (fetchOptions.queryParams) {
      delete fetchOptions.queryParams;
    }

    return fetch(fetchUrl, fetchOptions).then((res) => this.processResponse(res));
  }
}

exports.createApi = (apiName, baseUrl, config) => {
  if (!baseUrl) {
    throw new Error(`No baseUrl provided for ${apiName}`);
  }

  const api = new API(apiName, baseUrl, config);
  return {
    fetch: (...args) => api.executeFetch(...args),
    fetchJSON: (...args) => api.executeFetch(...args).then((res) => res.json()),
    fetchText: (...args) => api.executeFetch(...args).then((res) => res.text()),
  };
};
