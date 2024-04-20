const request = require('supertest');
const App = require('../../src/server/server');
import {
  decks,
  decksWithStats,
  noteBuilder,
  cards,
  cards2,
  cards3,
  cardsInfo,
} from '../builders/anki';
import { dueCardsResponseType } from '../../src/server/routes/anki';
const { fetchResponseOk } = require('../builders/fetch.js');
jest.mock('../../src/server/LangChainHandler.ts');
const {
  expectJson,
  requestBodyAsync,
  setApp,
} = require('./supertestExtensions');

import AnkiClient from '../../src/server/AnkiClient';
import e from 'express';
import { Card } from '../../src/Types';
jest.mock('../../src/server/AnkiClient');
let AnkiClientMock = AnkiClient as jest.MockedClass<typeof AnkiClient>;

let exampleCards: Card[] = [
  {
    id: 1,
    noteId: 10,
    front: 'Hola',
    back: 'Hello',
    easyInterval: 'easy',
    mediumInterval: 'medium',
    hardInterval: 'hard',
    failInterval: 'fail',
    due: null,
    isNew: false,
    leftToStudy: 0
  },
  {
    id: 2,
    noteId: 11,
    front: 'Adios',
    back: 'Goodbye',
    easyInterval: 'easy',
    mediumInterval: 'medium',
    hardInterval: 'hard',
    failInterval: 'fail',
    due: null,
    isNew: false,
    leftToStudy: 0
  },

  {
    id: 3,
    noteId: 12,
    front: 'Hola',
    back: 'Hello',
    easyInterval: 'easy',
    mediumInterval: 'medium',
    hardInterval: 'hard',
    failInterval: 'fail',
    due: null,
    isNew: true,
    leftToStudy: 0
  },
  {
    id: 4,
    noteId: 13,
    front: 'Adios',
    back: 'Goodbye',
    easyInterval: 'easy',
    mediumInterval: 'medium',
    hardInterval: 'hard',
    failInterval: 'fail',
    due: null,
    isNew: false,
    leftToStudy: 1
  },

  {
    id: 5,
    noteId: 14,
    front: 'Hola',
    back: 'Hello',
    easyInterval: 'easy',
    mediumInterval: 'medium',
    hardInterval: 'hard',
    failInterval: 'fail',
    due: null,
    isNew: false,
    leftToStudy: 0
  },
  {
    id: 6,
    noteId: 15,
    front: 'Adios',
    back: 'Goodbye',
    easyInterval: 'easy',
    mediumInterval: 'medium',
    hardInterval: 'hard',
    failInterval: 'fail',
    due: null,
    isNew: false,
    leftToStudy: 0
  },
];

let exampleNewCards: Card[] = exampleCards.slice(0, 2);
let exampleLearnCards: Card[] = exampleCards.slice(2, 4);
let exampleDueCards: Card[] = exampleCards.slice(4, 6);

function expectFetch(expectedBody) {
  expect(global.fetch).toHaveBeenCalledWith(
    'http://localhost:8765',
    expect.objectContaining({
      method: 'POST',
      body: expectedBody,
    })
  );
}

