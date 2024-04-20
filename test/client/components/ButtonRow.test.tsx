/**
 * @jest-environment jsdom
 */

import React from 'react';
import {
  render,
  element,
  elements,
  initialiseDOM,
  click,
} from '../../reactTestExtensions';

import ButtonRow, {
  ButtonRowButtonType,
} from '../../../src/client/components/ButtonRow';

describe('ButtonRow', () => {
  const defaultProps = {
    buttons: [],
    onClick: jest.fn(),
  };
  beforeEach(() => {
    initialiseDOM();
  });
  it('renders an empty ButtonRow', () => {
    render(<ButtonRow {...defaultProps} />);
    expect(element('button')).toBeNull();
  });

  it('renders a ButtonRow with one button', () => {
    let button: ButtonRowButtonType = { text: 'button1', key: 'button1key' };
    render(<ButtonRow {...defaultProps} buttons={[button]} />);
    expect(element('button')).not.toBeNull();
    expect(element('button').textContent).toEqual('button1');
  });

  it('renders a ButtonRow with two buttons', () => {
    let button1: ButtonRowButtonType = { text: 'button1', key: 'button1key' };
    let button2: ButtonRowButtonType = { text: 'button2', key: 'button2key' };
    render(<ButtonRow {...defaultProps} buttons={[button1, button2]} />);
    expect(elements('button').length).toEqual(2);
  });

  it('calls onClick when a button is clicked', () => {
    let button1: ButtonRowButtonType = { text: 'button1', key: 'button1key' };
    render(<ButtonRow {...defaultProps} buttons={[button1]} />);
    click(element('button'));
    expect(defaultProps.onClick).toHaveBeenCalledWith('button1key');
  });

  it('displays additionalText if provided', () => {
    let button1: ButtonRowButtonType = {
      text: 'button1',
      key: 'button1key',
      additionalText: 'additional text',
    };
    render(<ButtonRow {...defaultProps} buttons={[button1]} />);
    expect(element('button').textContent).toContain('additional text');
    expect(element('button').textContent).toContain('button1');
  });

  it('spreads the buttons out horizontally when block is set', () => {
    let button1: ButtonRowButtonType = { text: 'button1', key: 'button1key' };
    let button2: ButtonRowButtonType = { text: 'button2', key: 'button2key' };
    render(<ButtonRow {...defaultProps} buttons={[button1, button2]} block />);
    expect(element('button').style.width).toEqual('50%');

    let button3: ButtonRowButtonType = { text: 'button3', key: 'button3key' };
    let button4: ButtonRowButtonType = { text: 'button4', key: 'button4key' };
    render(
      <ButtonRow
        {...defaultProps}
        buttons={[button1, button2, button3, button4]}
        block
      />
    );
    expect(element('button').style.width).toEqual('25%');
  });

  describe('styling buttons', () => {
    it('applies the style passed to regular buttons', () => {
      let button1: ButtonRowButtonType = {
        text: 'button1',
        key: 'button1key',
        style: { color: 'red' },
      };
      let button2: ButtonRowButtonType = {
        text: 'button2',
        key: 'button2key',
        style: { color: 'blue' },
      };
      render(<ButtonRow {...defaultProps} buttons={[button1, button2]} />);
      expect(element('button').style.color).toEqual('red');
    });

    it('applies the style passed to additionalText buttons', () => {
      let button1: ButtonRowButtonType = {
        text: 'button1',
        key: 'button1key',
        additionalText: 'additional text',
        style: { color: 'red' },
      };
      render(<ButtonRow {...defaultProps} buttons={[button1]} />);
      expect(element('button').style.color).toEqual('red');
    });

    it('can override the width of the button on block buttons', () => {
      let button1: ButtonRowButtonType = {
        text: 'button1',
        key: 'button1key',
        style: { width: '100px' },
      };
      render(<ButtonRow {...defaultProps} buttons={[button1]} block />);
      expect(element('button').style.width).toEqual('100px');
    });

    it('can override the width on additionalText block buttons', () => {
      let button1: ButtonRowButtonType = {
        text: 'button1',
        key: 'button1key',
        additionalText: 'additional text',
        style: { width: '100px' },
      };
      render(<ButtonRow {...defaultProps} buttons={[button1]} block />);
      expect(element('button').style.width).toEqual('100px');
    });
  });

  describe('button element ids', () => {
    it('sets the id of the button if id set', () => {
      let button1: ButtonRowButtonType = {
        text: 'button1',
        key: 'button1key',
        id: 'button1id',
      };
      render(<ButtonRow {...defaultProps} buttons={[button1]} />);
      expect(element('#button1id')).toContainText('button1');
    });

    it('sets the id on additional text buttons if id set', () => {
      let button1: ButtonRowButtonType = {
        text: 'button1',
        additionalText: 'additional Text',
        key: 'button1key',
        id: 'button1id',
      };
      render(<ButtonRow {...defaultProps} buttons={[button1]} />);
      expect(element('#button1id')).toContainText('button1');
    });
  });

  describe('button border radius', () => {
    const button = (index: number) => elements('button')[index];
    it('removes the right border radius on the first button', () => {
      let button1: ButtonRowButtonType = { text: 'button1', key: 'button1key' };
      let button2: ButtonRowButtonType = { text: 'button2', key: 'button2key' };
      render(<ButtonRow {...defaultProps} buttons={[button1, button2]} />);
      expect(button(0).style.borderTopRightRadius).toEqual('0px');
      expect(button(0).style.borderBottomRightRadius).toEqual('0px');
    });

    it('removes the left border radius on the last button', () => {
      let button1: ButtonRowButtonType = { text: 'button1', key: 'button1key' };
      let button2: ButtonRowButtonType = { text: 'button2', key: 'button2key' };
      render(<ButtonRow {...defaultProps} buttons={[button1, button2]} />);
      expect(button(1).style.borderTopLeftRadius).toEqual('0px');
      expect(button(1).style.borderBottomLeftRadius).toEqual('0px');
    });

    it('removes all the border radii from the middle buttons', () => {
      let button1: ButtonRowButtonType = { text: 'button1', key: 'button1key' };
      let button2: ButtonRowButtonType = { text: 'button2', key: 'button2key' };
      let button3: ButtonRowButtonType = { text: 'button3', key: 'button3key' };
      let button4: ButtonRowButtonType = { text: 'button4', key: 'button4key' };
      render(
        <ButtonRow
          {...defaultProps}
          buttons={[button1, button2, button3, button4]}
        />
      );
      expect(button(1).style.borderTopLeftRadius).toEqual('0px');
      expect(button(1).style.borderBottomLeftRadius).toEqual('0px');
      expect(button(1).style.borderTopRightRadius).toEqual('0px');
      expect(button(1).style.borderBottomRightRadius).toEqual('0px');
      expect(button(2).style.borderTopLeftRadius).toEqual('0px');
      expect(button(2).style.borderBottomLeftRadius).toEqual('0px');
      expect(button(2).style.borderTopRightRadius).toEqual('0px');
      expect(button(2).style.borderBottomRightRadius).toEqual('0px');
    });

    describe('attached buttons', () => {
      it('removes the top border from button attached below', () => {
        let button1: ButtonRowButtonType = {
          text: 'button1',
          key: 'button1key',
        };
        let button2: ButtonRowButtonType = {
          text: 'button2',
          key: 'button2key',
        };
        render(
          <ButtonRow
            {...defaultProps}
            buttons={[button1, button2]}
            attached={'below'}
          />
        );
        expect(button(0).style.borderTop).toEqual('0px');
        expect(button(1).style.borderTop).toEqual('0px');
      });

      it('removes the top left border radius from the first button attached below', () => {
        let button1: ButtonRowButtonType = {
          text: 'button1',
          key: 'button1key',
        };
        let button2: ButtonRowButtonType = {
          text: 'button2',
          key: 'button2key',
        };
        render(
          <ButtonRow
            {...defaultProps}
            buttons={[button1, button2]}
            attached={'below'}
          />
        );
        expect(button(0).style.borderTopLeftRadius).toEqual('0px');
      });

      it('remove the top right border radius from the last button attached below', () => {
        let button1: ButtonRowButtonType = {
          text: 'button1',
          key: 'button1key',
        };
        let button2: ButtonRowButtonType = {
          text: 'button2',
          key: 'button2key',
        };
        render(
          <ButtonRow
            {...defaultProps}
            buttons={[button1, button2]}
            attached={'below'}
          />
        );
        expect(button(1).style.borderTopRightRadius).toEqual('0px');
      });
    });
  });
});
