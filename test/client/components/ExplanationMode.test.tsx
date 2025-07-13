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

  it('shows expand button when explanation is present (default simple complexity)', () => {
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
    
    // The expand button should be present in the card (since default complexity is 'simple')
    const button = element('button');
    expect(button).not.toBeNull();
    expect(button.textContent).toContain('Expand');
  });

  it('calls explanation request with intermediate complexity when expand button is clicked', () => {
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
    
    // Click the expand button (which will switch to intermediate complexity)
    const expandButton = element('button');
    act(() => {
      click(expandButton);
    });
    
    // Should call the explanation request with intermediate complexity
    const explanationHandler = ServerHandler.mock.instances[0];
    expect(explanationHandler.request).toHaveBeenCalledWith('/explain?spanish=&complexity=intermediate');
  });

  it('shows conversation button when explanation is present', () => {
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
    
    // The conversation button should be present
    const conversationButton = element('button[type="dashed"]');
    expect(conversationButton).not.toBeNull();
    expect(conversationButton.textContent).toContain('Ask follow-up questions');
  });

  it('shows conversation modal when conversation button is clicked', () => {
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
    
    // Click the conversation button
    const conversationButton = element('button[type="dashed"]');
    act(() => {
      click(conversationButton);
    });
    
    // Should show the conversation modal
    expect(element('.ant-modal-title')).toContainText('Follow-up Questions');
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