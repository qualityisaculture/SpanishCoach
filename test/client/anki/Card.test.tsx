/**
 * @jest-environment jsdom
 */

import React from 'react';
import {
  render,
  initialiseDOM,
  click,
  element,
  elements,
  button,
  buttons,
  change,
  switches,
} from '../../reactTestExtensions';
import Card from '../../../src/client/anki/Card';
import { CardType as CardType } from '../../../src/Types';
import e from 'express';
import { dueCard1, dueCard2 } from '../../builders/cards';
import FetchMockHandler from '../../server/FetchMockHandler';
import { act } from 'react-dom/test-utils';
import { updateCardResponseType } from '../../../src/server/routes/anki';
import { cli } from 'webpack';

describe('Card', () => {
  const defaultProps = {
    card: dueCard1,
    cardAnswered: jest.fn(),
    onBack: jest.fn(),
    studyNewCards: jest.fn(),
  };
  const front = () => (elements('h4')[0] ? elements('h4')[0] : null);
  const back = () => (elements('h4')[1] ? elements('h4')[1] : null);
  beforeEach(() => {
    initialiseDOM();
    defaultProps.studyNewCards.mockClear();
    defaultProps.onBack.mockClear();
  });
  const newCardSwitch = () => switches()[0];

  it('should display "No cards in deck", Back and New Cards buttons when no card is passed', () => {
    render(<Card {...defaultProps} card={null} />);
    expect(document.body.innerHTML).toContain('No cards in deck');
    expect(buttons().length).toEqual(2);
    expect(button('Back')).toBeDefined();
    expect(newCardSwitch()).not.toBeNull();
  });

  it('should display back, edit, delete and new cards buttons when card is passed', () => {
    render(<Card {...defaultProps} />);
    expect(buttons().length).toEqual(4);
    expect(button('Back')).toBeDefined();
    expect(button('Edit')).toBeDefined();
    expect(button('Delete')).toBeDefined();
    expect(newCardSwitch()).not.toBeNull();
  });

  it('should only display the front of the card initially', () => {
    render(<Card {...defaultProps} />);
    expect(document.body.innerHTML).toContain('front1');
    expect(document.body.innerHTML).not.toContain('back1');
  });

  it('should display the back of the card when clicked', () => {
    render(<Card {...defaultProps} />);
    click(element('.card'));
    expect(document.body.innerHTML).toContain('back');
    expect(document.body.innerHTML).toContain('front');
  });

  it('should call onBack when the back button is clicked', () => {
    render(<Card {...defaultProps} />);
    click(button('Back'));
    expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
  });

  it('should display the answer buttons with estimated time when clicked', () => {
    render(<Card {...defaultProps} />);
    click(element('.card'));
    let buttons = elements('button');
    expect(button('Again')).toBeDefined();
    expect(button('Hard')).toBeDefined();
    expect(button('Medium')).toBeDefined();
    expect(button('Easy')).toBeDefined();
  });

  it('callsback cardAnswered when a button is clicked', () => {
    render(<Card {...defaultProps} />);
    click(element('.card'));
    click(button('Easy'));
    expect(defaultProps.cardAnswered).toHaveBeenCalledTimes(1);
  });

  it('should display the front of the next card when props are changed', () => {
    render(<Card {...defaultProps} />);
    click(element('.card'));
    expect(front()).toContainText(dueCard1.front);
    expect(back()).toContainText(dueCard1.back);
    render(<Card {...defaultProps} card={dueCard2} />);
    expect(front()).toContainText(dueCard2.front);
    expect(back()).toBeNull();
  });

  describe('edit mode', () => {
    const fetchMockHandler = new FetchMockHandler();
    let fetch: jest.SpyInstance;
    beforeEach(() => {
      fetch = fetchMockHandler.beforeEach();
    });
    afterEach(async () => {
      await fetchMockHandler.afterEach();
    });
    it('should display an edit button', () => {
      render(<Card {...defaultProps} edit />);
      expect(button('Edit')).toBeDefined();
    });

    it('should display a cancel and save button when edit is clicked', () => {
      render(<Card {...defaultProps} edit />);
      click(button('Edit'));
      expect(button('Cancel')).not.toBeNull();
      expect(button('Save')).not.toBeNull();
    });

    it('should exit edit mode when cancel is clicked', () => {
      render(<Card {...defaultProps} edit />);
      click(button('Edit'));
      click(button('Cancel'));
      expect(elements('input').length).toEqual(0);
    });

    it('should go back to question mode when cancel is clicked', () => {
      render(<Card {...defaultProps} edit />);
      click(button('Edit'));
      click(button('Cancel'));
      expect(front()).toContainText(dueCard1.front);
      expect(back()).toBeNull();
    });

    it('should set back the value to the original value when cancel is clicked', () => {
      render(<Card {...defaultProps} edit />);
      click(button('Edit'));
      change(elements('input')[0], 'new info');
      click(button('Cancel'));
      expect(front()).toContainText(dueCard1.front);
    });

    it('should set back the value to the original value when cancel is clicked after card has been updated', () => {
      render(<Card {...defaultProps} edit />);
      let differentCard: CardType = {
        id: 1,
        noteId: 2,
        front: 'different front',
        back: 'different back',
        failInterval: '1',
        hardInterval: '2',
        mediumInterval: '3',
        easyInterval: '4',
        due: 1,
        isNew: false,
        leftToStudy: 1,
      };
      render(<Card {...defaultProps} card={differentCard} edit />);
      expect(front()).toContainText(differentCard.front);
      click(button('Edit'));
      click(button('Cancel'));
      expect(front()).toContainText(differentCard.front);
    });

    it('should display an input for both question and answer when edit is clicked', () => {
      render(<Card {...defaultProps} edit />);
      click(button('Edit'));
      expect(elements('input').length).toEqual(2);
    });

    it('should update the rendered text when the input is changed', () => {
      render(<Card {...defaultProps} edit />);
      click(button('Edit'));
      const frontInput = elements('input')[0];
      change(frontInput, 'new front');
      expect(front().textContent).toContain('new front');
      const backInput = elements('input')[1];
      change(backInput, 'new back');
      expect(back().textContent).toContain('new back');
    });

    it('should call server when save is clicked', () => {
      render(<Card {...defaultProps} edit />);
      click(button('Edit'));
      change(elements('input')[0], 'new front');
      click(button('Save'));
      expect(fetch).toHaveBeenCalledWith('/updateCard', {
        method: 'POST',
        body: JSON.stringify({
          cardId: dueCard1.noteId,
          front: 'new front',
          back: dueCard1.back,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should exit edit mode and set the new value when server responds successfully', async () => {
      render(<Card {...defaultProps} edit />);
      click(button('Edit'));
      change(elements('input')[0], 'new front');
      click(button('Save'));
      let successResponse: updateCardResponseType = {
        success: true,
        message: null,
      };
      await fetchMockHandler.resolvePromise(0, successResponse);
      expect(elements('input').length).toEqual(0);
      expect(front()).toContainText('new front');
      expect(back()).toBeNull();
    });

    it('should exit edit mode and not change the value when server responds with an error', async () => {
      render(<Card {...defaultProps} edit />);
      click(button('Edit'));
      change(elements('input')[0], 'new info');
      click(button('Save'));
      let errorResponse: updateCardResponseType = {
        success: false,
        message: 'error',
      };
      await fetchMockHandler.resolvePromise(0, errorResponse);
      expect(elements('input').length).toEqual(0);
      expect(front()).toContainText(dueCard1.front);
      expect(back()).toBeNull();
    });

    it('should set the latest successful value when cancel is clicked', async () => {
      render(<Card {...defaultProps} edit />);
      click(button('Edit'));
      change(elements('input')[0], 'new info');
      click(button('Save'));
      let successResponse: updateCardResponseType = {
        success: true,
        message: null,
      };
      await fetchMockHandler.resolvePromise(0, successResponse);
      click(button('Edit'));
      change(elements('input')[0], 'newer info');
      click(button('Cancel'));
      expect(front()).toContainText('new info');
    });

    it('should set the latest successful value when server responds with failure', async () => {
      render(<Card {...defaultProps} edit />);
      click(button('Edit'));
      change(elements('input')[0], 'new info');
      click(button('Save'));
      let successResponse: updateCardResponseType = {
        success: true,
        message: null,
      };
      await fetchMockHandler.resolvePromise(0, successResponse);
      click(button('Edit'));
      change(elements('input')[0], 'newer info');
      click(button('Save'));
      let failureResponse: updateCardResponseType = {
        success: false,
        message: 'error',
      };
      await fetchMockHandler.resolvePromise(1, failureResponse);
      expect(front()).toContainText('new info');
    });

    it('should go back to question mode after a successful save', async () => {
      render(<Card {...defaultProps} edit />);
      click(element('.card'));
      click(button('Edit'));
      change(elements('input')[0], 'new info');
      click(button('Save'));
      let successResponse: updateCardResponseType = {
        success: true,
        message: null,
      };
      await fetchMockHandler.resolvePromise(0, successResponse);
      expect(front()).toContainText('new info');
      expect(back()).toBeNull();
    });

    it('should go back to question mode after an unsuccessful save and then back to edit mode', async () => {
      render(<Card {...defaultProps} edit />);
      click(element('.card'));
      click(button('Edit'));
      change(elements('input')[0], 'new info');
      click(button('Save'));
      let failureResponse: updateCardResponseType = {
        success: false,
        message: 'error',
      };
      await fetchMockHandler.resolvePromise(0, failureResponse);
      expect(front()).toContainText(dueCard1.front);
      expect(back()).toBeNull();
    });
  });

  describe('delete card', () => {
    const fetchMockHandler = new FetchMockHandler();
    let fetch: jest.SpyInstance;
    let mockConfirm: jest.Mock;

    beforeAll(() => {
      global.confirm = jest.fn();
      mockConfirm = global.confirm as jest.Mock;
    });
    beforeEach(() => {
      fetch = fetchMockHandler.beforeEach();
      mockConfirm.mockClear();
    });
    afterEach(async () => {
      await fetchMockHandler.afterEach();

    });

    it('should display a delete button', () => {
      render(<Card {...defaultProps} />);
      expect(button('Delete')).toBeDefined();
    });

    it('should display a confirm message when delete is clicked', () => {
      render(<Card {...defaultProps} />);
      click(button('Delete'));
      expect(mockConfirm).toHaveBeenCalledTimes(1);
      expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this card?');
    });

    it('should not call server when cancel is clicked', () => {
      render(<Card {...defaultProps} />);
      mockConfirm.mockReturnValue(false);
      click(button('Delete'));
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should call server when delete is confirmed', () => {
      render(<Card {...defaultProps} />);
      mockConfirm.mockReturnValue(true);
      click(button('Delete'));
      expect(fetch).toHaveBeenCalledWith('/deleteCard', {
        method: 'POST',
        body: JSON.stringify({
          cardId: dueCard1.noteId,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should call onBack when delete is clicked', async () => {
      render(<Card {...defaultProps} />);
      mockConfirm.mockReturnValue(true);
      click(button('Delete'));
      let successResponse: updateCardResponseType = {
        success: true,
        message: null,
      };
      await fetchMockHandler.resolvePromise(0, successResponse);
      expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
    });

    it('should not call onBack when delete fails', async () => {
      render(<Card {...defaultProps} />);
      mockConfirm.mockReturnValue(true);
      click(button('Delete'));
      let failureResponse: updateCardResponseType = {
        success: false,
        message: 'error',
      };
      await fetchMockHandler.resolvePromise(0, failureResponse);
      expect(defaultProps.onBack).not.toHaveBeenCalled();
    });
  });

  describe('pause new card', () => {
    it('should display a new card switched, defaulted to true', () => {
      render(<Card {...defaultProps} />);
      expect(newCardSwitch()).not.toBeNull();
      expect(newCardSwitch().getAttribute('aria-checked')).toBe('true');
    });

    it('should call newCards when the switch is tapped', () => {
      render(<Card {...defaultProps} />);
      click(newCardSwitch());
      expect(defaultProps.studyNewCards).toHaveBeenCalledTimes(1);
      expect(defaultProps.studyNewCards).toHaveBeenCalledWith(
        false,
        expect.anything()
      );
    });

    it('should call newCards with true when the switch is tapped twice', () => {
      render(<Card {...defaultProps} />);
      click(newCardSwitch());
      click(newCardSwitch());
      expect(defaultProps.studyNewCards).toHaveBeenCalledTimes(2);
      expect(defaultProps.studyNewCards).toHaveBeenCalledWith(
        false,
        expect.anything()
      );
      expect(defaultProps.studyNewCards).toHaveBeenCalledWith(
        true,
        expect.anything()
      );
    });
  });

  describe('modal', () => {
    const modalButton = () => element('.modal-button');
    const closeModalButton = () => element('.ant-modal-close');
    const modal = () => element('.ant-modal');

    it('shows a modal button on answer screen', () => {
      render(<Card {...defaultProps} />);
      click(element('.card'));
      expect(modalButton()).not.toBeNull();
    });

    it('launches a modal when the modal button is clicked', () => {
      render(<Card {...defaultProps} />);
      click(element('.card'));
      click(modalButton());
      expect(modal()).not.toBeNull();
    });

    it('closes the modal when the cancel button is clicked', () => {
      render(<Card {...defaultProps} />);
      click(element('.card'));
      click(modalButton());
      click(closeModalButton());
      expect(modal().style.display).toBe('none');
    });
  });
});
