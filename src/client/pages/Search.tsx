import React from 'react';
import { Divider } from 'antd';
import { Translator } from '../Translator';
import ExplanationMode from '../components/ExplanationMode';
import ModeToggle from '../components/ModeToggle';
import DeckDropdownLoader from '../anki/DeckDropdownLoader'
import { translationDirections, AppMode } from '../../Enums';

type Props = {
  focusRef: any;
};

type State = {
  currentMode: AppMode;
  translation: { spanish: string; english: string } | null;
  explanation: { spanish: string; explanation: string } | null;
};

export default class Search extends React.Component<Props, State> {
  focusRef: any;
  translation: any;
  explanation: any;

  constructor(props) {
    super(props);
    this.focusRef = this.props.focusRef;
    this.state = {
      currentMode: AppMode.Explanation, // Default to explanation mode
      translation: null,
      explanation: null,
    };
  }

  onModeChange = (newMode: AppMode) => {
    this.setState({ currentMode: newMode });
  };

  onSaveToDeck = async (
    selectedDeck: string,
    direction: translationDirections,
    callback: (response: { success: boolean; message: string }) => void
  ) => {
    const deck = selectedDeck;
    let front: string;
    let back: string;

    if (this.state.currentMode === AppMode.Explanation) {
      // For explanation mode, save Spanish word/phrase as front, explanation as back
      if (!this.explanation || !this.explanation.spanish || !this.explanation.explanation) {
        callback({ success: false, message: 'No explanation available to save' });
        return;
      }
      front = this.explanation.spanish;
      back = this.explanation.explanation;
    } else {
      // For translation mode, use existing logic
      if (!this.translation) {
        callback({ success: false, message: 'No translation available to save' });
        return;
      }
      front =
        direction === translationDirections.SpanishToEnglish
          ? this.translation.spanish
          : this.translation.english;
      back =
        direction === translationDirections.SpanishToEnglish
          ? this.translation.english
          : this.translation.spanish;
    }

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

  onExplanation = (selectedExplanation) => {
    this.explanation = selectedExplanation;
  };

  render() {
    const { currentMode } = this.state;

    return (
      <>
        <ModeToggle
          currentMode={currentMode}
          onModeChange={this.onModeChange}
        />
        
        {currentMode === AppMode.Explanation ? (
          <ExplanationMode
            onExplanation={this.onExplanation}
            focusRef={this.focusRef}
          />
        ) : (
          <Translator
            onTranslation={this.onTranslation}
            focusRef={this.focusRef}
            defaultInputLanguage='english'
          />
        )}
        
        <Divider />
        <DeckDropdownLoader
          onSaveToDeck={this.onSaveToDeck}
        />
      </>
    );
  }
}
