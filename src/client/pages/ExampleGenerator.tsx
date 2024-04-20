import React from 'react';
import type { ComponentProps } from 'react';
import { Input, Button, Divider, Typography } from 'antd';
const { Paragraph } = Typography;
import ServerHandler from '../ServerHandler';
import { exampleResponseType } from '../../server/routes/translator';
import DeckDropdownLoader from '../anki/DeckDropdownLoader';
import DeckDropdown from '../anki/DeckDropdown';
import { translationDirections } from '../../Enums';

type Props = {};
type State = {
  userExample: string;
  state: 'initial' | 'loading' | 'success' | 'error';
  exampleSpanish: string;
  exampleEnglish: string;
};
export default class ExampleGenerator extends React.Component<Props, State> {
  serverHandler: ServerHandler;
  constructor(props: Props) {
    super(props);
    this.state = {
      userExample: '',
      state: 'initial',
      exampleSpanish: '',
      exampleEnglish: '',
    };
    this.serverHandler = new ServerHandler(this.serverResponse);
  }
  serverResponse = (response: exampleResponseType) => {
    this.setState({
      state: 'success',
      exampleSpanish: response.example,
      exampleEnglish: response.translation,
    });
  };
  requestExample = () => {
    let query = '/example?requiredPhrase=' + this.state.userExample;
    this.serverHandler.request(query);
    this.setState({ state: 'loading' });
  };
  exampleInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ userExample: e.target.value });
  };
  onSave: ComponentProps<typeof DeckDropdown>['onSaveToDeck'] = async (
    deck,
    direction,
    callback
  ) => {
    let front =
      direction === translationDirections.SpanishToEnglish
        ? this.state.exampleSpanish
        : this.state.exampleEnglish;
    let back =
      direction === translationDirections.SpanishToEnglish
        ? this.state.exampleEnglish
        : this.state.exampleSpanish;
    let response = await global.fetch('/addCard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deckName: deck,
        front: front,
        back: back,
      }),
    });
    let json = await response.json();
    callback(json);
  };
  render() {
    return (
      <>
        <Input
          disabled={this.state.state == 'loading'}
          value={this.state.userExample}
          onChange={this.exampleInputChanged}
          placeholder="Enter phrase to generate example..."
          size="large"
          variant="borderless"
        />
        <Divider />
        <Button
          disabled={
            this.state.state == 'loading' || this.state.userExample === ''
          }
          onClick={this.requestExample}
          block
        >
          Request Example
        </Button>
        {this.state.state === 'success' ? (
          <>
            <Divider />
            <Paragraph className='englishExample'>
              {this.state.exampleEnglish}
            </Paragraph>
            <Paragraph className='spanishExample'>
              {this.state.exampleSpanish}
            </Paragraph>
            <DeckDropdownLoader onSaveToDeck={this.onSave} />
          </>
        ) : null}
      </>
    );
  }
}
