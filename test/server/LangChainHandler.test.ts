import LangChainHandler from '../../src/server/LangChainHandler';
import { translationDirections } from '../../src/Enums';
const { SpanishToEnglish, EnglishToSpanish } = translationDirections;
const { ChatOpenAI } = require('@langchain/openai');
const { HumanMessage } = require('@langchain/core/messages');

jest.mock('@langchain/openai');
jest.mock('langchain/output_parsers');
jest.mock('@langchain/core/messages');

const simpleEnglishToSpanishSchema = {
  name: 'translator',
  description: 'Extracts fields from the input.',
  parameters: {
    type: 'object',
    properties: {
      spanish: {
        type: 'string',
        description: 'The Spanish translation of the input',
      },
      english: {
        type: 'string',
        description: 'The original English input',
      },
    },
    required: ['spanish', 'english'],
  },
};
const simpleSpanishToEnglishSchema = {
  name: 'translator',
  description: 'Extracts fields from the input.',
  parameters: {
    type: 'object',
    properties: {
      english: {
        type: 'string',
        description: 'The English translation of the input',
      },
      spanish: {
        type: 'string',
        description: 'The original Spanish input',
      },
    },
    required: ['english', 'spanish', 'partOfSpeech', 'verbInfinitive'],
  },
};
const complexEnglishToSpanishSchema = {
  name: 'translator',
  description: 'Extracts fields from the input.',
  parameters: {
    type: 'object',
    properties: {
      spanish: {
        type: 'string',
        description: 'The Spanish translation of the input',
      },
      english: {
        type: 'string',
        description: 'The original English input',
      },
      longDescription: {
        type: 'string',
        description:
          'A long, conversational description of what the spanish translation means in English. This should be several sentences.',
      },
      partOfSpeech: {
        enum: [
          'sentence',
          'noun',
          'verb',
          'adjective',
          'adverb',
          'pronoun',
          'preposition',
          'conjunction',
          'interjection',
          'other',
        ],
        type: 'string',
        description: 'The part of speech of the input',
      },
      verbInfinitive: {
        type: 'string',
        description:
          "If partOfSpeech is 'verb', the infinitive form of the verb. If not, this field is 'null'",
      },
    },
    required: [
      'spanish',
      'english',
      'partOfSpeech',
      'verbInfinitive',
      'longDescription',
    ],
  },
};
const complexSpanishToEnglishSchema = {
  name: 'translator',
  description: 'Extracts fields from the input.',
  parameters: {
    type: 'object',
    properties: {
      english: {
        type: 'string',
        description: 'The English translation of the input',
      },
      spanish: {
        type: 'string',
        description: 'The original Spanish input',
      },
      longDescription: {
        type: 'string',
        description:
          'A long conversational of what the input means in English. This should be several sentences.',
      },
      partOfSpeech: {
        enum: [
          'sentence',
          'noun',
          'verb',
          'adjective',
          'adverb',
          'pronoun',
          'preposition',
          'conjunction',
          'interjection',
          'other',
        ],
        type: 'string',
        description: 'The part of speech of the input',
      },
      verbInfinitive: {
        type: 'string',
        description:
          "If partOfSpeech is 'verb', the infinitive form of the verb. If not, this field is 'null'",
      },
    },
    required: [
      'english',
      'spanish',
      'partOfSpeech',
      'verbInfinitive',
      'longDescription',
    ],
  },
};

