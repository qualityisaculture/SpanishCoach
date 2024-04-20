const request = require('supertest');
const App = require('../../src/server/server');
const { fetchResponseOk } = require('../builders/fetch.js');
import { expectJson, setApp } from './supertestExtensions';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

import LangChainHandler from '../../src/server/LangChainHandler';

import {
  // @ts-ignore
  translationDirections,
  // @ts-ignore
  mockTranslate,
  // @ts-ignore
  complexMockTranslate,
  // @ts-ignore
  setMockResponse,
  // @ts-ignore
  mockGenerateExample,
  // @ts-ignore
  chat,
} from '../../src/server/LangChainHandler';

import { chatRequestType } from '../../src/server/routes/translator.js';
const { SpanishToEnglish, EnglishToSpanish } = translationDirections;
jest.mock('../../src/server/LangChainHandler.ts');

describe('Translator', () => {
  let app;
  beforeEach(() => {
    app = App();
    setApp(app);
    let fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(fetchResponseOk());
    fetchMock.mockClear();
    mockTranslate.mockClear();
    complexMockTranslate.mockClear();
  });

  it('GET /translate requests a spanish translation from LangChainHandler', async () => {
    await request(app).get('/translate?spanish=Hola');
    expect(LangChainHandler).toHaveBeenCalledWith();
    expect(mockTranslate).toHaveBeenCalledWith(SpanishToEnglish, 'Hola');
  });

  it('GET /translate requests an english translation from LangChainHandler', async () => {
    await request(app).get('/translate?english=Hello');
    expect(LangChainHandler).toHaveBeenCalledWith();
    expect(mockTranslate).toHaveBeenCalledWith(EnglishToSpanish, 'Hello');
  });

  it('GET /translate responds with the english translation', async () => {
    let [spanishOriginal, englishTranslation] = ['Hola', 'Hello'];
    setMockResponse({
      translation: englishTranslation,
    });
    return expectJson('/translate?spanish=' + spanishOriginal, null, {
      english: englishTranslation,
    });
  });
  it('GET /translate responds with the spanish translation', async () => {
    let [spanishTranslation, englishOriginal] = ['Hola', 'Hello'];
    setMockResponse({ translation: spanishTranslation });
    return expectJson('/translate?english=' + englishOriginal, null, {
      spanish: spanishTranslation,
    });
  });

  it('GET /complexTranslate requests a spanish translation from LangChainHandler', async () => {
    await request(app).get('/complextranslate?spanish=Hola');
    expect(LangChainHandler).toHaveBeenCalledWith();
    expect(complexMockTranslate).toHaveBeenCalledWith(SpanishToEnglish, 'Hola');
  });

  it('GET /complexTranslate requests an english translation from LangChainHandler', async () => {
    await request(app).get('/complextranslate?english=Hello');
    expect(LangChainHandler).toHaveBeenCalledWith();
    expect(complexMockTranslate).toHaveBeenCalledWith(EnglishToSpanish, 'Hello');
  });

  it('GET /complexTranslate responds with the english translation', async () => {
    let [spanishOriginal, englishTranslation] = ['Hola', 'Hello'];
    setMockResponse({
      translation: englishTranslation,
      partOfSpeech: 'noun',
      longDescription: 'This is a long description',
    });
    return expectJson('/complextranslate?spanish=' + spanishOriginal, null, {
      english: englishTranslation,
      partOfSpeech: 'noun',
      longDescription: 'This is a long description',
    });
  });
  it('GET /complexTranslate responds with the spanish translation', async () => {
    let [spanishTranslation, englishOriginal] = ['Hola', 'Hello'];
    setMockResponse({
      translation: spanishTranslation,
      partOfSpeech: 'noun',
      longDescription: 'This is a long description',
    });
    return expectJson('/complextranslate?english=' + englishOriginal, null, {
      spanish: spanishTranslation,
      partOfSpeech: 'noun',
      longDescription: 'This is a long description',
    });
  });

  describe('GET /example', () => {
    it('returns a 400 error if no requiredPhrase query is provided', async () => {
      return request(app)
        .get('/example')
        .expect(400)
        .expect('You must provide a requiredPhrase parameter');
    });

    it('requests an example from LangChainHandler', async () => {
      await request(app).get('/example?requiredPhrase=Hola');
      expect(LangChainHandler).toHaveBeenCalledWith();
      expect(mockGenerateExample).toHaveBeenCalledWith('Hola');
    });

    it('returns the example response', async () => {
      let requiredPhrase = 'Hola';
      let mockResponse = {
        exampleSpanish: 'Hola, que tal',
        exampleEnglish: 'Hello, how are you',
      }
      setMockResponse(mockResponse);
      return expectJson('/example?requiredPhrase=' + requiredPhrase, null, {
        example: 'Hola, que tal',
        translation: 'Hello, how are you',
      });
    });
  });

  describe('GET /chat', () => {
    it('returns a 400 error if no message query is provided', async () => {
      return request(app)
        .get('/chat')
        .expect(400)
        .expect('You must provide a message parameter');
    });
    it('returns an error if the message array is empty', async () => {
      return request(app)
        .get('/chat?messages=[]')
        .expect(400)
        .expect('You must provide at least one message to start the chat');
    });

    it('converts human messages into HumanMessages', async () => {
      let messages: chatRequestType = {
        messages: [{ type: 'human', message: 'Hola' }],
      };
      await request(app).get(
        '/chat?messages=' + JSON.stringify(messages.messages)
      );
      expect(chat).toHaveBeenCalledWith([new HumanMessage('Hola')]);
    });

    it('converts bot messages into AIMessages', async () => {
      let messages: chatRequestType = {
        messages: [{ type: 'bot', message: 'Hello' }],
      };
      await request(app).get(
        '/chat?messages=' + JSON.stringify(messages.messages)
      );
      expect(chat).toHaveBeenCalledWith([new AIMessage('Hello')]);
    });
    
    it('converts multiple messages into an array of messages', async () => {
      let messages: chatRequestType = {
        messages: [
          { type: 'human', message: 'Hola' },
          { type: 'bot', message: 'Hello' },
        ],
      };
      await request(app).get(
        '/chat?messages=' + JSON.stringify(messages.messages)
      );
      expect(chat).toHaveBeenCalledWith([
        new HumanMessage('Hola'),
        new AIMessage('Hello'),
      ]);
    });

    it('writes a stream to the response', async () => {
      let messages: chatRequestType = {
        messages: [{ type: 'human', message: 'Hola' }],
      };
      return request(app)
        .get('/chat?messages=' + JSON.stringify(messages.messages))
        .expect(200)
        .expect('Hola, que tal');
    });
  });
});
