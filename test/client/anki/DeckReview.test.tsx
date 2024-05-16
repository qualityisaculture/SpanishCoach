/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act } from 'react-dom/test-utils';
import {
  render,
  initialiseDOM,
  element
} from '../../reactTestExtensions';
import DeckReview, { DeckSummary } from '../../../src/client/anki/DeckReview';
import {
  beforeAnyCardsDue,
  dueCard1,
  dueDeck,
  learnCard,
  learnCard2,
  learnDeck,
  newCard,
  newDeck,
  oneSecondAfterLearnCard,
} from '../../builders/cards';
import { CardType } from '../../../src/Types';
import FetchMockHandler from '../../server/FetchMockHandler';
import { answerCardResponseType } from '../../../src/server/routes/anki';
import Card from '../../../src/client/anki/Card';
const mockCard = Card as jest.MockedClass<typeof Card>;
jest.mock('../../../src/client/anki/Card', () => {
  return jest.fn().mockReturnValue(<div id="card"></div>);
});

const fetchMockHandler = new FetchMockHandler();

function answerEasy() {
  let cardAnswered = mockCard.mock.calls[0][0].cardAnswered;
  act(() => {
    cardAnswered(4);
  });
}
function answerFail() {
  let cardAnswered = mockCard.mock.calls[0][0].cardAnswered;
  act(() => {
    cardAnswered(1);
  });
}
function backTapped() {
  let onBack = mockCard.mock.calls[0][0].onBack;
  act(() => {
    onBack();
  });
}
function expectCardToBe(card: CardType | null) {
  expect(mockCard).toHaveBeenLastCalledWith(
    {
      card: card,
      cardAnswered: expect.any(Function),
      studyNewCards: expect.any(Function),
      onBack: expect.any(Function),
    },
    expect.any(Object)
  );
}

