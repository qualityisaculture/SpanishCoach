import React from 'react';
import { DeckStats } from '../../Types';
import DeckButton from './DeckButton';
import { List } from 'antd';
import { red, green, blue, gray } from '@ant-design/colors';

type Props = {
  decks: DeckStats[];
  onSelectDeck: (deckName: string) => void;
};
export default class DeckList extends React.Component<Props> {
  render() {
    if (this.props.decks.length === 0) {
      return <div className=".deckList">No decks</div>;
    }
    return (
      <List
        className=".deckList"
        size="small"
        dataSource={this.props.decks}
        renderItem={(deck: DeckStats) => (
          <List.Item
            className='deck-row'
            onClick={() => {
              this.props.onSelectDeck(deck.name);
            }}
            extra={[
              <div key={deck.name}>
                <span style={{ color: deck.new_count > 0 ? blue[6]: gray[3] }}>{deck.new_count}</span>
                &nbsp;
                <span style={{ color: deck.learn_count > 0 ? red[6]: gray[3] }}>{deck.learn_count}</span>
                &nbsp;
                <span style={{ color: deck.review_count > 0 ? green[6]: gray[3] }}>{deck.review_count}</span>
              </div>,
            ]}
          >
            {deck.name}
          </List.Item>
        )}
      />
    );
  }
}
