import React from 'react';
import { Card as CardType } from '../../Types';
import Card from './Card';
import ButtonRow from '../components/ButtonRow';
import {
  answerCardRequestType,
  answerCardResponseType,
} from '../../server/routes/anki';
import { Typography } from 'antd';
const { Text, Paragraph } = Typography;

type Props = {
  newDeck: CardType[];
  learnDeck: CardType[];
  dueDeck: CardType[];
  onDone: () => void;
};
type State = {
  newDeck: CardType[];
  learnDeck: CardType[];
  dueDeck: CardType[];
  currentCard: CardType | null;
  currentDeck: string;
  newCardsEnabled: boolean;
};

export default class DeckReview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { card, deck } = this.getNextCardAndDeck(
      props.newDeck,
      props.learnDeck,
      props.dueDeck
    );
    
    this.state = {
      dueDeck: this.props.dueDeck,
      learnDeck: this.props.learnDeck,
      newDeck: this.props.newDeck,
      currentCard: card,
      currentDeck: deck,
      newCardsEnabled: true,
    };
  }

  getNextCardAndDeck = (
    newCards: CardType[],
    learnCards: CardType[],
    dueCards: CardType[]
  ): { card: CardType | null; deck: string } => {
    let mostExpired = this.getMostExpiredCard(learnCards);
    if (mostExpired) {
      return { card: mostExpired, deck: 'learn' };
    }
    if (dueCards.length > 0) {
      return { card: dueCards[0], deck: 'due' };
    }
    if (newCards.length > 0) {
      return { card: newCards[0], deck: 'new' };
    }
    if (learnCards.length > 0) {
      return { card: learnCards[0], deck: 'learn' };
    }
    return { card: null, deck: '' };
  };

  getMostExpiredCard = (learn: CardType[]): CardType | null => {
    let now = Date.now();
    let expiredCards = learn.filter((card) => {
      return card.due && card.due < now;
    });
    if (expiredCards.length == 0) {
      return null;
    }
    let mostExpired = expiredCards[0];
    expiredCards.forEach((card) => {
      //@ts-ignore because cards with due === null are filtered out
      if (card.due && card.due < mostExpired.due) {
        mostExpired = card;
      }
    });
    return mostExpired;
  };

  updateCard = (gotAnswerWrong: boolean) => {
    let dueCards = this.state.dueDeck.slice();
    let learnCards = this.state.learnDeck.slice();
    let newCards = this.state.newDeck.slice();
    if (this.state.currentDeck === 'due' && dueCards.length > 0) {
      dueCards = dueCards.filter(
        (card) => card.id !== this.state.currentCard?.id
      );
    }
    if (this.state.currentDeck === 'new' && newCards.length > 0) {
      newCards = newCards.filter(
        (card) => card.id !== this.state.currentCard?.id
      );
    }
    if (this.state.currentDeck === 'learn' && learnCards.length > 0) {
      learnCards = learnCards.filter(
        (card) => card.id !== this.state.currentCard?.id
      );
    }
    if (this.state.currentDeck === 'new' || gotAnswerWrong || this.state.currentCard?.leftToStudy === 2) {
      let currentCard = this.state.currentCard as CardType;
      currentCard.due = null;
      learnCards.push(currentCard);
    }
    this.setState({
      dueDeck: dueCards,
      learnDeck: learnCards,
      newDeck: newCards,
    });
    this.setNextCard(newCards, learnCards, dueCards, this.state.newCardsEnabled);
  };

  setNextCard = (newCards: CardType[], learnCards: CardType[], dueCards: CardType[], newCardsEnabled: boolean) => {
    const { card, deck } = this.getNextCardAndDeck(
      newCardsEnabled ? newCards : [],
      learnCards,
      dueCards
    );
    this.setState({ currentCard: card, currentDeck: deck, newCardsEnabled });
  };

  updateServerWithCardAnswered = async (ease: 1 | 2 | 3 | 4) => {
    if (this.state.currentCard === null) {
      throw new Error('No card to answer');
    }
    let body: answerCardRequestType = {
      cardId: this.state.currentCard.id,
      ease: ease,
    };
    const response = await global.fetch('/answerCard', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json: answerCardResponseType = await response.json();
    let newLearnCard: CardType | null = null;
    if (json.card) {
      newLearnCard = json.card as CardType;
      if (newLearnCard === null) return;
      let learnCards = this.state.learnDeck.filter(
        (card) => card.id !== newLearnCard?.id
      );
      learnCards.push(newLearnCard);
      this.setState({ learnDeck: learnCards });
    }
  };
  cardAnswered = (ease: 1 | 2 | 3 | 4) => {
    if (this.state.currentCard === null) {
      throw new Error('No card to answer');
    }
    this.updateCard(ease === 1); //TODO: this is wrong as sometimes cards are learn and need to be studied again
    this.updateServerWithCardAnswered(ease);
  };
  setNewCardsEnabled = (newCardsEnabled: boolean) => {
    this.setNextCard(this.state.newDeck, this.state.learnDeck, this.state.dueDeck, newCardsEnabled);
  }
  render() {
    return (
      <>
        {this.state.currentCard === null ? (
          <>
            <ButtonRow
              buttons={[{ text: 'Back', key: 'back' }]}
              onClick={this.props.onDone}
            />
            <Paragraph className='card'>No cards in deck</Paragraph>
          </>
        ) : (
          <>
            <DeckSummary {...this.state} />
            <Card
              newCards={this.setNewCardsEnabled}
              onBack={this.props.onDone}
              cardAnswered={this.cardAnswered}
              card={this.state.currentCard}
            />
          </>
        )}
      </>
    );
  }
}

type DeckSummaryProps = {
  dueDeck: CardType[];
  newDeck: CardType[];
  learnDeck: CardType[];
  currentDeck: string;
};
export const DeckSummary = (props: DeckSummaryProps) => {
  //You need to set the key here to force a re-render 
  //because the underline prop doesn't trigger a re-render 
  //if the value is the same in antd
  return (
    <>
      <Text>Due: </Text>
      <Text key={"new" + (props.currentDeck == 'new') + " " + props.newDeck.length} underline={props.currentDeck == 'new' ? true : false}>
        {props.newDeck.length}
      </Text>
      &nbsp;
      <Text key={"learn" + (props.currentDeck == 'learn') + " " + props.learnDeck.length} underline={props.currentDeck == 'learn' ? true : false}>
        {props.learnDeck.length}
      </Text>
      &nbsp;
      <Text key={"due" + (props.currentDeck == 'due') + " " + props.dueDeck.length} underline={props.currentDeck == 'due' ? true : false}>
        {props.dueDeck.length}
      </Text>
    </>
  );
};
