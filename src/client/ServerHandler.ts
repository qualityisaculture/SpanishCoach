import * as _ from 'lodash';

type Callback = (json: any, isFinal: boolean) => void;
export default class ServerHandler {
  callback: Callback;
  finalRequestIndex: number;
  highestRequestIndexReceived: number;
  debouncedServerRequest: any;
  waitingDebounce: boolean;
  streamedMessage: string;
  constructor(callback: Callback, debounceMillis: number = 0) {
    this.callback = callback;
    this.finalRequestIndex = 0;
    this.highestRequestIndexReceived = 0;
    this.debouncedServerRequest =
      debounceMillis > 0
        ? _.debounce(this.serverRequest, debounceMillis)
        : this.serverRequest;
    this.waitingDebounce = false;
    this.streamedMessage = '';
  }

  async serverRequest(query) {
    this.waitingDebounce = false;
    let index = ++this.finalRequestIndex;
    const response = await global.fetch(query, {
      method: 'GET',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await response.json();

    if (index > this.highestRequestIndexReceived) {
      this.highestRequestIndexReceived = index;
    }
    if (index < this.highestRequestIndexReceived) {
      return;
    }
    let isFinal = index === this.finalRequestIndex;
    this.callback(json, isFinal && !this.waitingDebounce);
  }

  async request(query) {
    this.waitingDebounce = true;
    this.debouncedServerRequest(query);
  }

  async requestStream(query: string) {
    this.streamedMessage = '';
    const response = await fetch(query);
    if (!response.body) {
      throw new Error('Response body is null');
    }
    const reader = response.body
      .pipeThrough(new TextDecoderStream())
      .getReader();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      this.streamedMessage += value;
      this.callback(this.streamedMessage, false);
    }
    this.callback(this.streamedMessage, true);
  }

  cancel() {
    this.finalRequestIndex++;
    this.highestRequestIndexReceived = this.finalRequestIndex;
    if (this.debouncedServerRequest.cancel) {
      this.debouncedServerRequest.cancel();
    }
  }
}
