import { objectUtils, stringUtils, urlUtils } from '@abramstyle/utils';
import { secureMethods } from './constants';

async function actionWith(descriptor) {
  if (!objectUtils.isObject(descriptor)) {
    throw new TypeError('expect descriptor to be an object');
  }

  descriptor.meta = descriptor.meta;
  descriptor.payload = descriptor.payload;

  return descriptor;
}

function serializeOptions(callAPI = {}) {
  const options = {
    credentials: 'same-origin',
    method: 'GET',
    headers: {},
    body: null,
  };

  const {
    credentials,
    headers,
    data,
    method,
    query,
  } = callAPI;


  if (stringUtils.isString(credentials)) {
    options.credentials = credentials;
  }

  if (objectUtils.isObject(headers)) {
    Object.assign(options.headers, headers);
  }

  if (data) {
    options.body = data;
  }

  if (objectUtils.isObject(options.body) || Array.isArray(options.body) || stringUtils.isString(options.body)) {
    Object.assign(options, {
      headers: Object.assign(options.headers, {
        // json is first priority if server is support
        accept: 'application/json',
        'Content-Type': 'application/json',
      }),
    });
    options.body = JSON.stringify(options.body);
  }

  options.method = stringUtils.isString(method) ? method.toUpperCase() : 'GET';

  if (objectUtils.isObject(query)) {
    options.query = query;
  }

  return options;
}

function serializeUrl(url, options) {
  let endpoint = url;
  const { query, body, method } = options;

  if (objectUtils.isObject(query)) {
    endpoint = urlUtils.mergeQuerystring(endpoint, query);
  }
  if (secureMethods.has(method)) {
    endpoint = urlUtils.mergeQuerystring(endpoint, body);
  }

  return endpoint;
}

async function applyMiddlewares(middlewares, data) {
  const middlewareTransformers = [...middlewares];
  async function applyMiddleware(resultGenerator) {
    const middleware = middlewareTransformers.shift();

    // console.log(middlewareTransformers.length, middleware, result);
    const result = await resultGenerator;

    if (typeof middleware === 'function') {
      return applyMiddleware(middleware.call(null, result));
    }

    if (middlewareTransformers.length === 0) {
      return result;
    }

    return result;
  }


  return applyMiddleware(Promise.resolve(data));
}

export { actionWith, serializeOptions, serializeUrl, applyMiddlewares };
