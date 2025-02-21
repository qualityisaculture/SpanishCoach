import React, { ChangeEvent, ChangeEventHandler } from 'react';
import { Image, Input, Modal } from 'antd';
import ButtonRow, { ButtonRowButtonType } from './ButtonRow';
import ImageSelector from './ImageSelector';

type Props = {
  defaultValue: string;
  defaultImage?: string;
  onChange: (value: string, image?: string) => void;
  inputId?: string;
};
type State = {
  value: string;
  image: string;
  displayImageViewer: boolean;
};
export default class EditComponent extends React.Component<Props, State> {
  inputId: string;
  constructor(props: Props) {
    super(props);
    this.inputId = props.inputId ? props.inputId : Math.random().toString();
    this.state = {
      value: props.defaultValue,
      displayImageViewer: false,
      image: props.defaultImage ? props.defaultImage : '',
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
  imageButtonClicked = () => {
    this.setState({
      displayImageViewer: !this.state.displayImageViewer,
    });
  };
  onChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    this.setState({
      value: value,
    });
    this.props.onChange(value, this.state.image);
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
    let imageButton: ButtonRowButtonType = {
      key: 'image',
      text: 'P',
    };
    return (
      <div className="edit-component">
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
        <ButtonRow
          buttons={[imageButton]}
          onClick={this.imageButtonClicked}
          attached="below"
        />
        <Modal
          title="Select Image"
          open={this.state.displayImageViewer}
          footer={null}
          onCancel={() => {
            this.setState({
              displayImageViewer: false,
            });
          }}
        >
          <ImageSelector
            description={this.state.image}
            onImageChange={(imageUrl) => {
              this.setState({
                image: imageUrl,
                displayImageViewer: false,
              });
              this.props.onChange(this.state.value, imageUrl);
            }}
            onImageRemove={() => {}}
          />
        </Modal>
      </div>
    );
  }
}
