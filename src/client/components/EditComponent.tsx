import React, { ChangeEvent, ChangeEventHandler } from 'react';
import { Input } from 'antd';
import ButtonRow, { ButtonRowButtonType } from './ButtonRow';

type Props = {
  defaultValue: string;
  onChange: (value: string) => void;
  inputId?: string;
};
type State = {
  value: string;
};
export default class EditComponent extends React.Component<Props, State> {
  inputId: string;
  constructor(props: Props) {
    super(props);
    this.inputId = props.inputId ? props.inputId : Math.random().toString();
    this.state = {
      value: props.defaultValue,
    };
  }
  removeFormat(selectionStart: number, selectionEnd: number, format: string) {
    let value = this.state.value;
    let selectedText = value.substring(selectionStart, selectionEnd);
    let regex = new RegExp('<' + format + '>|</' + format + '>', 'g');
    let newValue =
      value.substring(0, selectionStart) +
      selectedText.replace(regex, '') +
      value.substring(selectionEnd);
    this.setState({
      value: newValue,
    });
    this.props.onChange(newValue);
  }
  addFormat(selectionStart: number, selectionEnd: number, format: string) {
    let value = this.state.value;
    let selectedText = value.substring(selectionStart, selectionEnd);
    let newValue =
      value.substring(0, selectionStart) +
      '<' +
      format +
      '>' +
      selectedText +
      '</' +
      format +
      '>' +
      value.substring(selectionEnd);
    this.setState({
      value: newValue,
    });
    this.props.onChange(newValue);
  }
  formatButtonClicked = (format: string) => {
    let formatLetter = format[0].toLowerCase();
    let input = document.getElementById(this.inputId) as HTMLInputElement;

    let value = this.state.value;
    let selectionStart = input.selectionStart;
    let selectionEnd = input.selectionEnd;
    if (
      selectionStart === null ||
      selectionEnd === null ||
      selectionStart === selectionEnd
    ) {
      return;
    }
    let selectedText = value.substring(selectionStart, selectionEnd);

    if (
      selectedText.includes('<' + formatLetter + '>') ||
      selectedText.includes('</' + formatLetter + '>')
    ) {
      this.removeFormat(selectionStart, selectionEnd, formatLetter);
    } else {
      this.addFormat(selectionStart, selectionEnd, formatLetter);
    }
  };
  onChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    this.setState({
      value: value,
    });
    this.props.onChange(value);
  };
  render(): React.ReactNode {
    let formatButtons: ButtonRowButtonType[] = [
      {
        key: 'bold',
        text: 'B',
      },
      {
        key: 'italic',
        text: 'I',
      },
      {
        key: 'underline',
        text: 'U',
      },
    ];
    return (
      <div className='edit-component'>
        <Input
          id={this.inputId}
          value={this.state.value}
          onChange={this.onChange}
          style={{ borderBottomLeftRadius: '0px' }}
        ></Input>
        <ButtonRow
          buttons={formatButtons}
          onClick={this.formatButtonClicked}
          attached="below"
        />
      </div>
    );
  }
}
