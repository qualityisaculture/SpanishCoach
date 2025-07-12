/**
 * @jest-environment jsdom
 */

import { render, initialiseDOM, element } from '../../reactTestExtensions';
import React from 'react';
import ModeToggle from '../../../src/client/components/ModeToggle';
import { AppMode } from '../../../src/Enums';

describe('ModeToggle', () => {
  beforeEach(() => {
    initialiseDOM();
  });

  it('renders with explanation mode by default', () => {
    const mockOnModeChange = jest.fn();
    render(
      <ModeToggle 
        currentMode={AppMode.Explanation} 
        onModeChange={mockOnModeChange} 
      />
    );

    expect(element('div')).toContainText('Translation');
    expect(element('div')).toContainText('Explanation');
  });

  it('renders with translation mode', () => {
    const mockOnModeChange = jest.fn();
    render(
      <ModeToggle 
        currentMode={AppMode.Translation} 
        onModeChange={mockOnModeChange} 
      />
    );

    expect(element('div')).toContainText('Translation');
    expect(element('div')).toContainText('Explanation');
  });
}); 