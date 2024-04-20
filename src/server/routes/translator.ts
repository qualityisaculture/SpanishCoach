const express = require('express');
import LangChainHandler from '../LangChainHandler';
import { translationDirections } from '../../Enums';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
const { SpanishToEnglish, EnglishToSpanish } = translationDirections;
const translatorRouter = express.Router();

import {
  TypedResponse as TR,
  TypedRequestQuery as TRQ,
  TypedRequestBody as TRB,
  Card,
} from '../../Types';

export type translateRequestType = {
  spanish: string;
  english: string;
}
export type translateResponseType = {
  spanish?: string;
  english?: string;
}
translatorRouter.get('/translate', async (req: TRQ<translateRequestType>, res: TR<translateResponseType>) => {
  let input = req.query.spanish ? req.query.spanish : req.query.english;
  let inputLanguage: string = req.query.spanish ? 'spanish' : 'english';
  let outputLanguage: 'english' | 'spanish' = req.query.spanish ? 'english' : 'spanish';

  let lch = new LangChainHandler();
  let direction = inputLanguage == 'spanish' ? SpanishToEnglish : EnglishToSpanish
  let translation = await lch.translate(direction, input);
  res.json({
    [outputLanguage]: translation.translation,
  });
});

translatorRouter.get('/complextranslate', async (req, res) => {
  let input = req.query.spanish ? req.query.spanish : req.query.english;
  let inputLanguage: string = req.query.spanish ? 'spanish' : 'english';
  let outputLanguage: string = req.query.spanish ? 'english' : 'spanish';

  let lch = new LangChainHandler();
  let direction = inputLanguage == 'spanish' ? SpanishToEnglish : EnglishToSpanish
  let translation = await lch.translateComplex(direction, input);

  res.json({
    [outputLanguage]: translation.translation,
    partOfSpeech: translation.partOfSpeech,
    longDescription: translation.longDescription,
  });
});

export type chatMessageType = {
  message: string;
  type: "human" | "bot";
}
export type chatRequestType = {
  messages: chatMessageType[];
}
translatorRouter.get('/chat', async (req, res) => {
  if (!req.query.messages) {
    res.status(400).send('You must provide a message parameter');
    return;
  }
  let requestMessages: chatMessageType[] = JSON.parse(req.query.messages);
  if (requestMessages.length === 0) {
    res.status(400).send('You must provide at least one message to start the chat');
    return;
  }
  let lch = new LangChainHandler();
  let messages: BaseMessage[] = requestMessages.map((message) => {
    return message.type === 'human' ? new HumanMessage(message.message) : new AIMessage(message.message);
  });
  let stream = await lch.chat(messages);

  for await (const chunk of stream) {
    let string: string = chunk.content;
    res.write(string);
  }
  res.end();
});

export type exampleRequestType = {
  requiredPhrase: string;
}
export type exampleResponseType = {
  example: string;
  translation: string;
}
translatorRouter.get('/example', async (req, res) => {
  if (!req.query.requiredPhrase) {
    res.status(400).send('You must provide a requiredPhrase parameter');
    return;
  }
  let requiredPhrase = req.query.requiredPhrase;
  let lch = new LangChainHandler();
  let translation = await lch.generateExample(requiredPhrase);
  res.json({
    example: translation.exampleSpanish,
    translation: translation.exampleEnglish,
  });
});

module.exports = translatorRouter;
