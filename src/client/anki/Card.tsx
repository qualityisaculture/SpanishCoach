import React from 'react';
import { Card as CardType } from '../../Types';
import ButtonRow, { ButtonRowButtonType } from '../components/ButtonRow';
import ChatModal from '../components/ChatModal';
import {
  updateCardRequestType,
  updateCardResponseType,
} from '../../server/routes/anki';

import { QuestionCircleOutlined } from '@ant-design/icons';
import { Divider, FloatButton } from 'antd';
import EditComponent from '../components/EditComponent';
import { red, orange, green, blue } from '@ant-design/colors';

const buttonRowStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '60px',
  width: '95%',
};
const centerStyle: React.CSSProperties = {
  justifyContent: 'center',
  display: 'flex',
};
type Props = {
  card: CardType;
  edit?: boolean;
  cardAnswered: (ease: 1 | 2 | 3 | 4) => void;
  onBack: () => void;
};
type State = {
  state: 'question' | 'answer';
  editMode: boolean;
  front: string;
  back: string;
  originalFront: string;
  originalBack: string;
  isModalOpen: boolean;
};
export default class Card extends React.Component<Props, State> {
  static defaultProps = {
    edit: false,
  };
  constructor(props: Props) {
    super(props);
    this.state = {
      state: 'question',
      editMode: false,
      front: props.card.front,
      back: props.card.back,
      originalFront: props.card.front,
      originalBack: props.card.back,
      isModalOpen: false,
    };
  }
  componentDidUpdate(
    prevProps: Readonly<Props>,
    prevState: Readonly<State>,
    snapshot?: any
  ): void {
    if (prevProps.card !== this.props.card) {
      this.setState({
        state: 'question',
        front: this.props.card.front,
        back: this.props.card.back,
        originalFront: this.props.card.front,
        originalBack: this.props.card.back,
      });
    }
  }
  questionClicked = () => {
    this.setState({ state: 'answer' });
  };
  questionAnswered = (buttonId: string) => {
    let ease = parseInt(buttonId) as 1 | 2 | 3 | 4;
    this.props.cardAnswered(ease);
    this.setState({ state: 'question' });
  };
  getAnswerButtons = () => {
    const buttons: ButtonRowButtonType[] = [
      {
        text: 'Again',
        additionalText: this.props.card.failInterval,
        key: '1',
        id: 'answer-again',
        style: { backgroundColor: red[4] },
      },
      {
        text: 'Hard',
        additionalText: this.props.card.hardInterval,
        key: '2',
        id: 'answer-hard',
        style: { backgroundColor: orange[4] },
      },
      {
        text: 'Medium',
        additionalText: this.props.card.mediumInterval,
        key: '3',
        id: 'answer-medium',
        style: { backgroundColor: green[4] },
      },
      {
        text: 'Easy',
        additionalText: this.props.card.easyInterval,
        key: '4',
        id: 'answer-easy',
        style: { backgroundColor: blue[4] },
      },
    ];
    return buttons;
  };
  questionEdited = (value: string) => {
    this.setState({ front: value });
  };
  question = () => {
    return (
      <>
        <h4
          dangerouslySetInnerHTML={{ __html: this.state.front }}
          className="card-front ant-typography css-dev-only-do-not-override-1drr2mu"
        />
        {this.state.editMode ? (
          <EditComponent
            inputId='card-front-input'
            defaultValue={this.state.front}
            onChange={this.questionEdited}
          />
        ) : null}
      </>
    );
  };
  answerEdited = (value: string) => {
    this.setState({ back: value });
  };
  answer = () => {
    if (this.state.editMode) {
      return (
        <>
          <Divider />
          <h4
            dangerouslySetInnerHTML={{ __html: this.state.back }}
            className="card-back ant-typography css-dev-only-do-not-override-1drr2mu"
          />
          <EditComponent
            inputId='card-back-input'
            defaultValue={this.state.back}
            onChange={this.answerEdited}
          />
        </>
      );
    }

    if (this.state.state === 'answer') {
      let tempDivElement = document.createElement("div");
      tempDivElement.innerHTML = this.state.back;
      let strippedBack = tempDivElement.textContent || "";
      return (
        <>
          <Divider />
          <h4
            dangerouslySetInnerHTML={{ __html: this.state.back }}
            className="card-back ant-typography css-dev-only-do-not-override-1drr2mu"
          />
          <ButtonRow
            block
            style={buttonRowStyle}
            buttons={this.getAnswerButtons()}
            onClick={this.questionAnswered}
          />
          <FloatButton
            className="modal-button"
            shape="circle"
            type="primary"
            style={{ right: 50, bottom: 150 }}
            icon={<QuestionCircleOutlined />}
            onClick={() => this.setState({ isModalOpen: true })}
          />
          <ChatModal
            originalAnswer={strippedBack}
            isModalOpen={this.state.isModalOpen}
            onCancel={() => this.setState({ isModalOpen: false })}
          ></ChatModal>
        </>
      );
    }
  };
  updateServer = async () => {
    let body: updateCardRequestType = {
      cardId: this.props.card.noteId,
      front: this.state.front,
      back: this.state.back,
    };
    const response = await global.fetch('/updateCard', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json: updateCardResponseType = await response.json();
    this.setState({
      state: 'question',
      editMode: false,
    });
    if (json.success !== true) {
      this.setState({
        front: this.state.originalFront,
        back: this.state.originalBack,
      });
    } else {
      this.setState({
        originalFront: this.state.front,
        originalBack: this.state.back,
      });
    }
  };
  onMenuClick = async (id: 'back' | 'edit' | 'cancel') => {
    if (id === 'back') {
      this.props.onBack();
    } else if (id === 'edit') {
      this.setState({ editMode: true });
    } else if (id === 'cancel') {
      this.setState({
        editMode: false,
        front: this.state.originalFront,
        back: this.state.originalBack,
      });
    } else if (id === 'save') {
      // this.setState({ editMode: false });
      this.updateServer();
    }
  };
  getMenuButtons = () => {
    if (this.state.editMode) {
      return (
        <ButtonRow
          buttons={[
            { text: 'Cancel', key: 'cancel', id: 'cancel'},
            { text: 'Save', key: 'save', id: 'save'},
          ]}
          onClick={this.onMenuClick}
        />
      );
    }
    return (
      <ButtonRow
        buttons={[
          { text: 'Back', key: 'back', id: 'back'},
          { text: 'Edit', key: 'edit', id: 'edit'},
        ]}
        onClick={this.onMenuClick}
      />
    );
  };
  render() {
    // if (this.state.state === 'question') {

    return (
      <>
        {this.getMenuButtons()}
        <Divider />
        <div className="card" onClick={this.questionClicked}>
          {this.question()}
          {this.answer()}
        </div>
      </>
    );
  }
}
