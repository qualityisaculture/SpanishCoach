import React from 'react';
import { Dropdown, Alert, Space, Button, Divider, theme  } from 'antd';
import { translationDirections } from '../../Enums';
type Props = {
  decks: string[];
  onSaveToDeck: (
    deck: string,
    direction: translationDirections,
    callback: (response: { success: boolean; message: string }) => void
  ) => void;
  open?: boolean;
};
type State = {
  selectedDeck: string;
  saving: boolean;
  successfulSave: boolean;
  failedSave: boolean;
  errorMessage: string | null;
  saveDirection: translationDirections;
};
export default class DeckDropdown extends React.Component<Props, State> {
  static defaultProps: { decks: never[] };
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedDeck: this.props.decks[0],
      saving: false,
      successfulSave: false,
      failedSave: false,
      errorMessage: null,
      saveDirection: translationDirections.SpanishToEnglish,
    };
  }
  componentDidUpdate = (prevProps) => {
    if (prevProps.decks !== this.props.decks) {
      this.setState({ selectedDeck: this.props.decks[0] });
    }
  };
  onChange = (e) => {
    let index = e.key;
    this.setState({ selectedDeck: this.props.decks[index] });
  };
  onClick = () => {
    this.setState({ saving: true, successfulSave: false, failedSave: false });
    this.props.onSaveToDeck(this.state.selectedDeck, this.state.saveDirection, this.onSaveComplete);
  };
  switchSaveDirection = () => {
    this.setState({
      saveDirection:
        this.state.saveDirection === translationDirections.SpanishToEnglish
          ? translationDirections.EnglishToSpanish
          : translationDirections.SpanishToEnglish,
    });
  
  }
  onSaveComplete = (response) => {
    this.setState({ saving: false });
    if (response.success) {
      this.setState({ successfulSave: true });
    } else {
      this.setState({ failedSave: true, errorMessage: response.message });
    }
  };
  render = () => {
    let message =
      this.props.decks.length === 0
        ? 'Loading...'
        : 'Save to ' + this.state.selectedDeck;
    if (this.state.saving) {
      message = 'Saving...';
    }
    let switchDirectionButtonText = this.state.saveDirection === translationDirections.SpanishToEnglish ? 'English to Spanish' : 'Spanish to English';
    const items = this.props.decks.map((deck, index) => ({
      key: index,
      label: deck,
    }));
    const token = theme.getDesignToken();
    const contentStyle: React.CSSProperties = {
      backgroundColor: token.colorBgElevated,
      borderRadius: token.borderRadiusLG,
      boxShadow: token.boxShadowSecondary,
      maxHeight: "400px",
      overflow: "scroll",
    };
  
    const menuStyle: React.CSSProperties = {
      boxShadow: 'none',
    };
    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Dropdown.Button
          className='saveToDeck'
          loading={this.state.saving}
          onClick={this.onClick}
          open={this.props.open}
          menu={{ items, onClick: this.onChange }}
          dropdownRender={(menu) => (
            <div style={contentStyle}>
              {React.cloneElement(menu as React.ReactElement, { style: menuStyle, className: 'deckDropdown'})}
              <Divider style={{ margin: 0 }} />
              <Space style={{ padding: 8 }}>
                <Button className='saveDirection' onClick={this.switchSaveDirection} type="primary">{switchDirectionButtonText}</Button>
              </Space>
            </div>
          )}
        >
          {message}
        </Dropdown.Button>
        {this.state.successfulSave ? (
          <Alert message="Save Successful" type="success" />
        ) : null}
        {this.state.failedSave ? (
          <Alert
            message={'Save Failed: ' + this.state.errorMessage}
            type="error"
          />
        ) : null}
      </Space>
    );
  };
}
DeckDropdown.defaultProps = {
  decks: [],
};
