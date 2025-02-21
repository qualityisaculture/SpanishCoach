import LangChainHandler from '../../src/server/LangChainHandler';
import { translationDirections, SpanishTenses } from '../../src/Enums';
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
  it('creates a model with gpt-4o', () => {
    new LangChainHandler();
    expect(ChatOpenAI).toHaveBeenCalledWith({ modelName: 'gpt-4o' });
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
      await handler.generateExample('hola', []);
      const exampleSchema = {
        name: 'example',
        description: 'Generates an example sentence which includes the following phrase but is not any of the previous phrases.',
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
      await handler.generateExample('hola', []);
      expect(HumanMessage).toHaveBeenCalledWith('hola \n Previous Phrases: ');
      const humanMessage = HumanMessage.mock.instances[0];
      expect(ChatOpenAI.invoke).toHaveBeenCalledWith([humanMessage]);
    });

    it('invokes the runnable with a human message and previous phrases', async () => {
      let handler = new LangChainHandler();
      await handler.generateExample('hola', ['Hola, como estas?']);
      expect(HumanMessage).toHaveBeenCalledWith('hola \n Previous Phrases: Hola, como estas?');
      const humanMessage = HumanMessage.mock.instances[0];
      expect(ChatOpenAI.invoke).toHaveBeenCalledWith([humanMessage]);
    });

    it('returns the example', async () => {
      ChatOpenAI.returnValue = {
        spanishExample: 'Hola, como estas?',
        englishTranslation: 'Hello, how are you?'
      };
      let handler = new LangChainHandler();
      let result = await handler.generateExample('hola', []);
      expect(result).toEqual({
        exampleSpanish: 'Hola, como estas?',
        exampleEnglish: 'Hello, how are you?',
      });
    });
    
  })

  describe('generateVerbExamples', () => {
    it('creates a runnable with the verbExamples schema', async () => {
      const handler = new LangChainHandler();
      await handler.generateVerbExamples('comer', SpanishTenses.Presente, 'Generate examples for the verb "comer" in present tense.');
      const verbExamplesSchema = {
        name: 'verbExamples',
        description: 'Generates examples for a verb in a particular tense.',
        parameters: {
          type: 'object',
          properties: {
            yo: {
              type: 'string',
              description: 'Example sentence for "Yo" conjugation',
            },
            tu: {
              type: 'string',
              description: 'Example sentence for "Tu" conjugation',
            },
            el: {
              type: 'string',
              description: 'Example sentence for "El/Ella" conjugation',
            },
            nosotros: {
              type: 'string',
              description: 'Example sentence for "Nosotros" conjugation',
            },
            vosotros: {
              type: 'string',
              description: 'Example sentence for "Vosotros" conjugation',
            },
            ellos: {
              type: 'string',
              description: 'Example sentence for "Ellos/Ellas" conjugation',
            },
          },
          required: ['yo', 'tu', 'el', 'nosotros', 'vosotros', 'ellos'],
        },
      };
      return expectSchema(verbExamplesSchema);
    });

    it('invokes the runnable with a human message', async () => {
      let handler = new LangChainHandler();
      await handler.generateVerbExamples('comer', SpanishTenses.Presente, 'Generate examples for the verb "comer" in present tense.');
      expect(HumanMessage).toHaveBeenCalledWith('comer in presente tense. Note: Generate examples for the verb "comer" in present tense.');
      const humanMessage = HumanMessage.mock.instances[0];
      expect(ChatOpenAI.invoke).toHaveBeenCalledWith([humanMessage]);
    });

    it('returns the verb examples', async () => {
      ChatOpenAI.returnValue = {
        yo: 'Yo como',
        tu: 'Tú comes',
        el: 'Él/Ella come',
        nosotros: 'Nosotros comemos',
        vosotros: 'Vosotros coméis',
        ellos: 'Ellos/Ellas comen',
      };
      let handler = new LangChainHandler();
      let result = await handler.generateVerbExamples('comer', SpanishTenses.Presente, 'Generate examples for the verb "comer" in present tense.');
      expect(result).toEqual({
        yo: 'Yo como',
        tu: 'Tú comes',
        el: 'Él/Ella come',
        nosotros: 'Nosotros comemos',
        vosotros: 'Vosotros coméis',
        ellos: 'Ellos/Ellas comen',
      });
    });
  });

  describe('detectTense', () => {
    it('creates a runnable with the tenseDetector schema', async () => {
      const handler = new LangChainHandler();
      await handler.detectTense('Yo como');
      const tenseDetectorSchema = {
        name: 'tenseDetector',
        description: 'Detects the tense of a given Spanish sentence.',
        parameters: {
          type: 'object',
          properties: {
            tense: {
              enum: [
                'presente',
                'pretérito',
                'imperfecto',
                'futuro',
                'condicional',
                'presente subjuntivo',
                'imperfecto subjuntivo',
                'futuro subjuntivo',
                'presente perfecto',
                'pluscuamperfecto',
                'futuro perfecto',
                'condicional perfecto',
                'presente perfecto subjuntivo',
                'pluscuamperfecto subjuntivo',
                'futuro perfecto subjuntivo',
                'unknown'
              ],
              type: 'string',
              description: 'The tense of the given sentence',
            },
          },
          required: ['tense'],
        },
      };
      return expectSchema(tenseDetectorSchema);
    });

    it('invokes the runnable with a human message', async () => {
      let handler = new LangChainHandler();
      await handler.detectTense('Yo como');
      expect(HumanMessage).toHaveBeenCalledWith('Yo como');
      const humanMessage = HumanMessage.mock.instances[0];
      expect(ChatOpenAI.invoke).toHaveBeenCalledWith([humanMessage]);
    });

    it('returns the detected tense', async () => {
      ChatOpenAI.returnValue = {
        tense: SpanishTenses.Presente,
      };
      let handler = new LangChainHandler();
      let result = await handler.detectTense('Yo como');
      expect(result).toEqual({
        tense: SpanishTenses.Presente,
      });
    });

    it('returns unknown if the tense cannot be detected', async () => {
      ChatOpenAI.returnValue = {
        tense: 'unknown',
      };
      let handler = new LangChainHandler();
      let result = await handler.detectTense('Unknown sentence');
      expect(result).toEqual({
        tense: 'unknown',
      });
    });
  });

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
