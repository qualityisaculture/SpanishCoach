/**
 * @jest-environment jsdom
 */

import { render, initialiseDOM, element, click } from '../../reactTestExtensions';
import React from 'react';
import { act } from 'react-dom/test-utils';
import ExplanationMode from '../../../src/client/components/ExplanationMode';

// Mock ServerHandler
jest.mock('../../../src/client/ServerHandler');

describe('ExplanationMode', () => {
  let mockOnExplanation;
  let mockServerHandler;
  let mockRequest;
  let mockCancel;

  beforeEach(() => {
    initialiseDOM();
    mockOnExplanation = jest.fn();
    mockRequest = jest.fn();
    mockCancel = jest.fn();
    
    // Mock ServerHandler constructor and methods
    const ServerHandler = require('../../../src/client/ServerHandler').default;
    ServerHandler.mockImplementation((callback, debounceMillis) => ({
      request: mockRequest,
      cancel: mockCancel,
      callback,
      debounceMillis
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders explanation input field', () => {
    render(
      <ExplanationMode 
        onExplanation={mockOnExplanation}
        focusRef={null}
      />
    );

    expect(element('.explanationInput')).not.toBeNull();
  });

  it('has correct placeholder text', () => {
    render(
      <ExplanationMode 
        onExplanation={mockOnExplanation}
        focusRef={null}
      />
    );

    const textarea = element('.explanationInput') as HTMLTextAreaElement;
    // For Ant Design TextArea, we need to check the placeholder attribute
    expect(textarea.placeholder || textarea.getAttribute('placeholder')).toBe('Enter a Spanish word or phrase to explain');
  });

  it('creates ServerHandler with 300ms debounce for explanations', () => {
    const ServerHandler = require('../../../src/client/ServerHandler').default;
    
    render(
      <ExplanationMode 
        onExplanation={mockOnExplanation}
        focusRef={null}
      />
    );

    expect(ServerHandler).toHaveBeenCalledWith(
      expect.any(Function),
      300
    );
  });

  it('creates ServerHandler without debounce for simplify', () => {
    const ServerHandler = require('../../../src/client/ServerHandler').default;
    
    render(
      <ExplanationMode 
        onExplanation={mockOnExplanation}
        focusRef={null}
      />
    );

    // Should be called twice - once for explanation (with debounce), once for simplify (without debounce)
    expect(ServerHandler).toHaveBeenCalledTimes(2);
    // Check that the second call (simplify) has no debounce
    expect(ServerHandler.mock.calls[1][1]).toBeUndefined();
  });

  it('calls onExplanation callback when explanation is received', () => {
    const ServerHandler = require('../../../src/client/ServerHandler').default;
    
    render(
      <ExplanationMode 
        onExplanation={mockOnExplanation}
        focusRef={null}
      />
    );

    // Get the callback function passed to the first ServerHandler (explanation handler)
    const explanationCallback = ServerHandler.mock.calls[0][0];
    
    // Simulate receiving an explanation
    act(() => {
      explanationCallback({ explanation: 'Test explanation' }, true);
    });
    
    expect(mockOnExplanation).toHaveBeenCalledWith({
      spanish: '',
      explanation: 'Test explanation'
    });
  });

  it('calls onExplanation callback when simplified explanation is received', () => {
    const ServerHandler = require('../../../src/client/ServerHandler').default;
    
    render(
      <ExplanationMode 
        onExplanation={mockOnExplanation}
        focusRef={null}
      />
    );

    // Get the callback function passed to the second ServerHandler (simplify handler)
    const simplifyCallback = ServerHandler.mock.calls[1][0];
    
    // Simulate receiving a simplified explanation
    act(() => {
      simplifyCallback({ simplifiedExplanation: 'Simplified explanation' }, true);
    });
    
    expect(mockOnExplanation).toHaveBeenCalledWith({
      spanish: '',
      explanation: 'Simplified explanation'
    });
  });

  it('handles API errors gracefully', () => {
    const ServerHandler = require('../../../src/client/ServerHandler').default;
    
    render(
      <ExplanationMode 
        onExplanation={mockOnExplanation}
        focusRef={null}
      />
    );

    // Get the callback function passed to the first ServerHandler
    const explanationCallback = ServerHandler.mock.calls[0][0];
    
    // Simulate receiving an error
    act(() => {
      explanationCallback({ error: 'API Error' }, true);
    });
    
    expect(mockOnExplanation).toHaveBeenCalledWith({
      spanish: '',
      explanation: 'Error: API Error'
    });
  });

  it('shows simplify button when explanation is present', () => {
    const ServerHandler = require('../../../src/client/ServerHandler').default;
    
    render(
      <ExplanationMode 
        onExplanation={mockOnExplanation}
        focusRef={null}
      />
    );

    // Get the callback function and simulate receiving an explanation
    const explanationCallback = ServerHandler.mock.calls[0][0];
    act(() => {
      explanationCallback({ explanation: 'Test explanation' }, true);
    });
    
    // The simplify button should be present in the card
    const button = element('button');
    expect(button).not.toBeNull();
    expect(button.textContent).toContain('Simplify');
  });

  it('calls simplify request when simplify button is clicked', () => {
    const ServerHandler = require('../../../src/client/ServerHandler').default;
    
    render(
      <ExplanationMode 
        onExplanation={mockOnExplanation}
        focusRef={null}
      />
    );

    // Get the callback function and simulate receiving an explanation
    const explanationCallback = ServerHandler.mock.calls[0][0];
    act(() => {
      explanationCallback({ explanation: 'Test explanation' }, true);
    });
    
    // Click the simplify button
    const simplifyButton = element('button');
    act(() => {
      click(simplifyButton);
    });
    
    // Should call the simplify request - need to get the second ServerHandler instance
    const simplifyHandler = ServerHandler.mock.instances[1];
    expect(simplifyHandler.request).toHaveBeenCalledWith('/simplify?spanish=');
  });

  it('cancels explanation request when input is cleared', () => {
    const ServerHandler = require('../../../src/client/ServerHandler').default;
    
    render(
      <ExplanationMode 
        onExplanation={mockOnExplanation}
        focusRef={null}
      />
    );

    // Get the callback function and simulate receiving an explanation
    const explanationCallback = ServerHandler.mock.calls[0][0];
    act(() => {
      explanationCallback({ explanation: 'Test explanation' }, true);
    });
    
    // Clear the input by calling the callback with empty explanation
    act(() => {
      explanationCallback({ explanation: '' }, true);
    });
    
    // Should cancel the request - need to get the first ServerHandler instance
    const explanationHandler = ServerHandler.mock.instances[0];
    expect(explanationHandler.cancel).toHaveBeenCalled();
  });
}); 