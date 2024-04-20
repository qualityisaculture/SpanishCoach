import React from 'react';
import { Divider } from 'antd';
import { Translator } from '../Translator';
import DeckDropdownLoader from '../anki/DeckDropdownLoader'
import { translationDirections } from '../../Enums';
type Props = {
  focusRef: any;
};
type State = {
  translation: { spanish: string; english: string } | null;
};
export default class Search extends React.Component<Props, State> {
  focusRef: any;
  translation: any;
  constructor(props) {
    super(props);
    this.focusRef = this.props.focusRef;
    this.state = {
      translation: null,
    };
  }
  onSaveToDeck = async (
    selectedDeck: string,
    direction: translationDirections,
    callback: (response: { success: boolean; message: string }) => void
  ) => {
    const deck = selectedDeck;
    let front =
      direction === translationDirections.SpanishToEnglish
        ? this.translation.spanish
        : this.translation.english;
    let back =
      direction === translationDirections.SpanishToEnglish
        ? this.translation.english
        : this.translation.spanish;
    let response = await global.fetch('/addCard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deckName: deck,
        front: front,
        back: back,
      }),
    });
    let json = await response.json();
    callback(json);
  };
  onTranslation = (selectedTranslation) => {
    this.translation = selectedTranslation;
  };
  render() {
    return (
      <>
        <Translator
          onTranslation={this.onTranslation}
          focusRef={this.focusRef}
        />
        <Divider />
        <DeckDropdownLoader
          onSaveToDeck={this.onSaveToDeck}
        />
      </>
    );
  }
}
