const express = require('express');
const ankiRoutes = express.Router();
import {
  TypedResponse as TR,
  TypedRequestQuery as TRQ,
  TypedRequestBody as TRB,
  Card,
} from '../../Types';
import { DeckStats } from '../AnkiClient';

import AnkiClient from '../AnkiClient';
const ankiClient = new AnkiClient();

export type addCardRequestType = {
  deckName: string;
  front: string;
  back: string;
};
export type addCardResponseType = {
  success: boolean;
  message: string | null;
};
ankiRoutes.post(
  '/addCard',
  async (req: TRB<addCardRequestType>, res: TR<addCardResponseType>) => {
    const deckName: string = req.body.deckName;
    const front: string = req.body.front;
    const back: string = req.body.back;

    let response = await ankiClient.addCard(deckName, front, back);

    if (response.success !== true) {
      res.json({ success: false, message: response.message });
    } else {
      res.json({ success: true, message: null });
    }
  }
);

export type decksRequestType = {};
export type decksResponseType = {
  result: string[];
};
ankiRoutes.get(
  '/decks',
  async (req: TRQ<decksRequestType>, res: TR<decksResponseType>) => {
    const decks = await ankiClient.getDeckNames();
    res.json({ result: decks });
  }
);

export type allDeckWithStatsRequestType = {};
export type allDeckWithStatsResponseType = {
  result: Record<string, DeckStats>;
  error: null;
};
ankiRoutes.get(
  '/allDecksWithStats',
  async (
    req: TRQ<allDeckWithStatsRequestType>,
    res: TR<allDeckWithStatsResponseType>
  ) => {
    const deckNames = await ankiClient.getDeckNames();
    const decks = await ankiClient.getDeckStats(deckNames);
    res.json({ result: decks, error: null });
  }
);

export type dueCardsRequestType = {
  deck: string;
};
export type dueCardsResponseType = {
  new: Card[];
  learn: Card[];
  due: Card[];
};
ankiRoutes.get(
  '/dueCards',
  async (req: TRQ<dueCardsRequestType>, res: TR<dueCardsResponseType>) => {
    let deckName = req.query.deck;
    const dueCards = await ankiClient.getDueCards(deckName);
    const learnCards = await ankiClient.getLearnCards(deckName);
    const newCards = await ankiClient.getNewCards(deckName);

    const dueCardsInfo: Card[] = await ankiClient.getCardInfo(dueCards);
    const learnCardsInfo: Card[] = await ankiClient.getCardInfo(learnCards);
    const newCardsInfo: Card[] = await ankiClient.getCardInfo(newCards);

    res.json({ new: newCardsInfo, learn: learnCardsInfo, due: dueCardsInfo });
  }
);

export type answerCardRequestType = {
  cardId: number;
  ease: 1 | 2 | 3 | 4;
};
export type answerCardResponseType = {
  success: boolean;
  message: string | null;
  card: Card | null;
};
ankiRoutes.post(
  '/answerCard',
  async (req: TRB<answerCardRequestType>, res: TR<answerCardResponseType>) => {
    const cardId = req.body.cardId;
    const ease = req.body.ease;

    let answerCardResponse = await ankiClient.setCardAnswered(cardId, ease);
    if (answerCardResponse.success === false) {
      return res.json({
        success: false,
        message: answerCardResponse.message,
        card: null,
      });
    }
    const cardsInfo = await ankiClient.getCardInfo([req.body.cardId]);
    const cardInfo = cardsInfo[0];
    if (cardInfo.isNew || cardInfo.leftToStudy > 0 || ease === 1) {
      res.json({
        success: true,
        message: null,
        card: cardInfo,
      });
    } else {
      res.json({
        success: true,
        message: null,
        card: null,
      });
    }
  }
);

export type updateCardRequestType = {
  cardId: number;
  front: string;
  back: string;
};
export type updateCardResponseType = {
  success: boolean;
  message: string | null;
};
ankiRoutes.post(
  '/updateCard',
  async (req: TRB<updateCardRequestType>, res: TR<updateCardResponseType>) => {
    const cardId = req.body.cardId;
    const front = req.body.front;
    const back = req.body.back;

    let response = await ankiClient.updateCard(cardId, front, back);
    if (response.success !== true) {
      res.json({ success: false, message: response.message });
    } else {
      res.json({ success: true, message: null });
    }
  }
);

module.exports = ankiRoutes;
