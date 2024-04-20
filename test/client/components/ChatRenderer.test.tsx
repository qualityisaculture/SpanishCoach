/**
 * @jest-environment jsdom
 */

import {
  render,
  initialiseDOM,
  element,
  elements,
  button,
  change,
  click,
} from '../../reactTestExtensions';
import React from 'react';
import ChatRenderer, {
  ChatMessage,
} from '../../../src/client/components/ChatRenderer';
import { chatMessageType } from '../../../src/server/routes/translator';

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

describe('ChatRenderer', () => {
  const defaultProps = {
    messages: [],
    onMessageSubmit: jest.fn(),
  };
  const input = () => element('input');
  const submitButton = () => button('Submit');
  const messageElements = () => elements('.chat-message-text');
  beforeEach(() => {
    initialiseDOM();
  });

  it('should render an input', () => {
    render(<ChatRenderer {...defaultProps} />);
    expect(input()).not.toBeNull();
  });

  it('should render a submit button', () => {
    render(<ChatRenderer {...defaultProps} />);
    expect(submitButton()).not.toBeNull();
  });

  it('should disable the submit button when prop passed', () => {
    render(<ChatRenderer {...defaultProps} submitDisabled />);
    expect(submitButton().disabled).toBe(true);
  });

  it('should display the messages passed in', () => {
    let messages: chatMessageType[] = [
      { message: 'Hello', type: 'human' },
      { message: 'Hi', type: 'bot' },
    ];
    render(<ChatRenderer {...defaultProps} messages={messages} />);
    expect(messageElements().length).toBe(2);
    expect(messageElements()[0]).toContainText('Hello');
    expect(messageElements()[1]).toContainText('Hi');
  });

  it('should callback with input when the submit button is clicked', () => {
    render(<ChatRenderer {...defaultProps} />);
    change(input(), 'Hello');
    click(submitButton());
    expect(defaultProps.onMessageSubmit).toHaveBeenCalledWith('Hello');
  });

  it('should clear the input when the submit button is clicked', () => {
    render(<ChatRenderer {...defaultProps} />);
    change(input(), 'Hello');
    click(submitButton());
    expect(input().value).toBe('');
  });

  describe('chat message', () => {
    const attribution = () => element('.chat-message-attribution');
    it('should render a robot icon and ChatGPT on bot message', () => {
      render(<ChatMessage message="Hello" type="bot" />);
      expect(element('.anticon-robot')).not.toBeNull();
      expect(attribution()).toContainText('ChatGPT');
    });

    it('should render a user icon and You on human message', () => {
      render(<ChatMessage message="Hello" type="human" />);
      expect(element('.anticon-user')).not.toBeNull();
      expect(attribution()).toContainText('You');
    });
  });
});
