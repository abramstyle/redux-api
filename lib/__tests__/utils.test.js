const {
  actionWith, serializeOptions, serializeUrl, applyMiddlewares,
} = require('../utils');

describe('utils.actionWith', () => {
  test('actionWith', async () => {
    const descriptor = {
      meta: 'meta',
      payload: 'payload',
    };

    expect(await actionWith(descriptor)).toEqual({
      meta: 'meta',
      payload: 'payload',
    });
    try {
      await actionWith();
    } catch (error) {
      expect(error).toEqual(new TypeError('expect descriptor to be an object'));
    }
  });
  test('invalid descriptor will receive an error', async () => {
    expect.assertions(1);
    try {
      await actionWith();
    } catch (e) {
      const error = new TypeError('expect descriptor to be an object');
      expect(e).toEqual(error);
    }
  });
});

describe('serializeOptions', () => {
  test('fetchOptions default options', () => {
    const defaultfetchOptions = serializeOptions();
    expect(defaultfetchOptions).toEqual({
      credentials: 'same-origin',
      method: 'GET',
      headers: {},
      body: null,
    });
  });
  test('fetchOptions will set correct credentials', () => {
    const callAPI = { credentials: 'include' };
    const fetchOptions = serializeOptions(callAPI);
    expect(fetchOptions).toEqual({
      credentials: 'include',
      method: 'GET',
      headers: {},
      body: null,
    });
  });

  test('if specify query, it will be append to url', () => {
    const callAPI = { query: { a: 1 } };
    const fetchOptions = serializeOptions(callAPI);
    expect(fetchOptions).toEqual({
      credentials: 'same-origin',
      method: 'GET',
      headers: {},
      body: null,
      query: {
        a: 1,
      },
    });
  });

  test('if send data, fetchOptions will has it', () => {
    const stringOptions = {
      data: 'data',
    };
    const objectOptions = {
      data: { from: 'Node' },
    };

    const stringFetchOptions = serializeOptions(stringOptions);
    const objectFetchOptions = serializeOptions(objectOptions);
    expect(stringFetchOptions).toEqual({
      credentials: 'same-origin',
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stringOptions.data),
    });
    expect(objectFetchOptions).toEqual({
      credentials: 'same-origin',
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(objectOptions.data),
    });
  });

  test('if spefifid method fetchOptions will has it', () => {
    const options = {
      method: 'PUT',
    };
    const fetchOptions = serializeOptions(options);
    expect(fetchOptions).toEqual({
      credentials: 'same-origin',
      method: 'PUT',
      headers: {},
      body: null,
    });
  });
  test('if middlewares is specified, it will apply to fetchOptions', () => {
    const middlewares = () => {};
    const options = {
      middlewares: [middlewares],
    };
    const fetchOptions = serializeOptions(options);
    expect(fetchOptions).toEqual({
      credentials: 'same-origin',
      method: 'GET',
      headers: {},
      body: null,
    });
  });
  test('if headers is spefifid, it will apply to fetchOptions', () => {
    const options = {
      headers: {
        'x-as-from': 'node-call',
      },
    };
    const fetchOptions = serializeOptions(options);
    expect(fetchOptions).toEqual({
      credentials: 'same-origin',
      method: 'GET',
      headers: {
        'x-as-from': 'node-call',
      },
      body: null,
    });
  });

  test('if headers and body specified, fetchOptions will has all that headers', () => {
    const stringOptions = {
      data: 'data',
      headers: {
        'x-as-from': 'node-call',
      },
    };
    const stringFetchOptions = serializeOptions(stringOptions);

    expect(stringFetchOptions).toEqual({
      credentials: 'same-origin',
      method: 'GET',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'x-as-from': 'node-call',
      },
      body: JSON.stringify(stringOptions.data),
    });
  });
});

describe('utils.serializeUrl', () => {
  test('query string will be append to url', async () => {
    expect(await serializeUrl('http://a.test.com', {
      query: {
        a: 1,
        b: 2,
      },
    })).toBe('http://a.test.com/?a=1&b=2');
    expect(await serializeUrl('http://a.test.com?c=2', {
      query: {
        a: 1,
        b: 2,
      },
    })).toBe('http://a.test.com/?c=2&a=1&b=2');
  });
  test('if fetch method is GET, the data field will be append as query', () => {
    const endpoint = 'http://a.test.com';
    const options = {
      query: {
        a: 1,
        b: 2,
      },
      body: {
        c: 3,
      },
      method: 'GET',
    };

    const url = serializeUrl(endpoint, options);
    expect(url).toBe('http://a.test.com/?a=1&b=2&c=3');
  });
});


describe('utils.applyMiddlewares', () => {
  test('should apply all middlewares', async () => {
    expect.assertions(2);
    const convertEveryNumberToHalf = async data => Object.assign({}, data, {
      numbers: data.numbers.map(number => number / 2),
    });

    const add3toEveryItem = async data => Object.assign({}, data, {
      numbers: data.numbers.map(number => number + 3),
    });

    const data = {
      name: 'Abram',
      email: 'abram.style@gmail.com',
      numbers: [12, 14, 16, 18, 20],
    };
    const middlewares = [convertEveryNumberToHalf, add3toEveryItem];
    const result = await applyMiddlewares(middlewares, data);
    expect(result).toEqual({
      name: 'Abram',
      email: 'abram.style@gmail.com',
      numbers: [9, 10, 11, 12, 13],
    });
    const invalidMiddlewareResult = await applyMiddlewares([null, null], 'xxx');
    expect(invalidMiddlewareResult).toBe('xxx');
  });
});