describe('DeckReview', () => {
  let emptyDeck: CardType[] = [];
  const defaultProps = {
    dueDeck: emptyDeck,
    newDeck: emptyDeck,
    learnDeck: emptyDeck,
    onDone: jest.fn(),
  };
  const deepCopy = (object) => {
    return JSON.parse(JSON.stringify(object));
  };
  const dc = deepCopy;
  let fetchMock;
  beforeEach(() => {
    initialiseDOM();
    fetchMock = fetchMockHandler.beforeEach();
    mockCard.mockClear();
    jest.useFakeTimers();
  });
  afterEach(async () => {
    await fetchMockHandler.afterEach();
  });

  it('should pass null to Card when deck is empty', () => {
    let deck = [];
    render(<DeckReview {...defaultProps} dueDeck={deck} />);
    expectCardToBe(null);
  });

  it('should call done when back button is clicked', () => {
    render(<DeckReview {...defaultProps} />);
    backTapped();
    expect(defaultProps.onDone).toHaveBeenCalled();
  });

  it('should save the answer when button is clicked', () => {
    render(<DeckReview {...defaultProps} dueDeck={dueDeck} />);
    answerEasy();
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/answerCard', {
      method: 'POST',
      body: JSON.stringify({ cardId: 1, ease: 4 }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  describe('Deck Summary', () => {
    it('should display the number of cards in each deck', () => {
      render(
        <DeckSummary
          newDeck={[dueCard1, dueCard1]}
          learnDeck={[dueCard1, dueCard1, dueCard1]}
          dueDeck={[dueCard1]}
          currentDeck={'due'}
        />
      );
      expect(element('div')).toContainText('2 3 1');
    });

    it('should underline the new deck', () => {
      render(
        <DeckSummary
          newDeck={[dueCard1, dueCard1]}
          learnDeck={[dueCard1, dueCard1, dueCard1]}
          dueDeck={[dueCard1]}
          currentDeck={'new'}
        />
      );
      expect(element('div')).toContainHTML('<u>2</u>');
    });

    it('should underline the learn deck', () => {
      render(
        <DeckSummary
          newDeck={[dueCard1, dueCard1]}
          learnDeck={[dueCard1, dueCard1, dueCard1]}
          dueDeck={[dueCard1]}
          currentDeck={'learn'}
        />
      );
      expect(element('div')).toContainHTML('<u>3</u>');
    });

    it('should underline the due deck', () => {
      render(
        <DeckSummary
          newDeck={[dueCard1, dueCard1]}
          learnDeck={[dueCard1, dueCard1, dueCard1]}
          dueDeck={[dueCard1]}
          currentDeck={'due'}
        />
      );
      expect(element('div')).toContainHTML('<u>1</u>');
    });
  });

  describe('card order algorithm', () => {
    let algorithmProps = {
      dueDeck: dueDeck,
      newDeck: newDeck,
      learnDeck: learnDeck,
      onDone: jest.fn(),
    };

    beforeEach(() => {
      jest.setSystemTime(beforeAnyCardsDue);
    });
    it('should display the first card in the due deck', () => {
      render(<DeckReview {...algorithmProps} />);
      expectCardToBe(dueDeck[0]);
    });

    it('should display the first card in the new deck if the due deck is empty', () => {
      render(<DeckReview {...algorithmProps} dueDeck={[]} />);
      expectCardToBe(newDeck[0]);
    });

    it('should display the soonest card in the learn deck if the due and new decks are empty', () => {
      render(<DeckReview {...algorithmProps} dueDeck={[]} newDeck={[]} />);
      expectCardToBe(learnDeck[0]);
    });

    it('should display the soonest expired learn card regardless of other decks', () => {
      jest.setSystemTime(oneSecondAfterLearnCard); //Sun Jan 07 2024 13:35:44
      render(<DeckReview {...algorithmProps} />);
      expectCardToBe(learnDeck[0]);
    });

    it('should display the next due card when answer button is clicked', () => {
      render(<DeckReview {...algorithmProps} />);
      answerEasy();
      expectCardToBe(dueDeck[1]);
    });

    describe('next due date expired will be shown', () => {
      it('will show after due deck card is answered', () => {
        render(<DeckReview {...algorithmProps} />);
        expectCardToBe(dueDeck[0]);
        jest.setSystemTime(oneSecondAfterLearnCard);
        answerEasy();
        expectCardToBe(learnDeck[0]);
      });

      it('will show after new deck card is answered', () => {
        render(<DeckReview {...algorithmProps} dueDeck={[]} />);
        expectCardToBe(newDeck[0]);
        jest.setSystemTime(oneSecondAfterLearnCard);
        answerEasy();
        expectCardToBe(learnDeck[0]);
      });

      it('will show the next due card even if it isnt next in the deck', () => {
        render(
          <DeckReview
            {...algorithmProps}
            dueDeck={[]}
            newDeck={[]}
            learnDeck={[learnCard2, learnCard2, learnCard]}
          />
        );
        expectCardToBe(learnCard2);
        jest.setSystemTime(oneSecondAfterLearnCard);
        answerEasy();
        expectCardToBe(learnCard);
      });
    });

    describe('answer new cards', () => {
      //These all assume there are no expired due cards
      it('should display the first learn card when final new card is answered', () => {
        render(<DeckReview {...algorithmProps} dueDeck={[]} />);
        answerEasy();
        expectCardToBe(learnDeck[0]);
      });

      it('should put a successful new card in the learn deck before server responds', async () => {
        render(
          <DeckReview
            {...algorithmProps}
            dueDeck={[]}
            newDeck={dc(newDeck)}
            learnDeck={[]}
          />
        );
        answerEasy();
        let successResponse: answerCardResponseType = {
          success: true,
          message: null,
          card: learnDeck[0],
        };
        expectCardToBe(newDeck[0]);
        await fetchMockHandler.resolvePromise(0, successResponse);
      });

      it('should show new card after expired time is up', async () => {
        render(
          <DeckReview
            {...algorithmProps}
            dueDeck={[]}
            newDeck={dc(newDeck)}
            learnDeck={dc([learnCard2, learnCard2, learnCard2])}
          />
        );
        expectCardToBe(newDeck[0]);
        answerEasy();

        let newCardWithDueTime: CardType = JSON.parse(JSON.stringify(newCard));
        newCardWithDueTime.due = learnCard.due;
        let successResponse: answerCardResponseType = {
          success: true,
          message: null,
          card: newCardWithDueTime,
        };
        await fetchMockHandler.resolvePromise(0, successResponse);
        expectCardToBe(learnCard2);

        jest.setSystemTime(oneSecondAfterLearnCard);
        answerEasy();
        expectCardToBe(newCardWithDueTime);
      });
    });

    describe('answer learn cards', () => {
      it('set Card to null when final card answered', () => {
        render(<DeckReview {...algorithmProps} dueDeck={[]} newDeck={[]} />);
        answerEasy();
        expectCardToBe(null);
      });

      it('should put failed learn card back in the learn deck before server responds', async () => {
        render(
          <DeckReview
            {...algorithmProps}
            dueDeck={[]}
            learnDeck={dc([learnCard, learnCard2])}
            newDeck={[]}
          />
        );
        let card = JSON.parse(JSON.stringify(learnDeck[0]));
        answerFail();
        expectCardToBe(learnCard2);
        answerEasy();
        expectCardToBe({...learnCard, due: null});
      });

      it('should updated the failed learn card with new due date when server responds', async () => {
        render(
          <DeckReview
            {...algorithmProps}
            dueDeck={[]}
            learnDeck={dc([learnCard, learnCard2])}
            newDeck={[]}
          />
        );
        let card = JSON.parse(JSON.stringify(learnDeck[0]));
        answerFail();
        expectCardToBe(learnCard2);
        let failResponse: answerCardResponseType = {
          success: true,
          message: null,
          card: card,
        };
        await fetchMockHandler.resolvePromise(0, failResponse);
        answerEasy();
        expectCardToBe(learnCard);
      });

      it('should put the successful learn card in the due deck(with the due time reset) before server responds when "left" is 2', async () => {
        render(
          <DeckReview
            {...algorithmProps}
            dueDeck={[]}
            learnDeck={dc([learnCard2])}
            newDeck={[]}
          />
        );
        answerEasy();
        expectCardToBe({ ...learnCard2, due: null });
      });
    });

    describe('answer due cards', () => {
      it('should display the first new card when final due card is answered', () => {
        render(<DeckReview {...algorithmProps} />);
        answerEasy();
        answerEasy();
        expectCardToBe(newDeck[0]);
      });
    });

    it('should display the same card again after its due time is up', async () => {
      jest.setSystemTime(beforeAnyCardsDue);
      let due = dueDeck;
      render(
        <DeckReview
          {...algorithmProps}
          dueDeck={dc(due)}
          newDeck={[]}
          learnDeck={[]}
        />
      );
      answerEasy();
      let failResponse: answerCardResponseType = {
        success: true,
        message: null,
        card: learnDeck[0],
      };
      await fetchMockHandler.resolvePromise(0, failResponse);
      expectCardToBe(due[1]);

      jest.setSystemTime(oneSecondAfterLearnCard);
      answerEasy();
      expectCardToBe(learnDeck[0]);
    });

    describe('new cards disabled', () => {
      function setStudyNewCardsTo(enabled: boolean) {
        act(() => {
          mockCard.mock.calls[0][0].studyNewCards(enabled);
        });
      }
      let defaultNewCardsProps = {
        newDeck: [],
        learnDeck: [],
        dueDeck: [],
        onDone: jest.fn(),
      };
      it('should not show new cards when newCards is called', () => {
        render(<DeckReview {...defaultNewCardsProps} newDeck={[newCard]} />);
        expectCardToBe(newCard);
        setStudyNewCardsTo(false);
        expectCardToBe(null);
      });

      it('should show new cards when newCards is called again', () => {
        render(<DeckReview {...defaultNewCardsProps} newDeck={[newCard]} />);
        setStudyNewCardsTo(false);
        setStudyNewCardsTo(true);
        expectCardToBe(newCard);
      });

      it('should skip new card when newCards is called', () => {
        render(
          <DeckReview
            {...defaultNewCardsProps}
            dueDeck={[dueCard1]}
            newDeck={[newCard]}
          />
        );
        setStudyNewCardsTo(false);
        expectCardToBe(dueCard1);
        answerEasy();
        expectCardToBe(null);
      });
    });
  });
});