describe('LangChainHandler', () => {
  beforeEach(() => {
    ChatOpenAI.mockClear();
    ChatOpenAI.bind.mockClear();
  });
  it('creates a model with gpt-3.5', () => {
    new LangChainHandler();
    expect(ChatOpenAI).toHaveBeenCalledWith({ modelName: 'gpt-3.5-turbo' });
  });

  async function expectSchema(schema) {
    expect(ChatOpenAI.bind).toHaveBeenCalledWith(
      expect.objectContaining({
        functions: [schema],
        function_call: { name: schema.name },
      })
    );
  }

  describe('translate', () => {
    it('translate creates runnable with a simple spanish translation scheme', async () => {
      const handler = new LangChainHandler();
      await handler.translate(EnglishToSpanish, 'example text');
      expectSchema(simpleEnglishToSpanishSchema);
    });

    it('translate creates a runnable with a simple english translation scheme', async () => {
      const handler = new LangChainHandler();
      await handler.translate(SpanishToEnglish, 'example text');
      expectSchema(simpleSpanishToEnglishSchema);
    });

    it('translate creates runnable with a complex spanish translation scheme', async () => {
      const handler = new LangChainHandler();
      await handler.translateComplex(EnglishToSpanish, 'example text');
      expectSchema(complexEnglishToSpanishSchema);
    });

    it('translate creates a runnable with a complex english translation scheme', async () => {
      const handler = new LangChainHandler();
      await handler.translateComplex(SpanishToEnglish, 'example text');
      expectSchema(complexSpanishToEnglishSchema);
    });

    it('invokes the runnable with a human message', async () => {
      let handler = new LangChainHandler();
      await handler.translate(SpanishToEnglish, 'Hola');
      expect(HumanMessage).toHaveBeenCalledWith('Hola');
      const humanMessage = HumanMessage.mock.instances[0];
      expect(ChatOpenAI.invoke).toHaveBeenCalledWith([humanMessage]);
    });

    it('returns a translation', async () => {
      ChatOpenAI.returnValue = {
        english: 'Hello',
      };
      let handler = new LangChainHandler();
      let result = await handler.translate(SpanishToEnglish, 'Hola');
      expect(result).toEqual({
        translation: 'Hello',
      });
    });

    it('returns a translation', async () => {
      ChatOpenAI.returnValue = {
        spanish: 'Hola',
      };
      let handler = new LangChainHandler();
      let result = await handler.translate(EnglishToSpanish, 'Hola');
      expect(result).toEqual({
        translation: 'Hola',
      });
    });

    it('returns the part of speech for complex queries', async () => {
      ChatOpenAI.returnValue = {
        spanish: 'Botella',
        partOfSpeech: 'noun',
      };
      let handler = new LangChainHandler();
      let result = await handler.translateComplex(EnglishToSpanish, 'Bottle');
      expect(result).toEqual({
        translation: 'Botella',
        partOfSpeech: 'noun',
      });
    });

    it('returns a long description for complex queries', async () => {
      ChatOpenAI.returnValue = {
        spanish: 'Botella',
        partOfSpeech: 'noun',
        longDescription: 'A container for liquids',
      };
      let handler = new LangChainHandler();
      let result = await handler.translateComplex(EnglishToSpanish, 'Bottle');
      expect(result).toEqual({
        translation: 'Botella',
        partOfSpeech: 'noun',
        longDescription: 'A container for liquids',
      });
    });
  });

  describe('example generator', () => {
    it('creates a runnable with the example scheme', async () => {
      const handler = new LangChainHandler();
      await handler.generateExample('hola');
      const exampleSchema = {
        name: 'example',
        description: 'Generates an example sentence which includes the following phrase.',
        parameters: {
          type: 'object',
          properties: {
            spanishExample: {
              type: 'string',
              description: 'A short sentence in Spanish which includes the required phrase',
            },
            englishTranslation: {
              type: 'string',
              description: 'The English translation of the Spanish example sentence',
            },
          },
          required: ['spanishExample', 'englishTranslation'],
        },
      };
      return expectSchema(exampleSchema);
    });

    it('invokes the runnable with a human message', async () => {
      let handler = new LangChainHandler();
      await handler.generateExample('hola');
      expect(HumanMessage).toHaveBeenCalledWith('hola');
      const humanMessage = HumanMessage.mock.instances[0];
      expect(ChatOpenAI.invoke).toHaveBeenCalledWith([humanMessage]);
    });

    it('returns the example', async () => {
      ChatOpenAI.returnValue = {
        spanishExample: 'Hola, como estas?',
        englishTranslation: 'Hello, how are you?'
      };
      let handler = new LangChainHandler();
      let result = await handler.generateExample('hola');
      expect(result).toEqual({
        exampleSpanish: 'Hola, como estas?',
        exampleEnglish: 'Hello, how are you?',
      });
    });
    
  })

  describe('chat', () => {
    it('returns a stream when passed messages', async () => {
      let handler = new LangChainHandler();
      let exampleMessage = new HumanMessage('Hola');
      let stream = await handler.chat([exampleMessage]);

      expect(ChatOpenAI.stream).toHaveBeenCalledWith([exampleMessage]);
      expect(stream).toEqual('mock stream');
    });

    it('throws an error if no messages are passed', async () => {
      let handler = new LangChainHandler();
      await expect(handler.chat([])).rejects.toThrow(
        'You must provide at least one message to start the chat'
      );
    });
  });
});
