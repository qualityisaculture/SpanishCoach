/**
 * @jest-environment jsdom
 */
import React from 'react';
import {
  render,
  initialiseDOM,
  element,
  callPromiseAndWait,
} from '../../reactTestExtensions';
import { getFetchRequests, fetchResponseOk } from '../../builders/fetch';

import DeckReviewLoader from '../../../src/client/anki/DeckReviewLoader';
import DeckReview from '../../../src/client/anki/DeckReview';
import { dueCardsResponseType } from '../../../src/server/routes/anki';
import { Card } from '../../../src/Types';
import { card1, card2, learnCard } from '../../builders/cards';
jest.mock('../../../src/client/anki/DeckReview', () =>
  jest.fn(() => {
    return <div id="drl">DeckReview</div>;
  })
);

describe('DeckReviewLoader', () => {
  const defaultProps = { deckName: 'deck1', onDone: jest.fn() };
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
    // (DeckReview as jest.Mock).mockClear();
  });

  it('should display loading message', () => {
    render(<DeckReviewLoader {...defaultProps} />);
    expect(document.body.innerHTML).toContain('Loading...');
    expect(element('#drl')).toBeNull();
  });

  it('should fetch the deck', () => {
    render(<DeckReviewLoader {...defaultProps} />);
    expect(fetchRequests.length).toBe(1);
    expect(global.fetch).toHaveBeenCalledWith(
      '/dueCards?deck=deck1',
      expect.anything()
    );
  });

  it('should pass the decks to the DeckReview', async () => {
    render(<DeckReviewLoader {...defaultProps} />);
    expect(fetchRequests.length).toBe(1);
    let response: dueCardsResponseType = { due: [card1], new: [card2], learn: [learnCard]};
    await callPromiseAndWait(fetchRequests[0], fetchResponseOk(response));
    expect(DeckReview).toHaveBeenCalledTimes(1);
    expect(DeckReview).toHaveBeenCalledWith(
      { due: [card1], new:[card2], learn:[learnCard], onDone: expect.any(Function) },
      expect.any(Object)
    );
    expect(element('#drl')).not.toBeNull();
  });
});
