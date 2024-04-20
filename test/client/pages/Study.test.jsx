/**
 * @jest-environment jsdom
 */

import React from 'react';
import Study from '../../../src/client/pages/Study';
import { act } from 'react-dom/test-utils';
import {
  initialiseDOM,
  renderAndWait,
  element,
  mockProps,
} from '../../reactTestExtensions';
import DeckListLoader from '../../../src/client/anki/DeckListLoader';
jest.mock('../../../src/client/anki/DeckListLoader', () =>
  jest.fn(() => {
    return <div id="deckListLoader" />;
  })
);
import DeckReviewLoader from '../../../src/client/anki/DeckReviewLoader';
jest.mock('../../../src/client/anki/DeckReviewLoader', () =>
  jest.fn(() => {
    return <div id="deckReviewLoader" />;
  })
);

describe('Study', () => {
  beforeEach(() => {
    initialiseDOM();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('initially loads the DeckListLoader', async () => {
    await renderAndWait(<Study />);
    expect(element('#deckListLoader')).not.toBeNull();
  });

  it('loads the DeckReviewLoader when a deck is selected', async () => {
    await renderAndWait(<Study />); 
    act(() => {mockProps(DeckListLoader).onSelectDeck('deck1')});
    expect(DeckReviewLoader).toHaveBeenCalledWith(
      expect.objectContaining({ deckName: 'deck1' }),
      expect.any(Object)
    );
    expect(element('#deckReviewLoader')).not.toBeNull();
  });

  it('shows the DeckListLoader when the deck is done', async () => {
    await renderAndWait(<Study />);
    act(() => {mockProps(DeckListLoader).onSelectDeck('deck1')});
    act(() => {mockProps(DeckReviewLoader).onDone()});
    expect(element('#deckListLoader')).not.toBeNull();
  });
});
