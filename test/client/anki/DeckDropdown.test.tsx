/**
 * @jest-environment jsdom
 */

import React, { useState } from 'react';
import DeckDropdown  from '../../../src/client/anki/DeckDropdown';
import { translationDirections } from '../../../src/Enums';
import {
  initialiseDOM,
  render,
  renderAndWait,
  element,
  elements,
  change,
  click,
  clickAndWait,
} from '../../reactTestExtensions';
import { act } from 'react-dom/test-utils';

describe('DeckSelector', () => {
  const defaultProps = {
    decks: [],
    onSaveToDeck: jest.fn(),
  };
  const saveButton = () => element('.ant-btn-compact-first-item');
  const loadingIcon = () => element('.ant-btn-loading-icon');
  const switchDirectionButton = () => element('.ant-btn-primary');
  beforeEach(() => {
    initialiseDOM();
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => [],
    });
  });
  it('renders a loading message when no decks are available', () => {
    render(<DeckDropdown {...defaultProps} />);
    expect(element('button')).toContainText('Loading...');
  });

  it('hides the loading indicator when decks are loaded', () => {
    const decks = ['deck1', 'deck2'];
    render(<DeckDropdown {...defaultProps} decks={decks} />);
    expect(element('button')).not.toContainText('Loading...');
  });

  it('shows the first deck when decks are loaded', () => {
    const decks = ['deck1', 'deck2'];
    render(<DeckDropdown {...defaultProps} />);
    render(<DeckDropdown {...defaultProps} decks={decks} />);
    expect(element('button')).toContainText('Save to deck1');
  });

  it('renders the list of decks as a dropdown when menu is open', async () => {
    const decks = ['deck1', 'deck2'];
    await renderAndWait(<DeckDropdown open {...defaultProps} decks={decks} />);
    let button = element('.ant-dropdown-trigger');
    click(button);
    let list = element('ul');
    expect(list).not.toBeNull();
    let listItems = elements('li');
    expect(listItems).toHaveLength(2);
    expect(listItems[0]).toContainText('deck1');
    expect(listItems[1]).toContainText('deck2');
  });

  describe('saving', () => {
    it('calls onSaveToDeck with first deck when button is clicked', () => {
      const decks = ['deck1', 'deck2'];
      const onSaveToDeck = jest.fn();
      render(<DeckDropdown decks={decks} onSaveToDeck={onSaveToDeck} />);
      click(saveButton());
      expect(onSaveToDeck).toHaveBeenCalledWith(
        'deck1',
        expect.anything(),
        expect.any(Function)
      );
    });

    it('default save direction is SpanishToEnglish', async () => {
      const decks = ['deck1', 'deck2'];
      const onSaveToDeck = jest.fn();
      await renderAndWait(<DeckDropdown open decks={decks} onSaveToDeck={onSaveToDeck} />);
      click(saveButton());
      expect(onSaveToDeck).toHaveBeenCalledWith(
        'deck1',
        translationDirections.SpanishToEnglish,
        expect.any(Function)
      );
      expect(switchDirectionButton()).toContainText('English to Spanish');
    });

    it('calls onSaveToDeck with second deck when second deck is selected and button is clicked', async () => {
      const decks = ['deck1', 'deck2'];
      const onSaveToDeck = jest.fn();
      await renderAndWait(
        <DeckDropdown open decks={decks} onSaveToDeck={onSaveToDeck} />
      );
      let option2 = element('li:nth-child(2)');
      click(option2);
      click(saveButton());
      expect(onSaveToDeck).toHaveBeenCalledWith(
        'deck2',
        translationDirections.SpanishToEnglish,
        expect.any(Function)
      );
    });

    it('switches save direction to EnglishToSpanish when button is clicked', async () => {
      const decks = ['deck1', 'deck2'];
      const onSaveToDeck = jest.fn();
      await renderAndWait(<DeckDropdown open decks={decks} onSaveToDeck={onSaveToDeck} />);
      await clickAndWait(switchDirectionButton());
      expect(switchDirectionButton()).toContainText('Spanish to English');
      click(saveButton());
      expect(onSaveToDeck).toHaveBeenCalledWith(
        'deck1',
        translationDirections.EnglishToSpanish,
        expect.any(Function)
      );
    });

    it('displays "saving" when button is clicked', () => {
      const decks = ['deck1', 'deck2'];
      render(<DeckDropdown {...defaultProps} decks={decks} />);
      click(saveButton());
      expect(saveButton()).toContainText('Saving...');
      expect(loadingIcon()).not.toBeNull();
    });

    describe('server response', () => {
      const successAlertMessage = () => element('.ant-alert-success');
      const errorAlertMessage = () => element('.ant-alert-error');
      const serverRespondsWith = (response) => {
        const decks = ['deck1', 'deck2'];
        const onSaveToDeck = jest.fn();
        render(
          <DeckDropdown
            {...defaultProps}
            decks={decks}
            onSaveToDeck={onSaveToDeck}
          />
        );
        click(saveButton());
        act(() => {
          onSaveToDeck.mock.calls[0][2](response);
        });
      };
      it('displays "save to deck" again after successful save', () => {
        serverRespondsWith({ success: true });
        expect(saveButton()).toContainText('Save to deck1');
        expect(loadingIcon()).toBeNull();
      });

      it('displays "save successful" after successful save', () => {
        serverRespondsWith({ success: true });
        expect(successAlertMessage()).toContainText('Save Successful');
      });

      it('hides "save successful" after save button is clicked again', () => {
        serverRespondsWith({ success: true });
        click(saveButton());
        expect(successAlertMessage()).toBeNull();
      });

      it('displays "save to deck" again after failed save', () => {
        serverRespondsWith({ success: false });
        expect(saveButton()).toContainText('Save to deck1');
        expect(loadingIcon()).toBeNull();
      });

      it('displays "save failed" after failed save', () => {
        serverRespondsWith({ success: false });
        expect(errorAlertMessage()).toContainText('Save Failed');
      });

      it('displays error message after failed save', () => {
        serverRespondsWith({ success: false, message: 'Duplicate detected' });
        expect(errorAlertMessage()).toContainText('Duplicate detected');
      });

      it('hides "save failed" after save button is clicked again', () => {
        serverRespondsWith({ success: false });
        click(saveButton());
        expect(errorAlertMessage()).toBeNull();
      });
    });
  });
});
