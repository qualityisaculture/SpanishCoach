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
import {
  render,
  initialiseDOM,
  element,
  elements,
  change,
  click,
  button,
} from '../../reactTestExtensions';
import ChatModal from '../../../src/client/components/ChatModal';
import ServerHandler from '../../../src/client/ServerHandler';
jest.mock('../../../src/client/ServerHandler');
let ServerHandlerMock = ServerHandler as jest.MockedClass<typeof ServerHandler>;


describe('ChatModal', () => {
  const defaultProps = {
    originalAnswer: 'original answer',
    isModalOpen: true,
    onOk: jest.fn(),
    onCancel: jest.fn(),
  };
  const modal = () => element('#modal');
  const editComponent = () => element('#modalInput');
  const requestButton = () => button('Request');

  beforeEach(() => {
    initialiseDOM();
    ServerHandlerMock.mockClear();
    ServerHandlerMock.prototype.requestStream.mockClear();
  });

  describe('initial state', () => {
    it('shows original answer label', () => {
      render(<ChatModal {...defaultProps} />);
      expect(modal()).toContainText('original answer');
    });

    it('shows original answer in input', () => {
      render(<ChatModal {...defaultProps} />);
      expect(editComponent().value).toEqual('original answer');
    });
  });

  describe('chat state', () => {
    const messages = () => elements('.chat-message-text');
    const chatInput = () => element('.chat-input');
    const callback = (value: string, done: boolean) => {
      let callback = ServerHandlerMock.mock.calls[0][0];
      act(() => {callback(value, done)});
    }
    it('requests the difference when button is clicked', () => {
      render(<ChatModal {...defaultProps} />);
      change(editComponent(), 'my answer');
      click(requestButton());
      let messageArray = JSON.parse(
        ServerHandlerMock.prototype.requestStream.mock.calls[0][0].substring('/chat?messages='.length)
      );
      expect(messageArray[0].message).toEqual(
        'what is the difference between "original answer" and "my answer"?'
      );
    });

    it('displays difference message on click', () => {
      render(<ChatModal {...defaultProps} />);
      change(editComponent(), 'my answer');
      click(requestButton());
      expect(messages()[0]).toContainText('what is the difference between "original answer" and "my answer"?');
    });

    it('disables the submit button when the request is sent', async () => {
      render(<ChatModal {...defaultProps} />);
      change(editComponent(), 'my answer');
      click(requestButton());
      expect(button('Submit').disabled).toBe(true);
    });

    it('displays the partial server response when received', () => {
      render(<ChatModal {...defaultProps} />);
      change(editComponent(), 'my answer');
      click(requestButton());
      callback('partial response', false);
      expect(messages()[1]).toContainText('partial response');
    });

    it('displays the updated partial server response when received', () => {
      render(<ChatModal {...defaultProps} />);
      change(editComponent(), 'my answer');
      click(requestButton());
      callback('partial response', false);
      callback('new partial response', false);
      expect(messages()[1]).toContainText('new partial response');
    });

    it('enables the input button when the request is done', () => {
      render(<ChatModal {...defaultProps} />);
      change(editComponent(), 'my answer');
      click(requestButton());
      callback('partial response', false);
      callback('new partial response', false);
      callback('final response', true);
      expect(messages()[1]).toContainText('final response');
      expect(button('Submit').disabled).toBe(false);
    });

    it('sends a follow up message when the submit button is clicked', () => {
      render(<ChatModal {...defaultProps} />);
      change(editComponent(), 'my answer');
      click(requestButton());
      callback('final response', true);
      change(chatInput(), 'follow up message');
      click(button('Submit'));
      let messageArray = JSON.parse(
        ServerHandlerMock.prototype.requestStream.mock.calls[1][0].substring('/chat?messages='.length)
      );
      expect(messageArray.length).toEqual(3);
      expect(messageArray[2].message).toEqual('follow up message');
    });
  });
});
