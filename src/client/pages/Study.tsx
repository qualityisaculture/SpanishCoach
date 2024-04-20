import React from 'react';
import DeckListLoader from '../anki/DeckListLoader';
import DeckReviewLoader from '../anki/DeckReviewLoader';

type Props = {};
type State = {
    selectedDeck: string | null;
};
export default class Study extends React.Component<Props, State>{
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedDeck: null
    };
  }
  onDeckSelect = (deckName: string) => {
    this.setState({ selectedDeck: deckName });
  }
  onDone = () => {
    this.setState({ selectedDeck: null });
  }
  render() {
    if (this.state.selectedDeck !== null) {
      return <DeckReviewLoader onDone={this.onDone} deckName={this.state.selectedDeck}/>;
    } else {
        return <DeckListLoader onSelectDeck={this.onDeckSelect}/>;
    }
  }
}
