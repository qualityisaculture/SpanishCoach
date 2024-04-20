/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act } from 'react-dom/test-utils';
import {
  render,
  initialiseDOM,
  element,
  change,
  click,
  button,
} from '../../reactTestExtensions';
import ExampleGenerator from '../../../src/client/pages/ExampleGenerator';
import FetchMockHandler from '../../server/FetchMockHandler';
import { exampleResponseType } from '../../../src/server/routes/translator';
let fetchMockHandler = new FetchMockHandler();
import DeckDropdownLoader from '../../../src/client/anki/DeckDropdownLoader';
import { translationDirections } from '../../../src/Enums';
jest.mock('../../../src/client/anki/DeckDropdownLoader');
const MockDeckDropdownLoader = DeckDropdownLoader as jest.MockedClass<
  typeof DeckDropdownLoader
>;

describe('ExampleGenerator', () => {
  let fetchMock: jest.SpyInstance;
  const input = () => element('input');
  const requestButton = () => button('Request Example');
  const englishExample = () => element('.englishExample');
  const spanishExample = () => element('.spanishExample');
  beforeEach(() => {
    initialiseDOM();
    fetchMock = fetchMockHandler.beforeEach();
  });

  afterEach(() => {
    fetchMockHandler.afterEach();
    MockDeckDropdownLoader.mockClear();
  });

  it('should render an input and a request button', () => {
    render(<ExampleGenerator />);
    expect(input()).not.toBeNull();
    expect(requestButton()).not.toBeNull();
  });

  it('should disable the request button when the input is empty', () => {
    render(<ExampleGenerator />);
    expect(requestButton().disabled).toBe(true);
  });

  it('should request an example from the server on click', () => {
    render(<ExampleGenerator />);
    change(input(), 'hola');
    click(requestButton());
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/example?requiredPhrase=hola',
      expect.any(Object)
    );
  });

  it('should disable the input and request button while waiting for a response', () => {
    render(<ExampleGenerator />);
    change(input(), 'hola');
    click(requestButton());
    expect(input().disabled).toBe(true);
    expect(requestButton().disabled).toBe(true);
  });

  it('should display the example when the server responds', async () => {
    render(<ExampleGenerator />);
    change(input(), 'hola');
    click(requestButton());
    let response: exampleResponseType = {
      example: 'hola, que tal?',
      translation: 'hello, how are you?',
    };
    await fetchMockHandler.resolvePromise(0, response);
    expect(englishExample().textContent).toBe('hello, how are you?');
    expect(spanishExample().textContent).toBe('hola, que tal?');
  });

  it('should enable the input and request button after a response', async () => {
    render(<ExampleGenerator />);
    change(input(), 'hola');
    click(requestButton());
    let response: exampleResponseType = {
      example: 'hola, que tal?',
      translation: 'hello, how are you?',
    };
    await fetchMockHandler.resolvePromise(0, response);
    expect(input().disabled).toBe(false);
    expect(requestButton().disabled).toBe(false);
  });

  it('should save the example onSaveToDeck clicked', async () => {
    render(<ExampleGenerator />);
    change(input(), 'hola');
    click(requestButton());
    let response: exampleResponseType = {
      example: 'hola, que tal?',
      translation: 'hello, how are you?',
    };
    await fetchMockHandler.resolvePromise(0, response);
    act(() => {
      MockDeckDropdownLoader.mock.instances[0].props.onSaveToDeck(
        'deck',
        translationDirections.EnglishToSpanish,
        jest.fn()
      );
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith('/addCard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deckName: 'deck',
        front: 'hello, how are you?',
        back: 'hola, que tal?',
      }),
    });
  });
});
