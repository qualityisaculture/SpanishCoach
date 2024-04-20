/**
 * @jest-environment jsdom
 */

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

import React from 'react';
import { act } from 'react-dom/test-utils';
import {initialiseDOM, render, elements, element, change, button, click} from '../../reactTestExtensions'

import ServerHandler from '../../../src/client/ServerHandler';
jest.mock('../../../src/client/ServerHandler');
let ServerHandlerMock = ServerHandler as jest.MockedClass<typeof ServerHandler>;

import ChatDialog from '../../../src/client/components/ChatDialog';

describe('ChatDialog', () => {
  const defaultProps = {};
  const messages = () => elements('.chat-message-text');
  const chatInput = () => element('.chat-input');
  const submitButton = () => button('Submit');
  beforeEach(() => {
    initialiseDOM();
    ServerHandlerMock.mockClear();
    ServerHandlerMock.prototype.requestStream.mockClear();
  });

  describe('chat state', () => {
    const callback = (value: string, done: boolean) => {
      let callback = ServerHandlerMock.mock.calls[0][0];
      act(() => {callback(value, done)});
    }

    it('disables the submit button if passed with an initial message', () => {
      render(<ChatDialog {...defaultProps} initialRequest='first message' />);
      expect(button('Submit').disabled).toBe(true);
    });

    it('displays the partial server response when received', () => {
      render(<ChatDialog {...defaultProps} />);
      change(chatInput(), 'new message');
      click(submitButton());
      callback('partial response', false);
      expect(messages()[1]).toContainText('partial response');
    });

    it('displays the updated partial server response when received', () => {
      render(<ChatDialog {...defaultProps} />);
      change(chatInput(), 'new message');
      click(submitButton());
      callback('partial response', false);
      callback('new partial response', false);
      expect(messages()[1]).toContainText('new partial response');
    });

    it('enables the input button when the request is done', () => {
      render(<ChatDialog {...defaultProps} />);
      change(chatInput(), 'new message');
      click(submitButton());
      callback('partial response', false);
      callback('new partial response', false);
      callback('final response', true);
      expect(messages()[1]).toContainText('final response');
      expect(button('Submit').disabled).toBe(false);
    });

    it('sends a follow up message when the submit button is clicked', () => {
      render(<ChatDialog {...defaultProps} />);
      change(chatInput(), 'new message');
      click(submitButton());
      callback('final response', true);
      change(chatInput(), 'follow up message');
      click(submitButton());
      let messageArray = JSON.parse(
        ServerHandlerMock.prototype.requestStream.mock.calls[1][0].substring('/chat?messages='.length)
      );
      expect(messageArray.length).toEqual(3);
      expect(messageArray[2].message).toEqual('follow up message');
    });
  });
});