import nock from 'nock';
import configureStore from 'redux-mock-store';

import generateMiddleware from '../middleware';
import { CALL_API } from '../symbols';

describe('create middleware with options', () => {
  nock('http://api.redux-api.com')
    .get('/before')
    .times(2)
    .reply(200, function reply() {
      return {
        type: 'with headers',
        isGray: !!this.req.headers['x-is-gray'],
      };
    });
  test('before will be applied.', async () => {
    const middleware = generateMiddleware({
      before: fetchOptions => ({
        headers: Object.assign({}, fetchOptions.headers, {
          'x-is-gray': 'yes',
        }),
      }),
    });
    const middlewares = [middleware];
    const mockStore = configureStore(middlewares);
    const store = mockStore();
    const types = ['request', 'success', 'failure'];
    expect.assertions(1);

    const action = {
      [CALL_API]: {
        url: 'http://api.redux-api.com/before',
        types,
        timeout: 1000,
      },
    };

    await store.dispatch(action);

    const actions = store.getActions();

    expect(actions).toEqual([{
      type: 'request',
      payload: {},
      meta: {},
    }, {
      type: 'success',
      payload: {
        type: 'with headers',
        isGray: true,
      },
      meta: {},
    }]);
  });
  test('callAPI before will be applied.', async () => {
    const middleware = generateMiddleware();
    const middlewares = [middleware];
    const mockStore = configureStore(middlewares);
    const store = mockStore();
    const types = ['request', 'success', 'failure'];
    expect.assertions(1);

    const action = {
      [CALL_API]: {
        url: 'http://api.redux-api.com/before',
        types,
        timeout: 1000,
        before: fetchOptions => ({
          headers: Object.assign({}, fetchOptions.headers, {
            'x-is-gray': 'yes',
          }),
        }),
      },
    };

    await store.dispatch(action);

    const actions = store.getActions();

    expect(actions).toEqual([{
      type: 'request',
      payload: {},
      meta: {},
    }, {
      type: 'success',
      payload: {
        type: 'with headers',
        isGray: true,
      },
      meta: {},
    }]);
  });
});
describe('redux api middleware', () => {
  const replyText = 'Lorem ipsum dolor sit amet';
  nock('http://api.redux-api.com')
    .get('/author')
    .delay(2000)
    .times(3)
    .reply(200, {
      author: 'Abram',
      email: 'abram.style@gmail.com',
    })
    .get('/content')
    .reply(200, replyText)
    .get('/before')
    .reply(200, function reply() {
      return {
        type: 'with headers',
        isGray: !!this.req.headers['x-is-gray'],
      };
    })
    .get('/private')
    .reply(403, 'You have no Access')
    .get('/internal')
    .reply(500, 'Server Error')
    .post('/user')
    .reply(200, (uri, requestBody) => requestBody)
    .put('/user')
    .reply(200, (uri, requestBody) => ({
      type: 'put',
      body: requestBody,
    }))
    .get('/200failure')
    .reply(200, {
      success: false,
      message: 'user is not exists.',
    });
  const middleware = generateMiddleware();
  const middlewares = [middleware];
  const mockStore = configureStore(middlewares);
  test('get object response success', async () => {
    const store = mockStore();
    const types = ['request', 'success', 'failure'];
    expect.assertions(1);

    const action = {
      [CALL_API]: {
        url: 'http://api.redux-api.com/author',
        types,
        timeout: 1000,
      },
    };

    await store.dispatch(action);

    const actions = store.getActions();

    expect(actions).toEqual([{
      type: 'request',
      payload: {},
      meta: {},
    }, {
      type: 'success',
      payload: {
        author: 'Abram',
        email: 'abram.style@gmail.com',
      },
      meta: {},
    }]);
  });
  test('get string response success', async () => {
    const store = mockStore();
    const types = ['request', 'success', 'failure'];
    expect.assertions(1);

    const action = {
      [CALL_API]: {
        url: 'http://api.redux-api.com/content',
        types,
        timeout: 1000,
      },
    };

    await store.dispatch(action);

    const actions = store.getActions();

    expect(actions).toEqual([{
      type: 'request',
      payload: {},
      meta: {},
    }, {
      type: 'success',
      payload: replyText,
      meta: {},
    }]);
  });
  test('get 403 error response', async () => {
    const store = mockStore();
    const types = ['request', 'success', 'failure'];
    expect.assertions(1);

    const action = {
      [CALL_API]: {
        url: 'http://api.redux-api.com/private',
        types,
        timeout: 1000,
      },
    };

    await store.dispatch(action);

    const actions = store.getActions();
    expect(actions).toEqual([{
      type: 'request',
      payload: {},
      meta: {},
    }, {
      type: 'failure',
      payload: new Error('Forbidden'),
      meta: {},
      error: true,
    }]);
  });
  test('get 500 error response', async () => {
    const store = mockStore();
    const types = ['request', 'success', 'failure'];
    expect.assertions(1);

    const action = {
      [CALL_API]: {
        url: 'http://api.redux-api.com/internal',
        types,
        timeout: 1000,
      },
    };

    await store.dispatch(action);

    const actions = store.getActions();
    expect(actions).toEqual([{
      type: 'request',
      payload: {},
      meta: {},
    }, {
      type: 'failure',
      payload: new Error('Internal Server Error'),
      meta: {},
      error: true,
    }]);
  });
  test('post user to server', async () => {
    expect.assertions(1);
    const store = mockStore();
    const types = ['request', 'success', 'failure'];
    const data = {
      id: 'c4ca4238a0b923820dcc509a6f75849b',
      name: 'Abram',
      age: 25,
    };

    const action = {
      [CALL_API]: {
        url: 'http://api.redux-api.com/user',
        method: 'POST',
        types,
        data,
        timeout: 1000,
      },
    };

    await store.dispatch(action);
    const actions = store.getActions();

    expect(actions).toEqual([{
      type: 'request',
      payload: data,
      meta: {},
    }, {
      type: 'success',
      payload: data,
      meta: {},
    }]);
  });
  test('put data to server', async () => {
    expect.assertions(1);

    const store = mockStore();
    const types = ['request', 'success', 'failure'];
    const data = {
      id: 'c4ca4238a0b923820dcc509a6f75849b',
      age: 28,
    };

    const action = {
      [CALL_API]: {
        url: 'http://api.redux-api.com/user',
        method: 'PUT',
        types,
        data,
        timeout: 1000,
      },
    };

    await store.dispatch(action);
    const actions = store.getActions();

    expect(actions).toEqual([{
      type: 'request',
      payload: data,
      meta: {},
    }, {
      type: 'success',
      payload: {
        type: 'put',
        body: data,
      },
      meta: {},
    }]);
  });
  test('before can transform fetch options', async () => {
    const store = mockStore();
    const types = ['request', 'success', 'failure'];
    expect.assertions(1);

    const action = {
      [CALL_API]: {
        url: 'http://api.redux-api.com/before',
        types,
        before: fetchOptions => ({
          headers: Object.assign({}, fetchOptions.headers, {
            'x-is-gray': 'yes',
          }),
        }),
        timeout: 1000,
      },
    };

    await store.dispatch(action);

    const actions = store.getActions();

    expect(actions).toEqual([{
      type: 'request',
      payload: {},
      meta: {},
    }, {
      type: 'success',
      payload: {
        type: 'with headers',
        isGray: true,
      },
      meta: {},
    }]);
  });

  test('if cached data is specified, and no request', async () => {
    const store = mockStore();
    const types = ['request', 'success', 'failure'];
    expect.assertions(1);

    const action = {
      [CALL_API]: {
        url: 'http://api.redux-api.com/author',
        types,
        cached: {
          author: 'Abram',
          email: 'abram.style@gmail.com',
        },
        timeout: 1000,
      },
    };

    await store.dispatch(action);

    const actions = store.getActions();

    expect(actions).toEqual([{
      type: 'request',
      payload: {},
      meta: {},
    }, {
      type: 'success',
      payload: {
        author: 'Abram',
        email: 'abram.style@gmail.com',
      },
      meta: {},
    }]);
  });


  test('if success property is specified, it will be called after request finished', async () => {
    const store = mockStore();
    const types = ['request', 'success', 'failure'];
    expect.assertions(1);
    let flag = false;

    const action = {
      [CALL_API]: {
        url: 'http://api.redux-api.com/author',
        types,
        success: () => {
          flag = true;
        },
        timeout: 1000,
      },
    };

    await store.dispatch(action);

    expect(flag).toBeTruthy();
  });

  test('send normal action will be skipped.', async () => {
    expect.assertions(1);
    const store = mockStore();
    const action = {
      type: 'normal-action',
    };
    await store.dispatch(action);
    expect(store.getActions()).toEqual([action]);
  });

  test('if types is invalid, an error will be thown', async () => {
    expect.assertions(1);
    const store = mockStore();
    const action = {
      [CALL_API]: {
        url: 'http://null.com',
      },
    };

    try {
      await store.dispatch(action);
    } catch (e) {
      const error = new TypeError('expect types as an array.');
      expect(e).toEqual(error);
    }
  });
  test('valid result if isSuccess is specified.', async () => {
    const store = mockStore();
    const types = ['request', 'success', 'failure'];
    expect.assertions(1);

    const action = {
      [CALL_API]: {
        url: 'http://api.redux-api.com/200failure',
        types,
        isSuccess: (resultPayload) => {
          if (!resultPayload.success) {
            return resultPayload.message;
          }
          return null;
        },
      },
    };

    await store.dispatch(action);

    const actions = store.getActions();

    expect(actions).toEqual([{
      type: 'request',
      payload: {},
      meta: {},
    }, {
      type: 'failure',
      payload: 'user is not exists.',
      error: true,
      meta: {},
    }]);
  });
});
