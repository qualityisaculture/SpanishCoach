/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, initialiseDOM, element, elements } from "../../reactTestExtensions";
import DeckList from "../../../src/client/anki/DeckList";
import { deckWithStats1, deckWithStats2, decksWithStats} from "../../builders/anki";

//Needed because matchMedia is not implemented in jsdom
//https://jestjs.io/docs/29.4/manual-mocks
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

describe('DeckList', () => {
    const defaultProps = {
        decks: [],
        onSelectDeck: jest.fn(),
    };
    const decks = () => elements(".ant-list-item");
    const deck = () => element(".ant-list-item");
    beforeEach(() => {
        initialiseDOM();
    });
    it('displays an empty list when there are no decks', () => {
        render(<DeckList {...defaultProps}/>);
        expect(deck()).toBeNull();
    });

    it('displays a list of decks', () => {
        render(<DeckList {...defaultProps} decks={[deckWithStats1, deckWithStats2]} />);
        expect(decks().length).toBe(2);
        expect(decks()[0].textContent).toContain(deckWithStats1.name);
        expect(decks()[1].textContent).toContain(deckWithStats2.name);
    });

    it('calls the onSelectDeck function when a deck is clicked', () => {
        const onSelectDeck = jest.fn();
        render(<DeckList {...defaultProps} decks={[deckWithStats1, deckWithStats2]} onSelectDeck={onSelectDeck} />);
        const deckButton = deck();
        deckButton.click();
        expect(onSelectDeck).toHaveBeenCalledWith(deckWithStats1.name);
    });
});