import { translationDirections } from '../Enums';
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
export type availableResponses = 'simple' | 'complex';

export default class LangChainHandler {
  model: any;
  parser: any;
  constructor() {
    this.parser = new JsonOutputFunctionsParser();
    this.model = new ChatOpenAI({ modelName: 'gpt-4o' });
  }

  async generateExample(requiredPhrase: string): Promise<{exampleSpanish: string; exampleEnglish: string}>{
    const schema = {
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
    const runnable = this.getRunnable(schema, 'example');
    const result = await runnable.invoke([new HumanMessage(requiredPhrase)]);
    return {
      exampleSpanish: result.spanishExample,
      exampleEnglish: result.englishTranslation,
    };
  }

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

  getRunnable(schema: any, name: 'translator' | 'example' = 'translator') {
    return this.model
      .bind({
        functions: [schema],
        function_call: { name: name },
      })
      .pipe(this.parser);
  }
}
