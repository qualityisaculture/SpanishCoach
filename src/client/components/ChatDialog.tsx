import React from 'react';
import ChatRenderer from './ChatRenderer';
import { chatMessageType } from '../../server/routes/translator';
import ServerHandler from '../ServerHandler';

type Props = {
  initialRequest?: string;
  initialMessages?: chatMessageType[];
};

type State = {
  messages: chatMessageType[];
  submitDisabled: boolean;
};

export default class ChatDialog extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      messages: props.initialMessages || [],
      submitDisabled: false,
    };
    
  }
  componentDidMount() {
    if (this.props.initialRequest) {
      let initialMessage: chatMessageType = {
        message: this.props.initialRequest,
        type: 'human',
      };
      this.sendNewMessage(initialMessage);
    }
  }
  sendNewMessage = async (message: chatMessageType) => {
    this.setState({
      submitDisabled: true,
    });
    let messages: chatMessageType[] = this.state.messages;
    messages.push(message);
    let query = '/chat?messages=' + JSON.stringify(messages);

    let responseMessage: chatMessageType = {
      message: '',
      type: 'bot',
    };
    messages.push(responseMessage);
    this.setState({
      messages: messages,
    });
    let serverHandler = new ServerHandler(this.handleStreamResponse);
    serverHandler.requestStream(query);
  };

  handleStreamResponse = (value, done) => {
    let message = value.replace(/\n/g, '<br />');
    let messages = this.state.messages;
    messages[messages.length - 1].message = message;
    this.setState({
      messages: messages,
      submitDisabled: !done,
    });
  };

  sendFollowUp = async (message: string) => {
    const chatMessage: chatMessageType = {
      message: message,
      type: 'human',
    };
    this.sendNewMessage(chatMessage);
  };
  render() {
    return (
      <div>
        <ChatRenderer
          messages={this.state.messages}
          onMessageSubmit={this.sendFollowUp}
          submitDisabled={this.state.submitDisabled}
        />
      </div>
    );
  }
}
