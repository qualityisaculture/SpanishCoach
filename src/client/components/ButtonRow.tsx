import React from 'react';
import { Button } from 'antd';

export type ButtonRowButtonType = {
  text: string;
  key: string;
  id?: string;
  additionalText?: string;
  style?: React.CSSProperties;
};

type Props = {
  buttons: ButtonRowButtonType[];
  onClick: (buttonId: string) => void;
  attached?: 'below';
  style: React.CSSProperties;
  block?: boolean;
};

export default class ButtonRow extends React.Component<Props> {
  static defaultProps = {
    block: false,
    style: {},
  };
  constructor(props: Props) {
    super(props);
  }
  getStyleForButton = (
    button: ButtonRowButtonType,
    block: boolean | undefined,
    hasLeft: boolean = true,
    hasRight: boolean = true
  ) => {
    let style = button.style ? button.style : {};
    if (this.props.attached === 'below') {
      style.borderTop = '0px';
    }
    if (!hasRight) {
      if (this.props.attached === 'below') {
        style.borderTopRightRadius = '0px';
      }
      style.borderTopLeftRadius = '0px';
      style.borderBottomLeftRadius = '0px';
    }
    if (!hasLeft) {
      if (this.props.attached === 'below') {
        style.borderTopLeftRadius = '0px';
      }
      style.borderTopRightRadius = '0px';
      style.borderBottomRightRadius = '0px';
      style.borderRight = '0px';
    }
    if (block && !style.width) {
      style.width = 100 / this.props.buttons.length + '%';
    }
    return style;
  };
  render() {
    return (
      <span style={this.props.style}>
        {this.props.buttons.map((button, index) => {
          if (button.additionalText) {
            return (
              <DoubleButton
                id={button.id}
                key={button.key}
                onClick={() => {
                  this.props.onClick(button.key);
                }}
                line1={button.additionalText}
                line2={button.text}
                style={this.getStyleForButton(button, this.props.block, index === this.props.buttons.length - 1, index === 0)}
              />
            );
          } else {
            return (
              <Button
                id={button.id}
                key={button.key}
                onClick={(e) => {
                  e.stopPropagation();
                  this.props.onClick(button.key);
                }}
                style={this.getStyleForButton(button, this.props.block, index === this.props.buttons.length - 1, index === 0)}
              >
                {button.text}
              </Button>
            );
          }
        })}
      </span>
    );
  }
}

type DoubleButtonProps = {
  line1: string;
  line2: string;
  key: string;
  onClick: () => void;
  id?: string;
  style: React.CSSProperties;
};
const DoubleButton = (props: DoubleButtonProps) => {
  let style = props.style ? props.style : {};
  if (!style.height) {
    style.height = 'auto';
  }
  return (
    <button
      id={props.id}
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        props.onClick();
      }}
      className="ant-btn css-dev-only-do-not-override-1drr2mu ant-btn-default"
      style={style}
    >
      <div>{props.line1}</div>
      <div>{props.line2}</div>
    </button>
  );
};
