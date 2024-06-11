/**
 * @jest-environment jsdom
 */

//Needed because matchMedia is not implemented in jsdom
//https://jestjs.io/docs/29.4/manual-mocks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

import React from 'react';
import { Translator } from '../../src/client/Translator';
import { act } from 'react-dom/test-utils';
const { fetchResponseOk, getFetchRequests } = require('../builders/fetch');
import {
  element,
  initialiseDOM,
  render,
  form,
  span,
  textInput,
  change,
  click,
  changeAndWait,
  callPromiseAndWait,
  clickAndWait,
} from '../reactTestExtensions';

import ChatDialog from '../../src/client/components/ChatDialog';
import { chatMessageType } from '../../src/server/routes/translator';
jest.mock('../../src/client/components/ChatDialog', () =>
  jest.fn(() => {
    return <div id="mockChatDialog">Mock Chat Dialog</div>;
  })
);
const mockChatDialog = ChatDialog as jest.MockedClass<typeof ChatDialog>;

describe('Translator', () => {
  const outputField = () => element('.ant-collapse-header-text');
  const wait300ms = async () => {
    //This needs to be called in act because the mock server response
    //is a different call stack from the one that triggered by the event
    return act(async () => jest.advanceTimersByTime(301));
  };
  const defaultProps = {
    onTranslation: jest.fn(),
    focusRef: React.createRef(),
  };
  let fetchMock;
  beforeAll(() => {
    fetchMock = jest.spyOn(global, 'fetch');
    jest.useFakeTimers();
  });

  beforeEach(() => {
    initialiseDOM();
    fetchMock.mockClear();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('has a form', () => {
    render(<Translator {...defaultProps} />);
    expect(form()).not.toBeNull();
  });

  it('has an text field', () => {
    render(<Translator {...defaultProps} />);
    expect(textInput()).not.toBeNull();
    expect(textInput().textContent).toEqual('');
  });

  it('has a placeholder asking you to enter a phrase', () => {
    render(<Translator {...defaultProps} />);
    expect(textInput()).not.toBeNull();
    expect(textInput().placeholder).toEqual('Enter a phrase to translate');
  });

  it('has an output span', () => {
    render(<Translator {...defaultProps} />);
    expect(outputField()).not.toBeNull();
    expect(outputField().textContent).toEqual('');
  });

  it('can be loaded with a default input', () => {
    render(<Translator {...defaultProps} input={'Hola'} />);
    expect(textInput().textContent).toEqual('Hola');
  });

  it('can be loaded with a default output', () => {
    render(<Translator {...defaultProps} input={'Hola'} output={'Hello'} />);
    expect(outputField().textContent).toEqual('Hello');
  });

  describe('server debounce', () => {
    it('passes the input to the server 300ms after text is changed', async () => {
      fetchMock.mockResolvedValue(fetchResponseOk({}));
      render(<Translator {...defaultProps} />);
      expect(global.fetch).not.toHaveBeenCalled();
      await changeAndWait(textInput(), 'Hola');
      await wait300ms();
      expect(global.fetch).toHaveBeenCalledWith(
        '/translate?spanish=Hola',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('does not call the server if the text is blank', async () => {
      fetchMock.mockResolvedValue(fetchResponseOk({}));
      render(<Translator {...defaultProps} />);
      await changeAndWait(textInput(), 'Hola');
      expect(global.fetch).not.toHaveBeenCalled();
      await changeAndWait(textInput(), '');
      await wait300ms();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('displays a loading message when input set and no value received yet', async () => {
      fetchMock.mockResolvedValue(fetchResponseOk({ english: 'Hello' }));
      render(<Translator {...defaultProps} />);
      await changeAndWait(textInput(), 'Hola');
      expect(outputField().textContent).toEqual('Loading...');
    });

    it('displays the english translation on server response', async () => {
      fetchMock.mockResolvedValue(fetchResponseOk({ english: 'Hello' }));
      render(<Translator {...defaultProps} />);
      await changeAndWait(textInput(), 'Hola');
      await wait300ms();
      expect(outputField().textContent).toEqual('Hello');
    });

    it('displays the ellipses if previous value is received but new value is waiting', async () => {
      fetchMock.mockResolvedValue(fetchResponseOk({ english: 'Hello' }));
      render(<Translator {...defaultProps} />);
      await changeAndWait(textInput(), 'Hola');
      await wait300ms();
      expect(outputField().textContent).toEqual('Hello');
      fetchMock.mockResolvedValue(
        fetchResponseOk({ english: 'Hello, how are you?' })
      );
      await changeAndWait(textInput(), 'Hola, Que Tal');
      expect(outputField().textContent).toEqual('Hello...');
      await wait300ms();
      expect(outputField().textContent).toEqual('Hello, how are you?');
    });

    it('displays the intermediate value if response returned while waiting for a newer response', async () => {
      const fetchRequests = getFetchRequests(fetchMock);
      render(<Translator {...defaultProps} />);
      await changeAndWait(textInput(), 'Hola');
      await wait300ms();
      await changeAndWait(textInput(), 'Hola, Que Tal');
      await callPromiseAndWait(
        fetchRequests[0],
        fetchResponseOk({ english: 'Hello' })
      );
      expect(outputField().textContent).toEqual('Hello...');
      await wait300ms();
      await callPromiseAndWait(
        fetchRequests[1],
        fetchResponseOk({ english: 'Hello, how are you?' })
      );
      expect(outputField().textContent).toEqual('Hello, how are you?');
    });

    it('displays the latest value if response is returned out of order', async () => {
      const fetchRequests = getFetchRequests(fetchMock);
      render(<Translator {...defaultProps} />);
      await changeAndWait(textInput(), 'Hola');
      await wait300ms();
      await changeAndWait(textInput(), 'Hola, Que Tal');
      await wait300ms();
      await callPromiseAndWait(
        fetchRequests[1],
        fetchResponseOk({ english: 'Hello, how are you?' })
      );
      expect(outputField().textContent).toEqual('Hello, how are you?');
      await callPromiseAndWait(
        fetchRequests[0],
        fetchResponseOk({ english: 'Hello' })
      );
      expect(outputField().textContent).toEqual('Hello, how are you?');
    });
  });

  it('clears the english translation when phrase is cleared', async () => {
    const fetchRequests = getFetchRequests(fetchMock);
    render(<Translator {...defaultProps} />);
    await changeAndWait(textInput(), 'Hola');
    await wait300ms();
    await callPromiseAndWait(
      fetchRequests[0],
      fetchResponseOk({ english: 'Hello, how are you?' })
    );
    await changeAndWait(textInput(), '');
    expect(outputField().textContent).toEqual('');
  });

  it('notifies onTranslation when translation is received', async () => {
    fetchMock.mockResolvedValue(fetchResponseOk({ english: 'Hello' }));
    const onTranslation = jest.fn();
    render(<Translator {...defaultProps} onTranslation={onTranslation} />);
    await changeAndWait(textInput(), 'Hola');
    await wait300ms();
    expect(onTranslation).toHaveBeenCalledWith({
      spanish: 'Hola',
      english: 'Hello',
    });
  });

  it('updates onTranslation when translation is changed', async () => {
    fetchMock.mockResolvedValue(fetchResponseOk({ english: 'Hello' }));
    const onTranslation = jest.fn();
    render(<Translator {...defaultProps} onTranslation={onTranslation} />);
    await changeAndWait(textInput(), 'Hola');
    await wait300ms();

    fetchMock.mockResolvedValue(fetchResponseOk({ english: 'Goodbye' }));
    await changeAndWait(textInput(), 'Adios');
    await wait300ms();
    expect(onTranslation).toHaveBeenCalledWith({
      spanish: 'Adios',
      english: 'Goodbye',
    });
  });

  it('focuses the input when focusRef is set', async () => {
    const focusRef = React.createRef();
    render(<Translator {...defaultProps} focusRef={focusRef} />);
    await changeAndWait(textInput(), 'Hola');
    act(() => {
      //@ts-ignore
      focusRef.current.focus({ cursor: 'all' });
    });
    expect(textInput().selectionStart).toEqual(0);
    expect(textInput().selectionEnd).toEqual(4);
  });

  describe('swap translation direction', () => {
    const swapButton = () => element('.ant-switch');
    beforeEach(() => {
      getFetchRequests(fetchMock);
    });

    it('requests a translation in the opposite direction when input changes', async () => {
      render(<Translator {...defaultProps} />);
      click(swapButton());
      await changeAndWait(textInput(), 'Hello');
      await wait300ms();
      expect(global.fetch).toHaveBeenCalledWith(
        '/translate?english=Hello',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('puts the output into the input field when swap button is clicked', async () => {
      render(<Translator {...defaultProps} input="Hola" output="Hello" />);
      click(swapButton());
      expect(textInput().textContent).toEqual('Hello');
    });

    it('requests a translation in the opposite direction when swap is clicked', async () => {
      render(<Translator {...defaultProps} input="Hola" output="Hello" />);
      click(swapButton());
      await wait300ms();
      expect(global.fetch).toHaveBeenCalledWith(
        '/translate?english=Hello',
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(textInput().textContent).toEqual('Hello');
      expect(outputField().textContent).toEqual('Loading...');
    });

    it('does not request a translation if the input is now blank', async () => {
      render(<Translator {...defaultProps} input="Hola" />);
      click(swapButton());
      await wait300ms();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('sets the output to the spanish translation after swap', async () => {
      fetchMock.mockResolvedValue(fetchResponseOk({ spanish: 'Hola' }));
      render(<Translator {...defaultProps} input="Hola" output="Hello" />);
      click(swapButton());
      await wait300ms();
      expect(global.fetch).toHaveBeenCalledWith(
        '/translate?english=Hello',
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(textInput().textContent).toEqual('Hello');
      expect(outputField().textContent).toEqual('Hola');
    });

    it('calls back onTranslation with the languages in the correct direction', async () => {
      fetchMock.mockResolvedValue(fetchResponseOk({ spanish: 'Hola' }));
      const onTranslation = jest.fn();
      render(
        <Translator
          {...defaultProps}
          input="Hola"
          output="Hello"
          onTranslation={onTranslation}
        />
      );
      click(swapButton());
      await wait300ms();
      expect(global.fetch).toHaveBeenCalledWith(
        '/translate?english=Hello',
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(textInput().textContent).toEqual('Hello');
      expect(outputField().textContent).toEqual('Hola');
      expect(onTranslation).toHaveBeenCalledWith({
        spanish: 'Hola',
        english: 'Hello',
      });
    });

    it('cancels all server requests when direction is switched', () => {});

    it('ignores any server responses that are received after change', () => {});
  });

  describe('translation expander', () => {
    const expandButton = () => element('.ant-collapse-expand-icon');
    const expandContent = () => element('.ant-collapse-content-box');

    let fetchRequests;
    beforeEach(async () => {
      // fetchMock.mockResolvedValueOnce(fetchResponseOk({ english: 'Hello' }));
      fetchRequests = getFetchRequests(fetchMock);
      render(<Translator {...defaultProps} />);
      await changeAndWait(textInput(), 'Hola');
      await wait300ms();
      await callPromiseAndWait(
        fetchRequests[0],
        fetchResponseOk({ english: 'Hello' })
      );
    });

    it('requests a complex translation when expanded', async () => {
      await clickAndWait(expandButton());
      expect(global.fetch).toHaveBeenCalledWith(
        '/complextranslate?spanish=Hola',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('displays a loading message when expanded', async () => {
      await clickAndWait(expandButton());
      expect(expandContent().textContent).toEqual('Loading...');
    });

    it('displays a chat dialog when value received', async () => {
      await clickAndWait(expandButton());
      await wait300ms();
      await callPromiseAndWait(
        fetchRequests[1],
        fetchResponseOk({
          english: 'Hello',
          partOfSpeech: 'interjection',
          longDescription: 'long description',
        })
      );
      let expectedMessages: chatMessageType[] = [
        {
          message: 'Hola',
          type: 'human',
        },
        {
          message: `long description`,
          type: 'bot',
        },
      ];
      expect(mockChatDialog).toHaveBeenCalledWith(
        { initialMessages: expectedMessages },
        expect.anything()
      );
      expect(expandContent()).toContainText('Mock Chat Dialog');
    });

    it('collapses when new translation is requested', async () => {
      await clickAndWait(expandButton());
      await changeAndWait(textInput(), 'Adios');
      expect(element('.ant-collapse-content-hidden')).not.toBeNull();
    });
  });
});
