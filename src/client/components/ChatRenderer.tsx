import React from 'react';
import { Button, Space, Input, List } from 'antd';
import { chatMessageType } from '../../server/routes/translator';

type Props = {
  messages: chatMessageType[];
  submitDisabled?: boolean;
  onMessageSubmit: (message: string) => void;
};

type State = {
  message: string;
};

export default class ChatRenderer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      message: '',
    };
  }
  onSubmitClicked = () => {
    this.props.onMessageSubmit(this.state.message);
    this.setState({
      message: '',
    });
  };
  onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      message: e.target.value,
    });
  };
  render() {
    return (
      <>
        <List
          size="small"
          dataSource={this.props.messages}
          renderItem={(item) => (
            <List.Item>
              <ChatMessage message={item.message} type={item.type} />
            </List.Item>
          )}
        />
        <Space.Compact style={{ width: '100%' }}>
          <Input
            className='chat-input'
            defaultValue=""
            value={this.state.message}
            onChange={this.onInputChange}
          />
          <Button disabled={this.props.submitDisabled} type="primary" onClick={this.onSubmitClicked}>
            Submit
          </Button>
        </Space.Compact>
      </>
    );
  }
}

import { RobotOutlined, UserOutlined } from '@ant-design/icons';

export const ChatMessage = (props: chatMessageType) => {
  return (
    <>
      <div className="chat-message-attribution">
        {props.type === 'bot' ? (
          <>
            <RobotOutlined /> ChatGPT
          </>
        ) : (
          <>
            <UserOutlined /> You
          </>
        )}
      </div>
      <div
        style={{ marginTop: '10px' }}
        className='chat-message-text'
        dangerouslySetInnerHTML={{
          __html: props.message,
        }}
      />
    </>
  );
};
