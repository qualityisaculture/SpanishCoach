import e from 'express';
import { Card } from '../../src/Types'
export const card1: Card = {
  id: 1,
  noteId: 10,
  front: 'front1',
  back: 'back1',
  failInterval: '15 mins',
  hardInterval: '2 days',
  mediumInterval: '4 days',
  easyInterval: '6 days',
  due: null,
  isNew: false,
  leftToStudy: 0
};

export const card2: Card = {
  id: 2,
  noteId: 11,
  front: 'front2',
  back: 'back2',
  failInterval: '15 mins',
  hardInterval: '2 days',
  mediumInterval: '4 days',
  easyInterval: '6 days',
  due: null,
  isNew: false,
  leftToStudy: 0
};

export const newCard: Card = {
  id: 3,
  noteId: 12,
  front: 'front new',
  back: 'back new',
  failInterval: '15 mins',
  hardInterval: '2 days',
  mediumInterval: '4 days',
  easyInterval: '6 days',
  due: null,
  isNew: true,
  leftToStudy: 0
};

export const beforeAnyCardsDue: number = 1704634543000; //Sun Jan 07 2024 13:35:43
export const oneSecondAfterLearnCard: number = 1704634545000; //Sun Jan 07 2024 13:35:45
export const learnCard: Card = {
  id: 4,
  noteId: 13,
  front: 'front learn',
  back: 'back learn',
  failInterval: '15 mins',
  hardInterval: '2 days',
  mediumInterval: '4 days',
  easyInterval: '6 days',
  due: 1704634544000, //Sun Jan 07 2024 13:35:44
  isNew: false,
  leftToStudy: 1
};

export const learnCard2: Card = {
  id: 5,
  noteId: 14,
  front: 'front learn',
  back: 'back learn',
  failInterval: '15 mins',
  hardInterval: '2 days',
  mediumInterval: '4 days',
  easyInterval: '6 days',
  due: 1705525169000, //Wed Jan 17 2024 20:59:29
  isNew: false,
  leftToStudy: 2
};

export const dueDeck = [card1, card2];
export const newDeck = [newCard];
export const learnDeck = [learnCard];