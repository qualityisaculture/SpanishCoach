import React, { useEffect, useState } from 'react';
import DeckDropdown from './DeckDropdown';
import type { ComponentProps } from "react";

type Props = {
  onSaveToDeck: ComponentProps<typeof DeckDropdown>["onSaveToDeck"],
}
type State = {
  decks: string[];
}
export default class DeckDropdownLoader extends React.Component<Props, State>{
  constructor(props: Props) {
    super(props);
    this.state = {
      decks: [],
    };
    const fetchDecks = async () => {
      let response = await global.fetch('/decks');
      let json = await response.json();
      this.setState({ decks: json.result });
    };
    fetchDecks();
  }
  render() {
    return <DeckDropdown decks={this.state.decks} onSaveToDeck={this.props.onSaveToDeck} />;
  }
}
