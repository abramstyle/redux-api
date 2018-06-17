async function responseParser(data) {
  const resultData = Object.assign({}, data);
  const { response } = data;
  if (!response) {
    return data;
  }

  const { headers } = response;
  const typeHeader = (headers.get('content-type') || 'text/plain').split(';');
  const contentType = typeHeader[0];
  let result = null;
  if (contentType === 'application/json') {
    result = await response.json();
  } else if (contentType === 'text/plain') {
    const text = await response.text();
    try {
      result = JSON.parse(text);
    } catch (e) {
      result = text;
    }
  } else {
    result = response || {};
  }

  Object.assign(resultData, {
    data: result,
  });

  return resultData;
}

async function resultTransformer(data) {
  const { response } = data;
  if (!response) {
    return data;
  }
  const { ok: isSuccess } = response;
  const fetchData = Object.assign({}, data);

  if (!isSuccess) {
    const error = new Error(response.statusText);
    error.response = response;
    error.status = response.status;
    error.data = data.data;
    Object.assign(fetchData, {
      error,
    });
  }

  return fetchData;
}

async function resultFilter(data) {
  const { data: result, error } = data;
  if (error) {
    throw error;
  }
  return result;
}

export { resultFilter, responseParser, resultTransformer };
