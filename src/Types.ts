
import { Send, Query } from 'express-serve-static-core';
export interface TypedResponse<ResBody> extends Express.Response {
  json: Send<ResBody, this>;
}
export interface TypedRequestBody<T> extends Express.Request {
  body: T
}
export interface TypedRequestQuery<T extends Query> extends Express.Request {
  query: T
}

export type DeckStats = {
  deck_id: number;
  name: string;
  new_count: number;
  learn_count: number;
  review_count: number;
  total_in_deck: number;
};

export type DecksWithStatsResponse = {
  result: Record<string, DeckStats>;
  error: null;
};

export type Card = {
  id: number;
  noteId: number;
  front: string;
  back: string;
  failInterval: string;
  hardInterval: string;
  mediumInterval: string;
  easyInterval: string;
  due: number | null;
  isNew: boolean;
  leftToStudy: number;
}

export type Cards = {
  cards: Card[];
}
