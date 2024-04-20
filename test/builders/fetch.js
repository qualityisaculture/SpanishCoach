export let fetchPromiseResolutions = [];
export const fetchResponseOk = (body) => ({
  ok: true,
  json: () => Promise.resolve(body),
});

export const getFetchRequests = (fetchMock) => {
  let promiseResolutions = [];
  fetchMock.mockImplementation(() => {
    return new Promise((resolve) => {
      fetchPromiseResolutions.push(resolve);
      promiseResolutions.push(resolve);
    });
  });
  return promiseResolutions;
};

export const jsonResponse = (response) => {
  return {json: () => new Promise((resolve) => {
    resolve(response);
  })}
}