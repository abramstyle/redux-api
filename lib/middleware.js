import fetch from 'isomorphic-fetch';
import { objectUtils } from '@abramstyle/utils';
import { actionWith, serializeUrl, serializeOptions, applyMiddlewares } from './utils';
import { CALL_API } from './symbols';
import { responseParser, resultTransformer, resultFilter } from '../middlewares';
import { isValidTypes, isValidCallAPI } from './validations';

function generateMiddleware(options = {}) {
  const { before } = options;
  return store => next => async (action) => {
    const callAPI = action[CALL_API];

    if (!isValidCallAPI(callAPI)) {
      return next(action);
    }

    const { types, url } = callAPI;
    // const timeout = callAPI.timeout || 5000;

    if (!isValidTypes(types)) {
      throw new TypeError('expect types as an array.');
    }

    let isSuccess = () => {};
    let success = () => {};
    let failure = () => {};
    const [requestType, successType, failureType] = types;
    const middlewares = [
      responseParser,
      resultTransformer,
      ...(callAPI.middlewares || []),
    ];

    if (callAPI.isSuccess && typeof callAPI.isSuccess === 'function') {
      ({ isSuccess } = callAPI);
    }

    if (callAPI.success && typeof callAPI.success === 'function') {
      ({ success } = callAPI);
    }

    if (callAPI.failure && typeof callAPI.failure === 'function') {
      ({ failure } = callAPI);
    }

    next(await actionWith({
      type: requestType,
      payload: callAPI.data || {},
      meta: callAPI.meta || {},
    }));

    if (callAPI.cached) {
      return next(await actionWith({
        type: successType,
        payload: callAPI.cached || {},
        meta: callAPI.meta || {},
      }));
    }

    const fetchOptions = serializeOptions(callAPI);
    const endpoint = serializeUrl(url, fetchOptions);
    const fetchData = {
      fetchOptions,
      url: endpoint,
      response: null,
      error: null,
      data: null,
    };

    // NOTE: AbortController is not implemented yet.
    // const controller = new AbortController();
    // const { signal } = controller;
    // Object.assign(fetchOptions, {
    //   signal,
    // });
    //
    // setTimeout(() => {
    //   controller.abort();
    // }, timeout);

    // use before wares
    if (typeof before === 'function') {
      const beforeResult = before.call(null, fetchOptions, store);
      if (objectUtils.isObject(beforeResult)) {
        Object.assign(fetchOptions, beforeResult);
      }
    }
    if (typeof callAPI.before === 'function') {
      const beforeResult = callAPI.before.call(null, fetchOptions, store);
      if (objectUtils.isObject(beforeResult)) {
        Object.assign(fetchOptions, beforeResult);
      }
    }

    try {
      const response = await fetch(endpoint, fetchOptions);
      Object.assign(fetchData, {
        response,
      });
    } catch (error) {
      Object.assign(fetchData, {
        error,
      });
    }

    const result = await applyMiddlewares(middlewares, fetchData);

    try {
      const resultPayload = await resultFilter(result);

      const resultError = isSuccess(resultPayload);
      // console.log('resultError: ', resultError);
      if (!resultError) {
        // console.log('success.', success);
        success.call(null, result);
        return next(await actionWith({
          type: successType,
          payload: resultPayload,
          meta: callAPI.meta || {},
        }));
      }
      failure.call(null, resultError);
      return next(await actionWith({
        type: failureType,
        payload: resultError,
        meta: callAPI.meta || {},
        error: true,
      }));
    } catch (error) {
      // console.log('error: ', error);
      failure.call(null, error);
      return next(await actionWith({
        type: failureType,
        payload: error,
        meta: callAPI.meta || {},
        error: true,
      }));
    }
  };
}
export default generateMiddleware;
