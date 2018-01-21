# Redux API

redux api is a redux middleware that send request.

# usage
## install
```bash
yarn add redux-callapi
```

## quick start
```js
import {createStore, applyMiddleware } from 'redux';
import reduxApiGenerator from '@abramstyle/redux-api';

const reduxApi = reduxApiGenerator();
const middlewares = [reduxApi];
const store = createStore(reducers, applyMiddlewares(middlewares));
```

# API
## `reduxApiGenerator(options = {})`
it returns a reduxMiddleware

### `options.before`
an function that will transform fetchOptions before request.

you can do some common things for every request.

# CALL_API Action
## example

a api requesting action has [CALL_API] property. it specified request info.

```js
import {CALL_API} from '@abramstyle/redux-api';
const action = {
  [CALL_API]: {
    url: 'https://api.domain.com',
    types: [
      'REQUEST_TYPE',
      'SUCCESS_TYPE',
      'FAILURE_TYPE'
    ],
  }
};
```

## properties

### `callAPI.credentials`
one of omit, same-origin, or include. must be a string.

### `callAPI.headers`
must be an object. specified request headers.

### `callAPI.data`
data should be sent to server. if request method, it will be append to url as query.

### `callAPI.method`
request method, should be a valid method.

## Lifecycle
an api request has these status: initial, requesting, success, failure.

redux-api will dispatch these actions.

once a call api action is dispatched, an promise is returned.

### request action:
```js
{
  type: requestType,
  payload: callAPI.data || {},
  meta: callAPI.meta || {}
}
```
### success action
```js
{
  type: successType,
  payload: parsedResponseData,
  meta: callAPI.meta || {},
}
```
### failure action
```js
{
  type: failureType,
  payload: errorInstance,
  meta: callAPI.meta,
  error: true,
}
```
*NOTE*: payload is an error instance. http status code will be found as error.status. the error message responded from server will be found as error.data. the full response will be find as error.response.
