/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, initialiseDOM, element } from "../../reactTestExtensions";
import DeckButton from "../../../src/client/anki/DeckButton";
import { deckWithStats1, deckWithStats2 } from "../../builders/anki";

describe('DeckButton', () => {
    const defaultProps = {
        deck: deckWithStats1,
        onSelectDeck: jest.fn(),
    };
    const deckButton = () => element(".deckButton");
    beforeEach(() => {
        initialiseDOM();
    });

    it('displays the deck name', () => {
        render(<DeckButton {...defaultProps} />);
        expect(deckButton().textContent).toContain(deckWithStats1.name);
    });

    it('displays the number of new cards', () => {
        render(<DeckButton {...defaultProps} />);
        expect(deckButton().textContent).toContain(deckWithStats1.new_count.toString());
    });

    it('displays the number of learn cards', () => {
        render(<DeckButton {...defaultProps} />);
        expect(deckButton().textContent).toContain(deckWithStats1.learn_count.toString());
    });

    it('displays the number of review cards', () => {
        render(<DeckButton  {...defaultProps} />);
        expect(deckButton().textContent).toContain(deckWithStats1.review_count.toString());
    });

    it('calls the onSelectDeck function when clicked', () => {
        render(<DeckButton {...defaultProps} />);
        deckButton().click();
        expect(defaultProps.onSelectDeck).toHaveBeenCalledWith(deckWithStats1.name);
    });



    });