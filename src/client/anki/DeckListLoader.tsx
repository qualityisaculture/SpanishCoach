import React from 'react';
import { DeckStats } from '../../Types';
import ServerHandler from '../ServerHandler';
import DeckList from './DeckList';
import { Typography } from 'antd';
const { Paragraph } = Typography;

type Props = {
  onSelectDeck: (deckName: string) => void;
};
type State = {
  decks: Record<string, DeckStats> | null;
};
export default class DeckListLoader extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      decks: null,
    };
    let serverHandler = new ServerHandler(this.deckListCallback);
    serverHandler.request('/allDecksWithStats');
  }
  deckListCallback = (json, isFinal: boolean) => {
    if (json.result) {
      this.setState({ decks: json.result });
    }
  };
  render() {
    if (this.state.decks !== null) {
      let decks = this.state.decks;
      return (
        <DeckList
          decks={Object.values(decks)}
          onSelectDeck={this.props.onSelectDeck}
        />
      );
    }
    return <Paragraph>Loading...</Paragraph>;
  }
}
