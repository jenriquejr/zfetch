const test = require('tape');
const nock = require('nock');
const zFetch = require('../lib');

const testNock = nock('https://www.test.com');

test('methods available on a zFetch api object', (t) => {
  t.plan(4);

  const testApi = zFetch.createApi('test', 'https://www.test.com');

  t.equal(Object.keys(testApi).length, 3, 'provides 3 methods');
  t.equal(typeof testApi.fetch, 'function', 'has a fetch method');
  t.equal(typeof testApi.fetchJSON, 'function', 'has a fetchJSON method');
  t.equal(typeof testApi.fetchText, 'function', 'has a fetchText method');
});

test('outgoing requests of each method', async (t) => {
  t.plan(3);

  const testApi = zFetch.createApi('test', 'https://www.test.com/');

  testNock.get('/endpoint')
    .reply(200, 'text 1');
  const response = await testApi.fetch('endpoint');
  t.equal(await response.text(), 'text 1', 'retrieves the response object');

  testNock.get('/endpoint')
    .reply(200, '{ "foo": "bar" }');
  const json = await testApi.fetchJSON('endpoint');
  t.deepEqual(json, { foo: 'bar' }, 'retrieves the data as json');

  testNock.get('/endpoint')
    .reply(200, 'text 3');
  const text = await testApi.fetchText('endpoint');
  t.equal(text, 'text 3', 'retrieves the data as text');
});

test('response promise is rejected when server returns an error', async (t) => {
  t.plan(6);

  const testApi = zFetch.createApi('test', 'https://www.test.com/');

  testNock.get('/unauthorized')
    .reply(401, 'unauthorized');

  await testApi.fetch('unauthorized').catch((err) => {
    t.equal(err.status, 401, 'provides correct error code');
    t.equal(err.data, 'unauthorized', 'error includes text in the data prop');
  });

  testNock.get('/error')
    .reply(500, '{ "error_details": "error" }', { 'Content-Type': 'application/json' });

  await testApi.fetch('error').catch((err) => {
    t.equal(err.status, 500, 'provides correct error code');
    t.deepEqual(err.data, { error_details: 'error' }, 'error includes the json response in the data prop');
  });

  testNock.get('/error-2')
    .reply(500, 'internal server error');

  await testApi.fetch('error-2').catch((err) => {
    t.equal(err.status, 500, 'provides correct error code');
    t.equal(err.data, 'internal server error', 'error includes the text in the data prop');
  });
});

test('default headers and query params are used by default on requests', async (t) => {
  t.plan(1);

  const testApi = zFetch.createApi('test', 'https://www.test.com/', {
    headers: { 'x-custom-header': 'test-header' },
    queryParams: { token: 'test-token' },
  });

  const nockedRequest = nock('https://www.test.com', { reqheaders: { 'X-Custom-Header': 'test-header' } })
    .get('/endpoint')
    .query({ token: 'test-token' })
    .reply(200, 'success');

  await testApi.fetch('/endpoint');

  t.true(nockedRequest.isDone(), 'headers and query params are sent');
});

test('default headers and query params are overwritten when provided on request calls', async (t) => {
  t.plan(1);

  const testApi = zFetch.createApi('test', 'https://www.test.com/', {
    headers: { 'X-Custom-Header': 'test-header' },
    queryParams: { token: 'test-token' },
  });

  const nockedRequest = nock('https://www.test.com', { reqheaders: { 'X-Custom-Header': 'test-o-header' } })
    .get('/endpoint')
    .query({ token: 'test-o-token' }) // override query
    .reply(200, 'success');

  await testApi.fetch('/endpoint', {
    headers: { 'X-Custom-Header': 'test-o-header' },
    queryParams: { token: 'test-o-token' },
  });

  t.true(nockedRequest.isDone(), 'headers and query params are overwritten');
});
