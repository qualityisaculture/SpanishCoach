import ServerHandler from '../../src/client/ServerHandler';
import { fetchResponseOk, getFetchRequests } from '../builders/fetch';
import { callPromiseAndWait } from '../reactTestExtensions';

describe('serverHandler', function () {
  let fetchMock;
  beforeAll(() => {
    fetchMock = jest.spyOn(global, 'fetch');
  });

  let fetchRequests;
  let callback;

  beforeEach(() => {
    fetchMock.mockClear();
    fetchRequests = getFetchRequests(fetchMock);
    callback = jest.fn();
  });

  let defaultHeaders = {
    method: 'GET',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
  };

  describe('default behaviour', function () {
    it('should send requests to the server', function () {
      const serverHandler = new ServerHandler(callback);
      serverHandler.request('/example?input=hello');
      expect(fetchMock).toHaveBeenCalledWith('/example?input=hello', defaultHeaders)
      serverHandler.request('/example?input=helloworld');
      expect(fetchMock).toHaveBeenCalledWith('/example?input=helloworld', defaultHeaders)
    });
  
    it('should call back with the server response', async function () {
      const serverHandler = new ServerHandler(callback);
      serverHandler.request('/example?input=hello');
      await callPromiseAndWait(fetchRequests[0], fetchResponseOk({ response: 'world' }));
      expect(callback).toHaveBeenCalledWith({ response: 'world' }, true);
    });
  
    it('should state if the callback is NOT for the final request', async function () {
      const serverHandler = new ServerHandler(callback);
      serverHandler.request('/example?input=hello');
      serverHandler.request('/example?input=goodbye');
      expect(fetchRequests.length).toBe(2);
      await callPromiseAndWait(
        fetchRequests[0],
        fetchResponseOk({ response: 'world' })
      );
      expect(callback).toHaveBeenCalledWith({ response: 'world' }, false);
    });
  
    it('should state if the callback IS for the final request', async function () {
      const serverHandler = new ServerHandler(callback);
      serverHandler.request('/example?input=hello');
      serverHandler.request('/example?input=goodbye');
      expect(fetchRequests.length).toBe(2);
      await callPromiseAndWait(
        fetchRequests[1],
        fetchResponseOk({ response: 'world' })
      );
      expect(callback).toHaveBeenCalledWith({ response: 'world' }, true);
    });
  
    it('should not callback updates that come back late', async function () {
      const serverHandler = new ServerHandler(callback);
      serverHandler.request('/example?input=hello');
      serverHandler.request('/example?input=goodbye');
      expect(callback).toHaveBeenCalledTimes(0);
      await callPromiseAndWait(
        fetchRequests[1],
        fetchResponseOk({ response: 'world' })
      );
      expect(callback).toHaveBeenCalledTimes(1);
      await callPromiseAndWait(
        fetchRequests[0],
        fetchResponseOk({ response: 'world' })
      );
      expect(callback).toHaveBeenCalledTimes(1);
    });
  
    it('should not callback anymore after cancel is called', async function () {
      const serverHandler = new ServerHandler(callback);
      serverHandler.request('/example?input=hello');
      serverHandler.cancel();
      await callPromiseAndWait(
        fetchRequests[0],
        fetchResponseOk({ response: 'world' })
      );
      expect(callback).not.toHaveBeenCalled();
    });
  
    it('should callback with response if request is made after cancel', async function () {
      const serverHandler = new ServerHandler(callback);
      serverHandler.request('/example?input=hello');
      serverHandler.cancel();
      serverHandler.request('/example?input=world');
      await callPromiseAndWait(
        fetchRequests[1],
        fetchResponseOk({ response: 'world' })
      );
      expect(callback).toHaveBeenCalledWith({ response: 'world' }, true);
    });
  });

  describe('debounced behaviour', function() {
    beforeAll(() => {
      jest.useFakeTimers();
    });
    afterEach (() => {
      jest.clearAllTimers();
    });
    afterAll(() => {
      jest.useRealTimers();
    });

    it('should send requests to the server after debounce time', function () {
      const serverHandler = new ServerHandler(callback, 300);
      serverHandler.request('/example?input=hello');
      expect(fetchMock).not.toHaveBeenCalled();
      jest.advanceTimersByTime(300);
      expect(fetchMock).toHaveBeenCalledWith('/example?input=hello', defaultHeaders)
    });

    it('should send only request the last request within debounce time', function () {
      const serverHandler = new ServerHandler(callback, 300);
      serverHandler.request('/example?input=hello');
      serverHandler.request('/example?input=goodbye');
      expect(fetchMock).not.toHaveBeenCalled();
      jest.advanceTimersByTime(300);
      expect(fetchMock).toHaveBeenCalledWith('/example?input=goodbye', defaultHeaders)
    });
  
    it('should only callback once with the server response', async function () {
      const serverHandler = new ServerHandler(callback, 300);
      serverHandler.request('/example?input=hello');
      serverHandler.request('/example?input=goodbye');
      expect(fetchMock).not.toHaveBeenCalled();
      jest.advanceTimersByTime(300);
      await callPromiseAndWait(fetchRequests[0], fetchResponseOk({ response: 'world' }));
      expect(callback).toHaveBeenCalledWith({ response: 'world' }, true);
    });

    it('should cancel the previous request if a new request is made within debounce time', async function () {
      const serverHandler = new ServerHandler(callback, 300);
      serverHandler.request('/example?input=hello');
      serverHandler.cancel();
      expect(fetchMock).not.toHaveBeenCalled();
      jest.advanceTimersByTime(300);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should not state as final request if a new request is made within debounce time', async function () {
      const serverHandler = new ServerHandler(callback, 300);
      serverHandler.request('/example?input=hello');
      jest.advanceTimersByTime(300);
      serverHandler.request('/example?input=goodbye');
      await callPromiseAndWait(fetchRequests[0], fetchResponseOk({ response: 'world' }));
      expect(callback).toHaveBeenCalledWith({ response: 'world' }, false);
    });
  })

  describe('streaming behaviour', function() {
    //TODO: This is currently difficult to do as TextDecoderStream is not supported in JSDOM
  });
  
  


});
