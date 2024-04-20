import AnkiClient, {
  AnkiConnectDeckNamesResponseType,
  AnkiConnectDecksWithStatsResponse,
  AnkiConnectAnswerCardsResponseType,
  AnkiConnectAddNoteResponseType,
  AnkiConnectFindCardsResponseType,
  AnkiConnectCardInfoResponseType,
} from '../../src/server/AnkiClient';
import FetchMockHandler from './FetchMockHandler';
const fetchMock = new FetchMockHandler();

import { decksWithStats, exampleCard, exampleNewCard, exampleNewFailedLearnCard, exampleNewSuccessLearnCard } from '../builders/anki';
import { Card } from '../../src/Types'
import { newCard } from '../builders/cards';

describe('AnkiClient', () => {
  let ankiClient: AnkiClient;
  let fetch: jest.SpyInstance;
  beforeEach(() => {
    ankiClient = new AnkiClient();
    fetch = fetchMock.beforeEach();
  });
  afterEach(() => {
    fetchMock.afterEach();
  });

  function expectPostToAnki(body: any) {
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8765',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(body),
      })
    );
  }

  type serverResponseType =
    | AnkiConnectDeckNamesResponseType
    | AnkiConnectDecksWithStatsResponse
    | AnkiConnectAnswerCardsResponseType
    | AnkiConnectAddNoteResponseType
    | AnkiConnectFindCardsResponseType
    | AnkiConnectCardInfoResponseType;

  function ankiResponse(
    response: serverResponseType,
    promiseIndex: number = 0
  ) {
    fetchMock.resolvePromise(promiseIndex, response);
  }

  describe('getDeckNames', () => {
    it('should call anki', async () => {
      ankiClient.getDeckNames();
      expectPostToAnki({ action: 'deckNames', version: 6 });
    });

    it('should return the deck names', async () => {
      const promise = ankiClient.getDeckNames();
      ankiResponse({ result: ['deck1', 'deck2'], error: null });
      let result = await promise;
      expect(result).toEqual(['deck1', 'deck2']);
    });
  });

  describe('getDeckStats', () => {
    it('should call anki', async () => {
      ankiClient.getDeckStats(['deck1', 'deck2']);
      expectPostToAnki({
        action: 'getDeckStats',
        version: 6,
        params: { decks: ['deck1', 'deck2'] },
      });
    });

    it('should return the deck stats', async () => {
      const promise = ankiClient.getDeckStats(['deck1', 'deck2']);
      ankiResponse(decksWithStats);
      const result = await promise;
      expect(result).toEqual(decksWithStats.result);
    });
  });

  describe('addCard', () => {
    it('should call anki', async () => {
      ankiClient.addCard('deck1', 'front', 'back');
      expectPostToAnki({
        action: 'addNote',
        version: 6,
        params: {
          note: {
            deckName: 'deck1',
            modelName: 'Basic',
            fields: {
              Front: 'front',
              Back: 'back',
            },
          },
        },
      });
    });

    it('should return success on success', async () => {
      const promise = ankiClient.addCard('deck1', 'front', 'back');
      ankiResponse({ result: 1709723194261, error: null });
      const result = await promise;
      expect(result.success).toEqual(true);
    });

    it('should return error on error', async () => {
      const promise = ankiClient.addCard('deck1', 'front', 'back');
      ankiResponse({ result: null, error: 'example error' });
      const result = await promise;
      expect(result.success).toEqual(false);
      expect(result.message).toEqual('example error');
    });
  });

  describe('getDueCards', () => {
    it('should call anki', async () => {
      ankiClient.getDueCards('deck1');
      expectPostToAnki({
        action: 'findCards',
        version: 6,
        params: { query: 'deck:deck1 is:due -is:learn' },
      });
      ankiResponse({ result: [123, 124], error: null });
    });

    it('should replace spaces with underscores', async () => {
      ankiClient.getDueCards('deck 1 2');
      expectPostToAnki({
        action: 'findCards',
        version: 6,
        params: { query: 'deck:deck_1_2 is:due -is:learn' },
      });
      ankiResponse({ result: [123, 124], error: null });
    });

    it('should return the due card ids', async () => {
      const promise = ankiClient.getDueCards('deck1');
      ankiResponse({ result: [123, 124], error: null });
      const result = await promise;
      expect(result.sort((l,r) => l-r)).toEqual([123, 124]);
    });
  });

  describe('getLearnCards', () => {
    it('should call anki', async () => {
      ankiClient.getLearnCards('deck1');
      expectPostToAnki({
        action: 'findCards',
        version: 6,
        params: { query: 'deck:deck1 is:learn' },
      });
    });

    it('should replace spaces with underscores', async () => {
      ankiClient.getLearnCards('deck 1 2');
      expectPostToAnki({
        action: 'findCards',
        version: 6,
        params: { query: 'deck:deck_1_2 is:learn' },
      });
    });

    it('should return the learn card ids', async () => {
      const promise = ankiClient.getLearnCards('deck1');
      ankiResponse({ result: [123, 124], error: null });
      const result = await promise;
      expect(result).toEqual([123, 124]);
    });
  });

  describe('getNewCards', () => {
    it('should call anki', async () => {
      ankiClient.getNewCards('deck1');
      ankiResponse({ result: [123, 124], error: null });
      expectPostToAnki({
        action: 'findCards',
        version: 6,
        params: { query: 'deck:deck1 is:new' },
      });
    });

    it('should replace spaces with underscores', async () => {
      ankiClient.getNewCards('deck 1 2');
      ankiResponse({ result: [123, 124], error: null });
      expectPostToAnki({
        action: 'findCards',
        version: 6,
        params: { query: 'deck:deck_1_2 is:new' },
      });
    });

    it('should return the new card ids', async () => {
      const promise = ankiClient.getNewCards('deck1');
      ankiResponse({ result: [123, 124], error: null });
      const result = await promise;
      expect(result.sort((left, right) => left-right)).toEqual([123, 124]);
    });
  });

  describe('getCardInfo', () => {
    it('should call anki', async () => {
      ankiClient.getCardInfo([123, 124]);
      ankiResponse({ result: [exampleCard], error: null });
      expectPostToAnki({
        action: 'cardsInfo',
        version: 6,
        params: { cards: [123, 124] },
      });
    });

    it('should return the card info', async () => {
      const promise = ankiClient.getCardInfo([123, 124]);
      ankiResponse({ result: [exampleCard], error: null });
      const result = await promise;
      let firstCard = result[0];
      expect(firstCard.id).toEqual(exampleCard.cardId);
      expect(firstCard.noteId).toEqual(exampleCard.note);
      expect(firstCard.front).toEqual(exampleCard.fields.Front.value);
      expect(firstCard.back).toEqual(exampleCard.fields.Back.value);
      expect(firstCard.isNew).toEqual(true);
      expect(firstCard.leftToStudy).toEqual(exampleCard.left);
    });

    it('should return due with milliseconds if due greater than 100000', async () => {
      const promise = ankiClient.getCardInfo([123, 124]);
      let card = { ...exampleCard, due: 1711901847 };
      ankiResponse({ result: [card], error: null });
      const result = await promise;
      expect(result[0].due).toEqual(1711901847000);
    });

    describe('interval calculations', () => {
      it('should return <1m, <6m, <10m, 5d when card is brand new', async () => {
        const promise = ankiClient.getCardInfo([123]);
        ankiResponse({ result: [exampleNewCard], error: null });
        const result = await promise;
        let firstCard = result[0];
        expect(firstCard.failInterval).toEqual('<1m');
        expect(firstCard.hardInterval).toEqual('<6m');
        expect(firstCard.mediumInterval).toEqual('<10m');
        expect(firstCard.easyInterval).toEqual('5d');
      });
    });

    it('should return <1m, <6m, <10m, 3d when card has just entered learn queue and 2 left', async () => {
      const promise = ankiClient.getCardInfo([123]);
      ankiResponse({ result: [exampleNewFailedLearnCard], error: null });
      const result = await promise;
      let firstCard = result[0];
      expect(firstCard.failInterval).toEqual('<1m');
      expect(firstCard.hardInterval).toEqual('<6m');
      expect(firstCard.mediumInterval).toEqual('<10m');
      expect(firstCard.easyInterval).toEqual('4d');
    })

    it('should return <1m, <6m, 1d, 4d when card has just entered learn queue and 1 left', async () => {
      const promise = ankiClient.getCardInfo([123]);
      ankiResponse({ result: [exampleNewSuccessLearnCard], error: null });
      const result = await promise;
      let firstCard = result[0];
      expect(firstCard.failInterval).toEqual('<1m');
      expect(firstCard.hardInterval).toEqual('<6m');
      expect(firstCard.mediumInterval).toEqual('1d');
      expect(firstCard.easyInterval).toEqual('4d');
    })


  });

  describe('setCardAnswered', () => {
    it('should call anki', async () => {
      ankiClient.setCardAnswered(123, 2);
      expectPostToAnki({
        action: 'answerCards',
        version: 6,
        params: {
          answers: [{ cardId: 123, ease: 2 }],
        },
      });
    });

    it('should return success on success', async () => {
      const promise = ankiClient.setCardAnswered(123, 2);
      ankiResponse({ result: [true], error: null });
      const result = await promise;
      expect(result).toEqual({ success: true, message: null });
    });

    it('should return error on error', async () => {
      const promise = ankiClient.setCardAnswered(123, 2);
      ankiResponse({ result: null, error: 'example error' });
      const result = await promise;
      expect(result).toEqual({ success: false, message: 'example error' });
    });
  });

  describe('updateCard', () => {
    it('should call anki', async () => {
      ankiClient.updateCard(1514547547030, 'new front content', 'new back content');
      expectPostToAnki({
        action: 'updateNoteFields',
        version: 6,
        params: {
          note: {
            id: 1514547547030,
            fields: {
              Front: 'new front content',
              Back: 'new back content',
            }
          },
        },
      });
    });

    it('should return success on success', async () => {
      const promise = ankiClient.updateCard(1514547547030, 'new front content', 'new back content');
      ankiResponse({ result: [true], error: null });
      const result = await promise;
      expect(result).toEqual({ success: true, message: null });
    });

    it('should return error on error', async () => {
      const promise = ankiClient.updateCard(1514547547030, 'new front content', 'new back content');
      ankiResponse({ result: null, error: 'example error' });
      const result = await promise;
      expect(result).toEqual({ success: false, message: 'example error' });
    });
  });
});
