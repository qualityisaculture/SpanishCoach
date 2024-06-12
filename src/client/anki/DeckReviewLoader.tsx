import React from 'react';
import DeckReview from './DeckReview';
import ServerHandler from '../ServerHandler';
import { CardType, Cards } from '../../Types';
import { dueCardsRequestType, dueCardsResponseType } from '../../server/routes/anki';
import { Typography } from 'antd';
const { Paragraph } = Typography;

type Props = {
    deckName: string;
    onDone: () => void;
};
type State = {
  due: CardType[] | null;
  learn: CardType[] | null;
  new: CardType[] | null;
};
export default class DeckReviewLoader extends React.Component<Props, State>{
  constructor(props) {
    super(props);
    this.state = {
      due: null,
      learn: null,
      new: null,
    };
    let serverHandler = new ServerHandler(this.deckListCallback);
    serverHandler.request('/dueCards?deck=' + this.props.deckName);
  }
  deckListCallback = (json: dueCardsResponseType, isFinal) => {
    if (json.due) {
      this.setState({ due: json.due, learn: json.learn, new: json.new});
    }
  };
  render() {
    if (this.state.due === null || this.state.learn === null || this.state.new === null) {
      return <Paragraph>Loading...</Paragraph>;
    }
    return <DeckReview onDone={this.props.onDone} dueDeck={this.state.due} learnDeck={this.state.learn} newDeck={this.state.new}/>;
  }
}
