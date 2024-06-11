import React from 'react';
import { Input, Collapse, Divider, Switch } from 'antd';
const { TextArea } = Input;
import _ from 'lodash';
import ServerHandler from './ServerHandler';
import ChatDialog from './components/ChatDialog';
type Props = {
  input?: string;
  output?: string;
  onTranslation: (translation: { spanish: string; english: string }) => void;
  focusRef: any;
};
type State = {
  input: string;
  output: string;
  complexOutput: {
    translation: string;
    partOfSPeech: string;
    longDescription: string;
  } | null;
  complexOpen: boolean;
  complexTranslationStillLoading: boolean;
  translationStillLoading: boolean;
  inputLanguage: string;
};

class Translator extends React.Component<Props, State> {
  simpleServerHandler: ServerHandler;
  complexServerHandler: ServerHandler;
  constructor(props: Props) {
    super(props);
    this.simpleServerHandler = new ServerHandler(
      this.onTranslationReceived,
      300
    );
    this.complexServerHandler = new ServerHandler(
      this.onComplexTranslationReceived
    );
    this.state = {
      input: this.props.input || '',
      output: this.props.output || '',
      complexOutput: null,
      complexOpen: false,
      complexTranslationStillLoading: false,
      translationStillLoading: false,
      inputLanguage: 'spanish',
    };
  }

  switchInputLanguage = () => {
    let newLanguage =
      this.state.inputLanguage == 'spanish' ? 'english' : 'spanish';
    this.setState({
      inputLanguage: newLanguage,
      input: this.state.output,
      output: '',
    });
    if (this.state.output) {
      this.requestTranslation(newLanguage, this.state.output);
    }
  };

  requestTranslation = (inputLanguage: string, inputPhrase: string) => {
    this.setState({ translationStillLoading: true });
    this.simpleServerHandler.request(
      `/translate?${inputLanguage}=${inputPhrase}`
    );
  };

  onTranslationReceived = (json, isFinal) => {
    this.setState({ translationStillLoading: !isFinal });
    if (this.state.inputLanguage == 'spanish') {
      this.setState({ output: json.english });
      this.props.onTranslation({
        spanish: this.state.input,
        english: json.english,
      });
    } else {
      this.setState({ output: json.spanish });
      this.props.onTranslation({
        spanish: json.spanish,
        english: this.state.input,
      });
    }
  };

  handleChange = async ({ target }) => {
    this.setState({ complexOpen: false });
    let input = target.value;
    this.setState({ input });
    if (input === '') {
      this.simpleServerHandler.cancel();
      this.setState({ translationStillLoading: false, output: '' });
    } else {
      this.requestTranslation(this.state.inputLanguage, input);
    }
  };

  closeComplex = () => {
    this.setState({ complexOutput: null });
    this.complexServerHandler.cancel();
  };

  requestComplex = async (event) => {
    const open = event[0] === 'translation';
    if (open) {
      this.setState({ complexOpen: true });
      this.setState({ complexTranslationStillLoading: true });
      this.complexServerHandler.request(
        `/complextranslate?spanish=${this.state.input}`
      );
    } else {
      this.setState({ complexOpen: false });
      this.complexServerHandler.cancel();
    }
  };

  onComplexTranslationReceived = (json, isFinal) => {
    this.setState({ complexTranslationStillLoading: !isFinal });
    if (this.state.inputLanguage == 'spanish') {
      this.setState({
        complexOutput: {
          translation: json.english,
          partOfSPeech: json.partOfSpeech,
          longDescription: json.longDescription,
        },
      });
    } else {
      this.setState({
        complexOutput: {
          translation: json.spanish,
          partOfSPeech: json.partOfSpeech,
          longDescription: json.longDescription,
        },
      });
    }
  };

  onSubmit = (event) => {
    event.preventDefault();
  };

  render(): React.ReactNode {
    let output: string;
    if (this.state.output === '') {
      output = this.state.translationStillLoading
        ? 'Loading...'
        : this.state.output;
    } else {
      output = this.state.translationStillLoading
        ? this.state.output + '...'
        : this.state.output;
    }
    let complexOutput =
      this.state.complexOutput == null ||
      this.state.complexTranslationStillLoading ? (
        'Loading...'
      ) : (
        <div>
          <ChatDialog
            initialMessages={[
              {
                message: this.state.input,
                type: 'human',
              },
              {
                message: this.state.complexOutput.longDescription,
                type: 'bot',
              },
            ]}
          />
        </div>
      );
    let complexActiveKeys = this.state.complexOpen ? ['translation'] : [];

    let items = [
      {
        key: 'translation',
        label: output,
        children: <div>{complexOutput}</div>,
      },
    ];
    return (
      <>
        <form onSubmit={this.onSubmit}>
          <TextArea
            className="translationInput"
            placeholder="Enter a phrase to translate"
            {...{ type: 'text' }} //Due to some weird Typescript thing?
            value={this.state.input}
            onChange={this.handleChange}
            variant="borderless"
            size="large"
            allowClear={true}
            ref={this.props.focusRef}
            {...(!global.testing
              ? { autoSize: { minRows: 1, maxRows: 6 } }
              : null)} //Need to only load this on testing, due to bug in ant.
          />
        </form>
        <Divider />
        <div style={{ position: 'relative', top: '-36px' }}>
          <Switch
            className="translationDirection"
            checkedChildren="Spanish to English"
            unCheckedChildren="English to Spanish"
            onChange={this.switchInputLanguage}
            defaultChecked
          />
        </div>
        <Collapse
          className="translationOutput"
          size="large"
          ghost
          items={items}
          style={{ maxHeight: '60%', overflow: 'scroll' }}
          expandIconPosition={'end'}
          activeKey={complexActiveKeys}
          onChange={this.requestComplex}
        />
      </>
    );
  }
}

export { Translator };
