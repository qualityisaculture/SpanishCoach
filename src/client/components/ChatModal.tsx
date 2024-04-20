import React from 'react';
import { Modal, Button, Input, Typography } from 'antd';
const { TextArea } = Input;
const { Text } = Typography;
import ChatRenderer from './ChatRenderer';
type Props = {
  originalAnswer: string;
  isModalOpen: boolean;
  onCancel: () => void;
};
type State = {
  myAnswer: string;
  initialMessage: string | null;
  submitDisabled: boolean;
};
import ChatDialog from './ChatDialog';
export default class ChatModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      myAnswer: props.originalAnswer,
      initialMessage: null,
      submitDisabled: false,
    };
  }

  myAnswerEdited = (newAnswer: string) => {
    this.setState({
      myAnswer: newAnswer,
    });
  };

  requestDifference = async () => {
    const message = `what is the difference between "${this.props.originalAnswer}" and "${this.state.myAnswer}"?`;
    this.setState({
      initialMessage: message,
    });
  };

  render() {
    return (
      <Modal
        title="Basic Modal"
        open={this.props.isModalOpen}
        footer={null}
        onCancel={this.props.onCancel}
      >
        <div id="modal">
          {this.state.initialMessage == null ? (
            <>
              <Text className="ant-typography css-dev-only-do-not-override-1drr2mu">
                {this.props.originalAnswer}
              </Text>
              <br />
              <br />
              <TextArea
                autoSize
                defaultValue={this.props.originalAnswer}
                onChange={(e) => {
                  this.myAnswerEdited(e.target.value);
                }}
                id="modalInput"
              />
              <br />
              <br />
              <Button
                style={{
                  display: 'block',
                  marginRight: '0px',
                  marginLeft: 'auto',
                }}
                type="primary"
                onClick={this.requestDifference}
              >
                Request
              </Button>
            </>
          ) : (
            <ChatDialog initialRequest={this.state.initialMessage} />
          )}
        </div>
      </Modal>
    );
  }
}
