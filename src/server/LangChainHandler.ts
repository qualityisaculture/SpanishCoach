import { translationDirections, SpanishTenses } from '../Enums';
const { SpanishToEnglish, EnglishToSpanish } = translationDirections;

import { ChatOpenAI } from '@langchain/openai';
import { JsonOutputFunctionsParser } from 'langchain/output_parsers';
import { HumanMessage, BaseMessage } from '@langchain/core/messages';
import { IterableReadableStream } from '@langchain/core/utils/stream';

const simpleSpanishExtractionFunctionSchema = {
  name: 'translator',
  description: 'Extracts fields from the input.', //I know this seems like an odd description for a translation function, but it works way better than the other options for some reason
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
const simpleEnglishExtractionFunctionSchema = {
  name: 'translator',
  description: 'Extracts fields from the input.', //I know this seems like an odd description for a translation function, but it works way better than the other options for some reason
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
const complexSpanishExtractionFunctionSchema = {
  name: 'translator',
  description: 'Extracts fields from the input.', //I know this seems like an odd description for a translation function, but it works way better than the other options for some reason
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
const complexEnglishExtractionFunctionSchema = {
  name: 'translator',
  description: 'Extracts fields from the input.', //I know this seems like an odd description for a translation function, but it works way better than the other options for some reason
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
type complexResponse = {
  translation: string;
  partOfSpeech: string;
  longDescription: string;
};
type simpleResponse = {
  translation: string;
};
type TenseDetectionResponse = {
  tense: SpanishTenses | 'unknown';
};
export type availableResponses = 'simple' | 'complex';

type VerbExamplesResponse = {
  yo: string;
  tu: string;
  el: string;
  nosotros: string;
  vosotros: string;
  ellos: string;
};

const explanationFunctionSchema = {
  name: 'explanation',
  description: 'Provides a simple, intermediate-level explanation of a Spanish word or phrase in Spanish. If a single word, include 1-2 example sentences. If a phrase, provide a contextual explanation.',
  parameters: {
    type: 'object',
    properties: {
      explanation: {
        type: 'string',
        description: 'A Spanish explanation of the word or phrase. No English. For single words, include 1-2 example sentences. For phrases, provide a contextual explanation.'
      }
    },
    required: ['explanation']
  }
};

const simplifyFunctionSchema = {
  name: 'simplify',
  description: 'Simplifies a Spanish explanation to be even easier to understand, using only simple Spanish.',
  parameters: {
    type: 'object',
    properties: {
      simplifiedExplanation: {
        type: 'string',
        description: 'A simpler Spanish explanation of the original explanation. No English.'
      }
    },
    required: ['simplifiedExplanation']
  }
};

export default class LangChainHandler {
  model: any;
  parser: any;
  constructor() {
    this.parser = new JsonOutputFunctionsParser();
    this.model = new ChatOpenAI({ modelName: 'gpt-4o' });
  }

  async generateExample(requiredPhrase: string, previousPhrases: string[]): Promise<{exampleSpanish: string; exampleEnglish: string}>{
    const schema = {
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
    const runnable = this.getRunnable(schema, 'example');
    const result = await runnable.invoke([new HumanMessage(`${requiredPhrase} \n Previous Phrases: ${previousPhrases}`)]);
    return {
      exampleSpanish: result.spanishExample,
      exampleEnglish: result.englishTranslation,
    };
  }

  //generate a

  async chat(messages: BaseMessage[]): Promise<IterableReadableStream<{content: string}>>{
    if (messages.length === 0) {
      throw new Error('You must provide at least one message to start the chat');
    }
    const stream = this.model.stream(messages);
    return stream;
  }

  async translate(inputLanguage: translationDirections, wordToTranslate: string): Promise<simpleResponse> {
    const schema =
      inputLanguage === SpanishToEnglish
        ? simpleSpanishExtractionFunctionSchema
        : simpleEnglishExtractionFunctionSchema;
    const runnable = this.getRunnable(schema);
    const result = await runnable.invoke([new HumanMessage(wordToTranslate)]);
    return {
      translation:
        result[inputLanguage === SpanishToEnglish ? 'english' : 'spanish'],
    };
  }

  async translateComplex(inputLanguage: translationDirections, wordToTranslate: string): Promise<complexResponse> {
    const schema =
      inputLanguage === 'spanishToEnglish'
        ? complexSpanishExtractionFunctionSchema
        : complexEnglishExtractionFunctionSchema;
    const runnable = this.getRunnable(schema);
    const result = await runnable.invoke([new HumanMessage(wordToTranslate)]);
    return {
      translation:
        result[inputLanguage === SpanishToEnglish ? 'english' : 'spanish'],
      partOfSpeech: result.partOfSpeech,
      longDescription: result.longDescription,
    };
  }

  async generateVerbExamples(verb: string, tense: SpanishTenses, note: string): Promise<VerbExamplesResponse> {
    const schema = {
      name: 'translator',
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
    const runnable = this.getRunnable(schema);
    const result = await runnable.invoke([new HumanMessage(`${verb} in ${tense} tense. Note: ${note}`)]);
    return {
      yo: result.yo,
      tu: result.tu,
      el: result.el,
      nosotros: result.nosotros,
      vosotros: result.vosotros,
      ellos: result.ellos,
    };
  }

  async detectTense(sentence: string): Promise<TenseDetectionResponse> {
    const schema = {
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
    const runnable = this.getRunnable(schema, 'tenseDetector');
    const result = await runnable.invoke([new HumanMessage(sentence)]);
    return {
      tense: result.tense,
    };
  }

  async generateExplanation(spanish: string): Promise<{ explanation: string; complexity: string }> {
    const prompt = `Explica en español, de manera intermedia, la siguiente palabra o frase. Si es una sola palabra, incluye 1-2 frases de ejemplo. Si es una frase, proporciona una explicación contextual. No uses inglés.\n\nPalabra o frase: ${spanish}`;
    const runnable = this.getRunnable(explanationFunctionSchema, 'explanation');
    const result = await runnable.invoke([new HumanMessage(prompt)]);
    return {
      explanation: result.explanation,
      complexity: 'intermediate',
    };
  }

  async generateSimplifiedExplanation(spanish: string): Promise<{ simplifiedExplanation: string }> {
    const prompt = `Simplifica aún más la siguiente explicación en español, usando solo español muy simple. No uses inglés.\n\nPalabra o frase: ${spanish}`;
    const runnable = this.getRunnable(simplifyFunctionSchema, 'simplify');
    const result = await runnable.invoke([new HumanMessage(prompt)]);
    return {
      simplifiedExplanation: result.simplifiedExplanation,
    };
  }

  getRunnable(schema: any, name: 'translator' | 'example' | 'tenseDetector' | 'explanation' | 'simplify' = 'translator') {
    return this.model
      .bind({
        functions: [schema],
        function_call: { name: name },
      })
      .pipe(this.parser);
  }
}
