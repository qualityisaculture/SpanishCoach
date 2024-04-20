import { callPromiseAndWait } from '../reactTestExtensions';
import { fetchResponseOk } from '../builders/fetch';
import {act} from 'react-dom/test-utils';

export default class FetchMockHandler {
  mock: jest.SpyInstance | undefined;
  promiseResolutions: any[];
  constructor() {
    this.promiseResolutions = [];
  }

  beforeEach = (): jest.SpyInstance => {
    this.mock = jest.spyOn(global, 'fetch');
    this.mock.mockImplementation(() => {
      return new Promise((resolve) => {
        this.promiseResolutions.push(resolve);
      });
    });
    return this.mock;
  };
  afterEach() {
    this.mock?.mockReset();
    return this.flushAllPromises();
  }

  resolvePromise = async (promiseIndex: number, response: any) => {
    return callPromiseAndWait(this.promiseResolutions[promiseIndex], fetchResponseOk(response));
  }
    

  async flushAllPromises() {
    while (this.promiseResolutions.length > 0) {
      await callPromiseAndWait(this.promiseResolutions.shift(), fetchResponseOk({}));
    }
    this.promiseResolutions = [];
    return Promise.resolve();
  }
}
