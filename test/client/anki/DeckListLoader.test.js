/**
 * @jest-environment jsdom
 */

import React from 'react';
import {
  render,
  initialiseDOM,
  callPromiseAndWait,
} from '../../reactTestExtensions';
import { fetchResponseOk, getFetchRequests } from '../../builders/fetch';
import { decksWithStats, deckWithStats1, deckWithStats2} from '../../builders/anki';
import DeckListLoader from '../../../src/client/anki/DeckListLoader';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
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

describe('DeckListLoader', () => {
  let fetchMock;
  let fetchRequests;
  beforeAll(() => {
    fetchMock = jest.spyOn(global, 'fetch');
  });

  beforeEach(() => {
    initialiseDOM();
    fetchRequests = getFetchRequests(fetchMock);
  });

  afterEach(() => {
    fetchMock.mockClear();
  });

  afterAll(() => {
    fetchMock.mockRestore();
  });

  it('displays a loading message on load', () => {
    render(<DeckListLoader />);
    expect(document.body.innerHTML).toContain('Loading...');
  });

  it('requests the list of decks from the server', () => {
    render(<DeckListLoader />);
    expect(global.fetch).toHaveBeenCalledWith(
      '/allDecksWithStats',
      expect.any(Object)
    );
  });

  it('displays the list of decks', async () => {
    render(<DeckListLoader />);
    await callPromiseAndWait(fetchRequests[0], fetchResponseOk(decksWithStats));
    expect(document.body.innerHTML).toContain(deckWithStats1.name);
    expect(document.body.innerHTML).toContain(deckWithStats2.name);
  });

  it('calls back with the selected deck', async () => {
    let callback = jest.fn();
    render(<DeckListLoader onSelectDeck={callback} />);
    await callPromiseAndWait(fetchRequests[0], fetchResponseOk(decksWithStats));
    document.querySelector(`.ant-list-item`).click();
    expect(callback).toHaveBeenCalledWith(deckWithStats1.name);
  });
});