describe('App', () => {
  let app;

  const prepareMockAnkiResponse = (responseBody) => {
    fetchMock.mockResolvedValue(fetchResponseOk(responseBody));
  };

  const defaultRequestBody = {
    deckName: 'deck1',
    front: 'Hola',
    back: 'Hello',
  };

  const defaultExpectedNote = noteBuilder(
    defaultRequestBody.deckName,
    defaultRequestBody.front,
    defaultRequestBody.back
  );

  let fetchMock;

  beforeEach(() => {
    app = App();
    setApp(app);
    fetchMock = jest.spyOn(global, 'fetch');
    fetchMock.mockResolvedValue(fetchResponseOk());
    fetchMock.mockClear();
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  describe('GET /decks', () => {
    it('GET /decks calls deckNames action', async () => {
      await request(app).get('/decks');
      expect(AnkiClientMock.mock.instances[0].getDeckNames).toHaveBeenCalled();
    });

    it('GET /decks --> array of decks', async () => {
      AnkiClientMock.mock.instances[0].getDeckNames = jest
        .fn()
        .mockResolvedValue(decks.result);
      await request(app).get('/decks');
      return expectJson('/decks', null, { result: decks.result });
    });
  });

  describe('GET /allDecksWithStats', () => {
    it('requests a list of all decks', async () => {
      await request(app).get('/allDecksWithStats');
      expect(AnkiClientMock.mock.instances[0].getDeckNames).toHaveBeenCalled();
    });

    it('GET /allDecksWithStats calls getDeckStats action', async () => {
      AnkiClientMock.mock.instances[0].getDeckNames = jest
        .fn()
        .mockResolvedValue(decks.result);
      await request(app).get('/allDecksWithStats');
      expect(
        AnkiClientMock.mock.instances[0].getDeckStats
      ).toHaveBeenCalledWith(decks.result);
    });

    it('GET /allDecksWithStats --> array of decks', () => {
      AnkiClientMock.mock.instances[0].getDeckNames = jest
        .fn()
        .mockResolvedValue(decks.result);
      AnkiClientMock.mock.instances[0].getDeckStats = jest
        .fn()
        .mockResolvedValue(decksWithStats.result);
      return expectJson('/allDecksWithStats', null, decksWithStats);
    });
  });

  describe('POST /addCard', () => {
    it('calls addNote action', async () => {
      AnkiClientMock.mock.instances[0].addCard = jest.fn().mockResolvedValue({
        success: false,
        message: 'example error',
      });
      await requestBodyAsync('/addCard', defaultRequestBody);
      expect(AnkiClientMock.mock.instances[0].addCard).toHaveBeenCalledWith(
        defaultRequestBody.deckName,
        defaultRequestBody.front,
        defaultRequestBody.back
      );
    });

    it('returns an success on success', async () => {
      AnkiClientMock.mock.instances[0].addCard = jest.fn().mockResolvedValue({
        success: true,
        message: null,
      });
      let response = await requestBodyAsync('/addCard', defaultRequestBody);
      expect(response.body.success).toEqual(true);
      expect(response.body.message).toEqual(null);
    });

    it('returns an error on error', async () => {
      AnkiClientMock.mock.instances[0].addCard = jest.fn().mockResolvedValue({
        success: false,
        message: 'cannot create note because it is a duplicate',
      });
      let response = await requestBodyAsync('/addCard', defaultRequestBody);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual(
        'cannot create note because it is a duplicate'
      );
    });
  });

  describe('GET /dueCards', () => {
    it('requests a list of due, new and learn cards', async () => {
      const mockInstance = AnkiClientMock.mock.instances[0];
      await request(app).get('/dueCards?deck=deck1');
      expect(mockInstance.getDueCards).toHaveBeenCalledWith('deck1');
      expect(mockInstance.getLearnCards).toHaveBeenCalledWith('deck1');
      expect(mockInstance.getNewCards).toHaveBeenCalledWith('deck1');
    });

    it('requests the details of all the cards', async () => {
      const mockInstance = AnkiClientMock.mock.instances[0];
      mockInstance.getDueCards = jest.fn().mockResolvedValue([1, 2]);
      mockInstance.getLearnCards = jest.fn().mockResolvedValue([3, 4]);
      mockInstance.getNewCards = jest.fn().mockResolvedValue([5, 6]);
      await request(app).get('/dueCards?deck=deck1');
      expect(mockInstance.getCardInfo).toHaveBeenCalledWith([1, 2]);
      expect(mockInstance.getCardInfo).toHaveBeenCalledWith([3, 4]);
      expect(mockInstance.getCardInfo).toHaveBeenCalledWith([5, 6]);
    });

    it('returns info for the cards', async () => {
      let mockInstance = AnkiClientMock.mock.instances[0];
      mockInstance.getDueCards = jest.fn().mockResolvedValue([1, 2]);
      mockInstance.getLearnCards = jest.fn().mockResolvedValue([3, 4]);
      mockInstance.getNewCards = jest.fn().mockResolvedValue([5, 6]);
      mockInstance.getCardInfo = jest.fn();
      const mockGetCardInfo = mockInstance.getCardInfo as jest.Mock;
      mockGetCardInfo.mockResolvedValueOnce(exampleDueCards);
      mockGetCardInfo.mockResolvedValueOnce(exampleLearnCards);
      mockGetCardInfo.mockResolvedValueOnce(exampleNewCards);

      let response = await request(app).get('/dueCards?deck=deck1');
      let responseBody: dueCardsResponseType = response.body;
      expect(responseBody.due).toEqual(exampleDueCards);
      expect(responseBody.learn).toEqual(exampleLearnCards);
      expect(responseBody.new).toEqual(exampleNewCards);
    });
  });

  describe('POST /answerCard', () => {
    function getAnswerCardRequestBody(params) {
      return JSON.stringify({
        action: 'answerCards',
        version: 6,
        params: params,
      });
    }

    const defaultCard = {
      cardId: 123,
      ease: 2,
    };
    const ease1Card = {
      cardId: 124,
      ease: 1,
    };

    const defaultResponse = {
      result: [true],
      error: null,
    };

    it('calls answerCards action', async () => {
      const mockInstance = AnkiClientMock.mock.instances[0];
      mockInstance.setCardAnswered = jest.fn().mockResolvedValue({
        success: true,
        message: null,
      });
      mockInstance.getCardInfo = jest.fn().mockResolvedValue([exampleCards[0]]);
        
      await requestBodyAsync('/answerCard', defaultCard);
      expect(
        AnkiClientMock.mock.instances[0].setCardAnswered
      ).toHaveBeenCalledWith(defaultCard.cardId, defaultCard.ease);
    });

    it('on ease 1, it calls the cardsInfo action to get the new due date', async () => {
      const mockInstance = AnkiClientMock.mock.instances[0];
      mockInstance.setCardAnswered = jest.fn().mockResolvedValue({
        success: true,
        message: null,
      });
      mockInstance.getCardInfo = jest.fn().mockResolvedValue([exampleCards[0]]);
      await requestBodyAsync('/answerCard', {
        cardId: 123,
        ease: 1,
      });
      expect(mockInstance.getCardInfo).toHaveBeenCalledWith([123]);
    });

    it('returns success on success', async () => {
      AnkiClientMock.mock.instances[0].setCardAnswered = jest
        .fn()
        .mockResolvedValue({
          success: true,
          message: null,
        });
      let response = await requestBodyAsync('/answerCard', defaultCard);
      expect(response.body.success).toEqual(true);
      expect(response.body.message).toEqual(null);
      expect(response.body.card).toEqual(null);
    });

    it('returns success and card on success for ease 1', async () => {
      const mockInstance = AnkiClientMock.mock.instances[0];
      mockInstance.setCardAnswered = jest.fn().mockResolvedValue({
        success: true,
        message: null,
      });
      mockInstance.getCardInfo = jest.fn().mockResolvedValue([exampleCards[0]]);
      let response = await requestBodyAsync('/answerCard', ease1Card);
      expect(response.body.success).toEqual(true);
      expect(response.body.card).toEqual(exampleCards[0]);
    });

    it('returns success and card on success for new cards', async () => {
      const mockInstance = AnkiClientMock.mock.instances[0];
      mockInstance.setCardAnswered = jest.fn().mockResolvedValue({
        success: true,
        message: null,
      });
      mockInstance.getCardInfo = jest.fn().mockResolvedValue([exampleCards[2]]);
      let response = await requestBodyAsync('/answerCard', {
        cardId: 3,
        ease: 2,
      });
      expect(response.body.success).toEqual(true);
      expect(response.body.card).toEqual(exampleCards[2]);
    });

    it('returns success and card on success for cards that have more to study', async () => {
      const mockInstance = AnkiClientMock.mock.instances[0];
      mockInstance.setCardAnswered = jest.fn().mockResolvedValue({
        success: true,
        message: null,
      });
      mockInstance.getCardInfo = jest.fn().mockResolvedValue([exampleCards[3]]);
      let response = await requestBodyAsync('/answerCard', {
        cardId: 4,
        ease: 2,
      });
      expect(response.body.success).toEqual(true);
      expect(response.body.card).toEqual(exampleCards[3]);
    });

    it('returns error on error', async () => {
      AnkiClientMock.mock.instances[0].setCardAnswered = jest
        .fn()
        .mockResolvedValue({
          success: false,
          message: 'example error',
        });
      let response = await requestBodyAsync('/answerCard', defaultCard);
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('example error');
    });
  });

  describe('POST /updateCard', () => {
    it('calls updateCard action', async () => {
      AnkiClientMock.mock.instances[0].updateCard = jest.fn().mockResolvedValue({
        success: true,
        message: null,
      });
      await requestBodyAsync('/updateCard', {
        cardId: 123,
        front: 'Hola',
        back: 'Hello',
      });
      expect(AnkiClientMock.mock.instances[0].updateCard).toHaveBeenCalledWith(
        123,
        'Hola',
        'Hello'
      );
    });

    it('returns success on success', async () => {
      AnkiClientMock.mock.instances[0].updateCard = jest.fn().mockResolvedValue({
        success: true,
        message: null,
      });
      let response = await requestBodyAsync('/updateCard', {
        cardId: 123,
        front: 'Hola',
        back: 'Hello',
      });
      expect(response.body.success).toEqual(true);
    });

    it('returns error on error', async () => {
      AnkiClientMock.mock.instances[0].updateCard = jest.fn().mockResolvedValue({
        success: false,
        message: 'example error',
      });
      let response = await requestBodyAsync('/updateCard', {
        cardId: 123,
        front: 'Hola',
        back: 'Hello',
      });
      expect(response.body.success).toEqual(false);
      expect(response.body.message).toEqual('example error');
    });
  });
});
