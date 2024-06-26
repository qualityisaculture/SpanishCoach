import { CardType } from '../Types';

type AnkiConnectCardType = {
  answer: string;
  question: string;
  deckName: string;
  modelName: string;
  fieldOrder: number;
  fields: {
    Front: { value: string; order: number };
    Back: { value: string; order: number };
  };
  css: string;
  cardId: number;
  interval: number;
  note: number;
  ord: number;
  type: number;
  queue: number;
  due: number;
  reps: number;
  lapses: number;
  left: number;
};

export type AnkiConnectCardInfoResponseType = {
  result: AnkiConnectCardType[];
  error: null | string;
};

export type AnkiConnectFindCardsResponseType = {
  result: number[];
  error: null;
};

export type AnkiConnectAnswerCardsResponseType = {
  result: boolean[] | null;
  error: null | string;
};

export type AnkiConnectDeckNamesResponseType = {
  result: string[];
  error: null | string;
};

export type AnkiConnectUpdateNoteResponseType = {
  result: boolean;
  error: null | string;
};

export type DeckStats = {
  deck_id: number;
  name: string;
  new_count: number;
  learn_count: number;
  review_count: number;
  total_in_deck: number;
};

export type AnkiConnectDecksWithStatsResponse = {
  result: Record<string, DeckStats>;
  error: null | string;
};

export type AnkiConnectAddNoteResponseType = {
  result: number;
  error: null | string;
};

type AnswerCardType = {
  action: 'answerCards';
  version: 6;
  params: {
    answers: [
      {
        cardId: number;
        ease: 1 | 2 | 3 | 4; //Again, Hard, Good, Easy
      }
    ];
  };
};
type CardsInfoType = {
  action: 'cardsInfo';
  version: 6;
  params: { cards: number[] };
};
type FindCardsType = {
  action: 'findCards';
  version: 6;
  params: { query: string };
};
type GetDeckStatsType = {
  action: 'getDeckStats';
  version: 6;
  params: { decks: string[] };
};
type GetDecksType = {
  action: 'deckNames';
  version: 6;
};
type AddCardType = {
  action: string;
  version: 6;
  params: {
    note: {
      deckName: string;
      modelName: 'Basic';
      fields: {
        Front: string;
        Back: string;
      };
    };
  };
};

type UpdateNoteType = {
  action: 'updateNoteFields';
  version: 6;
  params: {
    note: {
      id: number;
      fields: {
        Front: string;
        Back: string;
      };
    };
  };
};
type DeleteCardType = {
  action: 'deleteNotes';
  version: 6;
  params: {
    notes: number[];
  };
};
type PostTypes =
  | AnswerCardType
  | CardsInfoType
  | FindCardsType
  | GetDeckStatsType
  | GetDecksType
  | AddCardType
  | UpdateNoteType
  | DeleteCardType;
type tagType = 'is:due -is:learn' | 'is:new' | 'is:learn';

export type DeleteResponseType = {
  success: boolean;
  error: string | null;
};

export default class AnkiClient {
  constructor() {}

