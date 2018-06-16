import nock from 'nock';
import fetch from 'isomorphic-fetch';
import { responseParser, resultFilter, resultTransformer } from '../../middlewares';

describe('test responseParser', () => {
  test('responseParser will return data if response is invalid', async () => {
    const fetchData = {
      fetchOptions: {},
      url: null,
      response: null,
      duration: 0,
      error: null,
    };

    const result = await responseParser(fetchData);

    expect(result).toEqual(fetchData);
  });

  test('responseParser will parse json response', async () => {
    expect.assertions(1);
    nock('http://api.callapi.com')
      .get('/author')
      .reply(200, {
        author: 'Abram',
        email: 'abram.style@gmail.com',
      });

    const endpoint = 'http://api.callapi.com/author';
    const response = await fetch(endpoint);
    const fetchData = {
      fetchOptions: {},
      url: endpoint,
      response,
      duration: 0,
      error: null,
    };
    const result = await responseParser(fetchData);

    expect(result).toEqual({
      data: {
        author: 'Abram',
        email: 'abram.style@gmail.com',
      },
      fetchOptions: {},
      url: endpoint,
      response,
      duration: 0,
      error: null,
    });
  });

  test('if the response cannot be parsed, it will return the response as result', async () => {
    expect.assertions(1);
    nock('http://api.callapi.com')
      .get('/unknown')
      .reply(200, 'unknown', {
        'Content-Type': 'application/octet-stream',
      });

    const endpoint = 'http://api.callapi.com/unknown';
    const response = await fetch(endpoint);
    const fetchData = {
      fetchOptions: {},
      url: endpoint,
      response,
      duration: 0,
      error: null,
    };
    const result = await responseParser(fetchData);

    expect(result).toEqual({
      data: response,
      fetchOptions: {},
      url: endpoint,
      response,
      duration: 0,
      error: null,
    });
  });

  test('responseParser will work properly even if received json string', async () => {
    expect.assertions(1);

    nock('http://api.callapi.com')
      .get('/json_string')
      .reply(200, {
        author: 'Abram',
        email: 'abram.style@gmail.com',
      });

    const endpoint = 'http://api.callapi.com/json_string';
    const response = await fetch(endpoint);
    const fetchData = {
      fetchOptions: {},
      url: endpoint,
      response,
      duration: 0,
      error: null,
    };
    const result = await responseParser(fetchData);

    expect(result).toEqual({
      data: {
        author: 'Abram',
        email: 'abram.style@gmail.com',
      },
      fetchOptions: {},
      url: endpoint,
      response,
      duration: 0,
      error: null,
    });
  });

  test('responseParser will parse text', async () => {
    expect.assertions(1);

    const text = 'Laudantium ab fugiat saepe tempora. Mollitia necessitatibus adipisci dolorem enim. Sint minus aut quas quia ad tenetur vel.';
    nock('http://api.callapi.com')
      .get('/string')
      .reply(200, text);

    const endpoint = 'http://api.callapi.com/string';
    const response = await fetch(endpoint);
    const fetchData = {
      fetchOptions: {},
      url: endpoint,
      response,
      duration: 0,
      error: null,
    };
    const result = await responseParser(fetchData);

    expect(result).toEqual({
      data: text,
      fetchOptions: {},
      url: endpoint,
      response,
      duration: 0,
      error: null,
    });
  });

  test('responseParser will parse text', async () => {
    expect.assertions(1);

    const text = 'Laudantium ab fugiat saepe tempora. Mollitia necessitatibus adipisci dolorem enim. Sint minus aut quas quia ad tenetur vel.';
    nock('http://api.callapi.com')
      .get('/string')
      .reply(200, text, {
        'Content-Type:': 'text/plain',
      });

    const endpoint = 'http://api.callapi.com/string';
    const response = await fetch(endpoint);

    const fetchData = {
      fetchOptions: {},
      url: endpoint,
      response,
      duration: 0,
      error: null,
    };
    const result = await responseParser(fetchData);

    expect(result).toEqual({
      data: text,
      fetchOptions: {},
      url: endpoint,
      response,
      duration: 0,
      error: null,
    });
  });

  test('responseParser will parse error', async () => {
    expect.assertions(1);

    const error = 'Laudantium ab fugiat saepe tempora. Mollitia necessitatibus adipisci dolorem enim. Sint minus aut quas quia ad tenetur vel.';
    nock('http://api.callapi.com')
      .get('/error')
      .reply(500, error);

    const endpoint = 'http://api.callapi.com/error';
    const response = await fetch(endpoint);
    const fetchData = {
      fetchOptions: {},
      url: endpoint,
      response,
      duration: 0,
      error: null,
    };
    const parsedResponse = await responseParser(fetchData);

    expect(parsedResponse).toEqual({
      data: error,
      fetchOptions: {},
      url: endpoint,
      response,
      duration: 0,
      error: null,
    });
  });
  test('response parse wont parse invalid response.', async () => {
    expect.assertions(1);
    nock('http://api.callapi.com')
      .get('/unknown')
      .reply(200, 'unknown', {
        'Content-Type': 'application/octet-stream',
      });

    const endpoint = 'http://api.callapi.com/unknown';
    const response = await fetch(endpoint);
    const fetchData = {
      fetchOptions: {},
      url: endpoint,
      response,
      error: null,
    };
    const result = await responseParser(fetchData);

    expect(result).toEqual({
      data: response,
      fetchOptions: {},
      url: endpoint,
      response,
      error: null,
    });
  });
});

describe('test resultTransformer', () => {
  test('resultTransformer will transform result to specify format', async () => {
    expect.assertions(1);

    const replyText = 'Laudantium ab fugiat saepe tempora. Mollitia necessitatibus adipisci dolorem enim. Sint minus aut quas quia ad tenetur vel.';
    nock('http://api.callapi.com')
      .get('/error')
      .reply(500, replyText);

    const endpoint = 'http://api.callapi.com/error';
    const response = await fetch(endpoint);

    const fetchData = {
      fetchOptions: {},
      url: endpoint,
      response,
      duration: 0,
      error: null,
    };

    const parsedResponse = await resultTransformer(fetchData);


    const error = new Error('Internal Server Error');
    error.status = 500;
    error.data = replyText;
    expect(parsedResponse).toEqual({
      fetchOptions: {},
      url: endpoint,
      response,
      duration: 0,
      error,
    });
  });
  test('resultTransformer will skip progress if no response.', async () => {
    const fetchData = { data: 'notTransformed' };
    const result = await resultTransformer(fetchData);

    expect(result).toEqual(fetchData);
  });
});

describe('test resultFilter', () => {
  test('result filter will parse data from fetchData', async () => {
    expect.assertions(1);

    const fetchData = {
      fetchOptions: {},
      url: '',
      response: '',
      duration: 0,
      error: null,
      data: 'data from result',
    };

    const result = await resultFilter(fetchData);
    expect(result).toBe('data from result');
  });

  test('if result contains error, it will throw error', async () => {
    expect.assertions(1);

    const fetchData = {
      fetchOptions: {},
      url: '',
      response: '',
      duration: 0,
      error: new Error('an error'),
      data: 'error occured',
    };

    const error = new Error('an error');
    try {
      await resultFilter(fetchData);
    } catch (e) {
      expect(e).toEqual(error);
    }
  });
});
