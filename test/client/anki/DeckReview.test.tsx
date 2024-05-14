/**
 * @jest-environment jsdom
 */

import React from 'react';
import {
  render,
  initialiseDOM,
  element,
  elements,
  click,
  button,
  switches,
} from '../../reactTestExtensions';
import DeckReview, { DeckSummary } from '../../../src/client/anki/DeckReview';
import {
  beforeAnyCardsDue,
  card1,
  dueDeck,
  learnCard,
  learnCard2,
  learnDeck,
  newCard,
  newDeck,
  oneSecondAfterLearnCard,
} from '../../builders/cards';
import { Card } from '../../../src/Types';
import FetchMockHandler from '../../server/FetchMockHandler';
import { cli } from 'webpack';
import { answerCardResponseType } from '../../../src/server/routes/anki';

const fetchMockHandler = new FetchMockHandler();

describe('DeckReview', () => {
  const front = () => elements('h4')[0];
  const back = () => elements('h4')[1];
  let emptyDeck: Card[] = [];
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
    jest.useFakeTimers();
  });
  afterEach(async () => {
    await fetchMockHandler.afterEach();
  });

  it('displays a back button when deck is empty', () => {
    render(<DeckReview {...defaultProps} />);
    expect(document.body.innerHTML).toContain('Back');
  });

  it('should display a message if deck is empty', () => {
    let deck = [];
    render(<DeckReview {...defaultProps} dueDeck={deck} />);
    expect(document.body.innerHTML).toContain('No cards in deck');
  });

  it('should call done when back button is clicked', () => {
    render(<DeckReview {...defaultProps} />);
    click(button('Back'));
    expect(defaultProps.onDone).toHaveBeenCalled();
  });

  it('should save the answer when button is clicked', () => {
    render(<DeckReview {...defaultProps} dueDeck={dueDeck} />);
    click(element('.card'));
    click(button('Easy'));
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
          newDeck={[card1, card1]}
          learnDeck={[card1, card1, card1]}
          dueDeck={[card1]}
          currentDeck={'due'}
        />
      );
      expect(element('div')).toContainText('2 3 1');
    });

    it('should underline the new deck', () => {
      render(
        <DeckSummary
          newDeck={[card1, card1]}
          learnDeck={[card1, card1, card1]}
          dueDeck={[card1]}
          currentDeck={'new'}
        />
      );
      expect(element('div')).toContainHTML('<u>2</u>');
    });

    it('should underline the learn deck', () => {
      render(
        <DeckSummary
          newDeck={[card1, card1]}
          learnDeck={[card1, card1, card1]}
          dueDeck={[card1]}
          currentDeck={'learn'}
        />
      );
      expect(element('div')).toContainHTML('<u>3</u>');
    });

    it('should underline the due deck', () => {
      render(
        <DeckSummary
          newDeck={[card1, card1]}
          learnDeck={[card1, card1, card1]}
          dueDeck={[card1]}
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
      expect(document.body.innerHTML).toContain(dueDeck[0].front);
    });

    it('should display the first card in the new deck if the due deck is empty', () => {
      render(<DeckReview {...algorithmProps} dueDeck={[]} />);
      expect(document.body.innerHTML).toContain(newDeck[0].front);
    });

    it('should display the soonest card in the learn deck if the due and new decks are empty', () => {
      render(<DeckReview {...algorithmProps} dueDeck={[]} newDeck={[]} />);
      expect(document.body.innerHTML).toContain(learnDeck[0].front);
    });

    it('should display the soonest expired learn card regardless of other decks', () => {
      jest.setSystemTime(oneSecondAfterLearnCard); //Sun Jan 07 2024 13:35:44
      render(<DeckReview {...algorithmProps} />);
      expect(document.body.innerHTML).toContain(learnDeck[0].front);
    });

    it('should display the next due card when answer button is clicked', () => {
      render(<DeckReview {...algorithmProps} />);
      click(element('.card'));
      click(button('Easy'));
      expect(document.body.innerHTML).toContain(dueDeck[1].front);
    });

    describe('next due date expired will be shown', () => {
      it('will show after due deck card is answered', () => {
        render(<DeckReview {...algorithmProps} />);
        expect(document.body.innerHTML).toContain(dueDeck[0].front);
        jest.setSystemTime(oneSecondAfterLearnCard);
        click(element('.card'));
        click(button('Easy'));
        expect(document.body.innerHTML).toContain(learnDeck[0].front);
      });

      it('will show after new deck card is answered', () => {
        render(<DeckReview {...algorithmProps} dueDeck={[]} />);
        expect(document.body.innerHTML).toContain(newDeck[0].front);
        jest.setSystemTime(oneSecondAfterLearnCard);
        click(element('.card'));
        click(button('Easy'));
        expect(document.body.innerHTML).toContain(learnDeck[0].front);
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
        expect(document.body.innerHTML).toContain(learnCard2.front);
        jest.setSystemTime(oneSecondAfterLearnCard);
        click(element('.card'));
        click(button('Easy'));
        expect(document.body.innerHTML).toContain(learnCard.front);
      });
    });

    describe('answer new cards', () => {
      //These all assume there are no expired due cards
      it('should display the first learn card when final new card is answered', () => {
        render(<DeckReview {...algorithmProps} dueDeck={[]} />);
        click(element('.card'));
        click(button('Easy'));
        expect(document.body.innerHTML).toContain(learnDeck[0].front);
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
        click(element('.card'));
        click(button('Easy'));
        let successResponse: answerCardResponseType = {
          success: true,
          message: null,
          card: learnDeck[0],
        };
        expect(document.body.innerHTML).toContain(newDeck[0].front);
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
        click(element('.card'));
        click(button('Easy'));

        let newCardWithDueTime: Card = JSON.parse(JSON.stringify(newCard));
        newCardWithDueTime.due = learnCard.due;
        let successResponse: answerCardResponseType = {
          success: true,
          message: null,
          card: newCardWithDueTime,
        };
        await fetchMockHandler.resolvePromise(0, successResponse);
        expect(document.body.innerHTML).toContain(learnCard2.front);

        jest.setSystemTime(oneSecondAfterLearnCard);
        click(element('.card'));
        click(button('Easy'));
        expect(front()).toContainText(newDeck[0].front);
      });
    });

    describe('answer learn cards', () => {
      it('should display message when final card answered', () => {
        render(<DeckReview {...algorithmProps} dueDeck={[]} newDeck={[]} />);
        click(element('.card'));
        click(button('Easy'));
        expect(document.body.innerHTML).toContain('No cards in deck');
      });

      it('should put failed learn card back in the learn deck before server responds', async () => {
        render(
          <DeckReview
            {...algorithmProps}
            dueDeck={[]}
            learnDeck={dc(learnDeck)}
            newDeck={[]}
          />
        );
        click(element('.card'));
        click(button('Again'));
        let card = JSON.parse(JSON.stringify(learnDeck[0]));
        let failResponse: answerCardResponseType = {
          success: true,
          message: null,
          card: card,
        };
        await fetchMockHandler.resolvePromise(0, failResponse);
        expect(document.body.innerHTML).toContain(learnDeck[0].front);
      });

      it('should put the successful learn card in the due deck before server responds when left is 2', async () => {
        render(
          <DeckReview
            {...algorithmProps}
            dueDeck={[]}
            learnDeck={dc([learnCard2])}
            newDeck={[]}
          />
        );
        click(element('.card'));
        click(button('Easy'));
        expect(document.body.innerHTML).toContain(learnCard2.front);
      });
    });

    describe('answer due cards', () => {
      it('should display the first new card when final due card is answered', () => {
        render(<DeckReview {...algorithmProps} />);
        click(element('.card'));
        click(button('Easy'));
        click(element('.card'));
        click(button('Easy'));
        expect(document.body.innerHTML).toContain(newDeck[0].front);
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
      click(element('.card'));
      click(button('Again'));
      let failResponse: answerCardResponseType = {
        success: true,
        message: null,
        card: learnDeck[0],
      };
      await fetchMockHandler.resolvePromise(0, failResponse);
      expect(document.body.innerHTML).toContain(due[1].front);

      jest.setSystemTime(oneSecondAfterLearnCard);
      click(element('.card'));
      click(button('Easy'));
      expect(front()).toContainText(learnDeck[0].front);
    });

    describe('new cards disabled', () => {
      it.only('should not show new cards when newCards is called', () => {
        render(
          <DeckReview
            {...algorithmProps}
            newDeck={dc(newDeck)}
            dueDeck={[]}
            learnDeck={[]}
          />
        );
        expect(document.body.innerHTML).toContain(newDeck[0].front);
        click(switches()[0]);
        expect(document.body.innerHTML).toContain('No cards in deck');
      });

      it.only('should skip new card when newCards is called', () => {
        render(
          <DeckReview
            {...algorithmProps}
            dueDeck={dc(dueDeck.slice(0, 1))}
            newDeck={dc(newDeck)}
            learnDeck={[]}
          />
        );
        click(switches()[0]);
        expect(document.body.innerHTML).toContain(dueDeck[0].front);
        click(element('.card'));
        click(button('Easy'));
        expect(document.body.innerHTML).toContain('No cards in deck');
      });
    });
  });
});
