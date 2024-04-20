/**
 * @jest-environment jsdom
 */

import React from 'react';

import { render, initialiseDOM, element, change, button, click} from '../../reactTestExtensions';
import EditComponent from '../../../src/client/components/EditComponent';

describe('EditComponent', () => {
  const defaultProps = {
    defaultValue: '',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    initialiseDOM();
  });
  it('should render an input', () => {
    render(<EditComponent {...defaultProps} />);
    expect(element('input')).not.toBeNull();
  });

  it('should set the provided default value', () => {
    render(<EditComponent {...defaultProps} defaultValue="test" />);
    expect(element('input').value).toBe('test');
  });

  it('sets an id on the input if passed', () => {
    render(<EditComponent {...defaultProps} inputId='test-id'/>);
    expect(element('input').id).toBe('test-id');
  });

  it('should callback onChange when the input changes', () => {
    render(<EditComponent {...defaultProps} />);
    change(element('input'), 'test');
    expect(defaultProps.onChange).toHaveBeenCalledWith('test');
  });

  describe('bold button', () => {
    it('should have a bold button', () => {
      render(<EditComponent {...defaultProps} />);
      expect(button('B')).not.toBeNull();
    });

    it('should insert bold tags around the selected text whenc clicked', () => {
      render(<EditComponent {...defaultProps} defaultValue="test" />);
      element('input').setSelectionRange(1, 3);
      click(button('B'));
      expect(element('input').value).toBe('t<b>es</b>t'); //b not strong because this isn't a website, it's a flashcard
    });

    it('should not insert bold tags if no range is set', () => {
      render(<EditComponent {...defaultProps} defaultValue="test" />);
      click(button('B'));
      expect(element('input').value).toBe('test');
    });

    it('should not insert bold tags if focused but no text is selected', () => {
      render(<EditComponent {...defaultProps} defaultValue="test" />);
      element('input').setSelectionRange(1, 1);
      click(button('B'));
      expect(element('input').value).toBe('test');
    });

    it('should remove bold tags if the selected text is already bold', () => {
      render(<EditComponent {...defaultProps} defaultValue="t<b>es</b>t" />);
      element('input').setSelectionRange(1, 10);
      click(button('B'));
      expect(element('input').value).toBe('test');
    });

    it('should callback onChange when the formatting added', () => {
      render(<EditComponent {...defaultProps} defaultValue="test" />);
      element('input').setSelectionRange(1, 3);
      click(button('B'));
      expect(defaultProps.onChange).toHaveBeenCalledWith('t<b>es</b>t');
    });

    it('should callback onChange when the formatting removed', () => {
      render(<EditComponent {...defaultProps} defaultValue="t<b>es</b>t" />);
      element('input').setSelectionRange(1, 10);
      click(button('B'));
      expect(defaultProps.onChange).toHaveBeenCalledWith('test');
    });




    // it('should still focus the input after clicking the bold button', () => {
    //   render(<EditComponent {...defaultProps} />);
    //   click(button('B'));
    //   //check focus of input
    //   expect(document.activeElement).toBe(element('input'));
    // });
  });

  describe('italic button', () => {
    it('should have an italic button', () => {
      render(<EditComponent {...defaultProps} />);
      expect(button('I')).not.toBeNull();
    });

    it('should insert italic tags around the selected text when clicked', () => {
      render(<EditComponent {...defaultProps} defaultValue="test" />);
      element('input').setSelectionRange(1, 3);
      click(button('I'));
      expect(element('input').value).toBe('t<i>es</i>t');
    });

    it('should not insert italic tags if no range is set', () => {
      render(<EditComponent {...defaultProps} defaultValue="test" />);
      click(button('I'));
      expect(element('input').value).toBe('test');
    });

    it('should not insert italic tags if focused but no text is selected', () => {
      render(<EditComponent {...defaultProps} defaultValue="test" />);
      element('input').setSelectionRange(1, 1);
      click(button('I'));
      expect(element('input').value).toBe('test');
    });

    it('should remove italic tags if the selected text is already italic', () => {
      render(<EditComponent {...defaultProps} defaultValue="t<i>es</i>t" />);
      element('input').setSelectionRange(1, 10);
      click(button('I'));
      expect(element('input').value).toBe('test');
    });
  });

  describe('underline button', () => {
    it('should have an underline button', () => {
      render(<EditComponent {...defaultProps} />);
      expect(button('U')).not.toBeNull();
    });

    it('should insert underline tags around the selected text when clicked', () => {
      render(<EditComponent {...defaultProps} defaultValue="test" />);
      element('input').setSelectionRange(1, 3);
      click(button('U'));
      expect(element('input').value).toBe('t<u>es</u>t');
    });

    it('should not insert underline tags if no range is set', () => {
      render(<EditComponent {...defaultProps} defaultValue="test" />);
      click(button('U'));
      expect(element('input').value).toBe('test');
    });

    it('should not insert underline tags if focused but no text is selected', () => {
      render(<EditComponent {...defaultProps} defaultValue="test" />);
      element('input').setSelectionRange(1, 1);
      click(button('U'));
      expect(element('input').value).toBe('test');
    });

    it('should remove underline tags if the selected text is already underlined', () => {
      render(<EditComponent {...defaultProps} defaultValue="t<u>es</u>t" />);
      element('input').setSelectionRange(1, 10);
      click(button('U'));
      expect(element('input').value).toBe('test');
    });
  });
});