  postToAnki = (body: PostTypes) => {
    return fetch('http://localhost:8765', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  };

  async setCardAnswered(
    cardId: number,
    ease: 1 | 2 | 3 | 4
  ): Promise<{ success: boolean; message: string | null }> {
    let answerCardsResponse = await this.postToAnki({
      action: 'answerCards',
      version: 6,
      params: {
        answers: [
          {
            cardId: cardId,
            ease: ease,
          },
        ],
      },
    });
    let answerCardsJson: AnkiConnectAnswerCardsResponseType =
      await answerCardsResponse.json();
    if (answerCardsJson.result === null) {
      return {
        success: false,
        message: answerCardsJson.error,
      };
    }
    return {
      success: true,
      message: null,
    };
  }

  getIntervals = (card: AnkiConnectCardType): string[] => {
    if (card.type === 0) return ['<1m', '<6m', '<10m', '5d'];
    if (card.type === 1 && card.left === 2) return ['<1m', '<6m', '<10m', '4d'];
    if (card.type === 1 && card.left === 1) return ['<1m', '<6m', '1d', '4d'];
    return ['<10m', '?', '?', '?'];
  };

  getCardFromAnkiCard = (card: AnkiConnectCardType): CardType => {
    const due = card.due > 1000000 ? card.due * 1000 : null;
    const intervals = this.getIntervals(card);
    return {
      id: card.cardId,
      noteId: card.note,
      front: card.fields.Front.value,
      back: card.fields.Back.value,
      failInterval: intervals[0],
      hardInterval: intervals[1],
      mediumInterval: intervals[2],
      easyInterval: intervals[3],
      due: due,
      isNew: card.type === 0,
      leftToStudy: card.left,
    };
  };

  async getCardInfo(cardIdArray: number[]): Promise<CardType[]> {
    let response = await this.postToAnki({
      action: 'cardsInfo',
      version: 6,
      params: { cards: cardIdArray },
    });
    const rawCards: AnkiConnectCardInfoResponseType = await response.json();
    let cards: CardType[] = [];
    rawCards.result.forEach((card) => {
      cards.push(this.getCardFromAnkiCard(card));
    });
    return cards;
  }

  getCardsIds = async (tag: tagType, deckName: string): Promise<number[]> => {
    //replace all spaces with underscores
    deckName = deckName.replace(/ /g, '_');
    let query = `deck:${deckName} ${tag}`;
    let response = await this.postToAnki({
      action: 'findCards',
      version: 6,
      params: { query },
    });
    const cards: AnkiConnectFindCardsResponseType = await response.json();
    return cards.result;
  };

  async getDueCards(deckName): Promise<number[]> {
    const cards = await this.getCardsIds('is:due -is:learn', deckName);
    let randomCards = cards.sort(() => Math.random() - 0.5);
    return randomCards;
  }

  async getLearnCards(deckName): Promise<number[]> {
    const cards = await this.getCardsIds('is:learn', deckName);
    return cards;
  }

  async getNewCards(deckName): Promise<number[]> {
    const cards = await this.getCardsIds('is:new', deckName);
    let randomCards = cards.sort(() => Math.random() - 0.5);
    return randomCards;
  }

  async getDeckStats(deckNames: string[]): Promise<Record<string, DeckStats>> {
    let response = await this.postToAnki({
      action: 'getDeckStats',
      version: 6,
      params: { decks: deckNames },
    });
    let decks: AnkiConnectDecksWithStatsResponse = await response.json();
    return decks.result;
  }

  async getDeckNames(): Promise<string[]> {
    let response = await this.postToAnki({ action: 'deckNames', version: 6 });
    let json: AnkiConnectDeckNamesResponseType = await response.json();
    return json.result;
  }

  async addCard(
    deckName: string,
    front: string,
    back: string
  ): Promise<{ success: boolean; message: string | null }> {
    let addNoteResponse = await this.postToAnki({
      action: 'addNote',
      version: 6,
      params: {
        note: {
          deckName: deckName,
          modelName: 'Basic',
          fields: {
            Front: front,
            Back: back,
          },
        },
      },
    });

    let response: AnkiConnectAddNoteResponseType = await addNoteResponse.json();
    if (response.error !== null) {
      return { success: false, message: response.error };
    } else {
      return { success: true, message: null };
    }
  }

  async updateCard(
    cardId: number,
    front: string,
    back: string
  ): Promise<{ success: boolean; message: string | null }> {
    let response = await this.postToAnki({
      action: 'updateNoteFields',
      version: 6,
      params: {
        note: {
          id: cardId,
          fields: {
            Front: front,
            Back: back,
          },
        },
      },
    });
    let json: AnkiConnectUpdateNoteResponseType = await response.json();
    if (json.error !== null) {
      return { success: false, message: json.error };
    } else {
      return { success: true, message: null };
    }
  }

  async deleteCard(cardId: number): Promise<DeleteResponseType> {
    let response = await this.postToAnki({
      action: 'deleteNotes',
      version: 6,
      params: {
        notes: [cardId],
      },
    });
    let json = await response.json();
    if (json.error !== null) {
      return { success: false, error: json.error };
    } else {
      return { success: true, error: null };
    }
  };
}
