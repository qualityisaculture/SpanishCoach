import { DeckStats, DecksWithStatsResponse } from '../../src/Types';

export const deckWithStats1: DeckStats = {
  deck_id: 1651445861967,
  name: 'Japanese::JLPT N5',
  new_count: 20,
  learn_count: 0,
  review_count: 0,
  total_in_deck: 1506,
};

export const deckWithStats2: DeckStats = {
  deck_id: 1651445861960,
  name: 'Easy Spanish',
  new_count: 26,
  learn_count: 10,
  review_count: 5,
  total_in_deck: 852,
};

export const decksWithStats: DecksWithStatsResponse = {
  result: {
    '1651445861967': deckWithStats1,
    '1651445861960': deckWithStats2,
  },
  error: null,
};

export const decks = {
  result: ['Deck1', 'Deck2', 'Deck3'],
  error: null,
};

export const exampleCard = {
  answer: 'back content',
  question: 'front content',
  deckName: 'Default',
  modelName: 'Basic',
  fieldOrder: 1,
  fields: {
    Front: { value: 'front content', order: 0 },
    Back: { value: 'back content', order: 1 },
  },
  css: 'p {font-family:Arial;}',
  cardId: 1498938915662,
  interval: 16,
  note: 1502298033753,
  ord: 1,
  type: 0,
  queue: 0,
  due: 1,
  reps: 1,
  lapses: 0,
  left: 6,
  mod: 1629454092,
};

export const exampleCard2 = {
  answer: 'back content 2',
  question: 'front content 2',
  deckName: 'Default',
  modelName: 'Basic',
  fieldOrder: 0,
  fields: {
    Front: { value: 'front content 2', order: 0 },
    Back: { value: 'back content 2', order: 1 },
  },
  css: 'p {font-family:Arial;}',
  cardId: 1502098034048,
  interval: 23,
  note: 1502298033753,
  ord: 1,
  type: 0,
  queue: 0,
  due: 1,
  reps: 1,
  lapses: 0,
  left: 6,
};

export const exampleNewCard = {
  cardId: 1712083348250,
  fields: {
    Front: {
      value: 'new card front',
      order: 0,
    },
    Back: {
      value: 'new card back',
      order: 1,
    },
  },
  fieldOrder: 0,
  question:
    'new card front',
  answer:
    'new card back',
  modelName: 'Basic',
  ord: 0,
  deckName: 'Spanish Sentences',
  css: 'p {font-family:Arial;}',
  factor: 0,
  interval: 0,
  note: 1712083348249,
  type: 0,
  queue: 0,
  due: 4481,
  reps: 0,
  lapses: 0,
  left: 0,
  mod: 1712083348,
};

export const exampleNewFailedLearnCard = {
  "cardId": 1712083334481,
  "fields": {
      "Front": {
          "value": "Y'all complain/grumble",
          "order": 0
      },
      "Back": {
          "value": "vosotros/vosotras os quejáis",
          "order": 1
      }
  },
  "fieldOrder": 0,
  "question": "<style>.card {\n    font-family: arial;\n    font-size: 20px;\n    text-align: center;\n    color: black;\n    background-color: white;\n}\n</style>Y'all complain/grumble",
  "answer": "<style>.card {\n    font-family: arial;\n    font-size: 20px;\n    text-align: center;\n    color: black;\n    background-color: white;\n}\n</style>Y'all complain/grumble\n\n<hr id=answer>\n\nvosotros/vosotras os quejáis",
  "modelName": "Basic",
  "ord": 0,
  "deckName": "Spanish Words",
  "css": ".card {\n    font-family: arial;\n    font-size: 20px;\n    text-align: center;\n    color: black;\n    background-color: white;\n}\n",
  "factor": 0,
  "interval": 0,
  "note": 1712083334481,
  "type": 1,
  "queue": 1,
  "due": 1712083621,
  "reps": 1,
  "lapses": 0,
  "left": 2,
  "mod": 1712083559
}

export const exampleNewSuccessLearnCard = {
  "cardId": 1712083348251,
  "fields": {
      "Front": {
          "value": "You complain about having to do so much work.",
          "order": 0
      },
      "Back": {
          "value": "Tú te quejas de tener que hacer tanto trabajo.",
          "order": 1
      }
  },
  "fieldOrder": 0,
  "question": "<style>.card {\n    font-family: arial;\n    font-size: 20px;\n    text-align: center;\n    color: black;\n    background-color: white;\n}\n</style>You complain about having to do so much work.",
  "answer": "<style>.card {\n    font-family: arial;\n    font-size: 20px;\n    text-align: center;\n    color: black;\n    background-color: white;\n}\n</style>You complain about having to do so much work.\n\n<hr id=answer>\n\nTú te quejas de tener que hacer tanto trabajo.",
  "modelName": "Basic",
  "ord": 0,
  "deckName": "Spanish Sentences",
  "css": ".card {\n    font-family: arial;\n    font-size: 20px;\n    text-align: center;\n    color: black;\n    background-color: white;\n}\n",
  "factor": 0,
  "interval": 0,
  "note": 1712083348250,
  "type": 1,
  "queue": 1,
  "due": 1712086349,
  "reps": 1,
  "lapses": 0,
  "left": 1,
  "mod": 1712085724
}

export const cardsInfo = {
  result: [exampleCard, exampleCard2],
  error: null,
};

export const cards = {
  result: [1494723142483, 1494703460437, 1494703479525],
  error: null,
};

export const cards2 = {
  result: [1494723142484, 1494703460438, 1494703479526],
  error: null,
};

export const cards3 = {
  result: [1494723142485, 1494703460439, 1494703479527],
  error: null,
};

export const noteBuilder = (deckName, front, back) => {
  return {
    deckName: deckName,
    modelName: 'Basic',
    fields: {
      Front: front,
      Back: back,
    },
  };
};
