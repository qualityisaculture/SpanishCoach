import React from 'react';
import { Input, Card, Button, Radio, Modal } from 'antd';
const { TextArea } = Input;
import ServerHandler from '../ServerHandler';
import ChatDialog from './ChatDialog';

type Props = {
  onExplanation: (explanation: { spanish: string; explanation: string }) => void;
  focusRef: any;
};

type ExplanationComplexity = 'simple' | 'intermediate';

type State = {
  input: string;
  explanation: string;
  explanationLoading: boolean;
  complexity: ExplanationComplexity;
  lastRequestedComplexity: ExplanationComplexity;
  showConversation: boolean;
};

export default class ExplanationMode extends React.Component<Props, State> {
  explanationServerHandler: ServerHandler;
  simplifyServerHandler: ServerHandler;

  constructor(props: Props) {
    super(props);
    this.explanationServerHandler = new ServerHandler(
      this.onExplanationReceived,
      300 // 300ms debounce
    );
    this.simplifyServerHandler = new ServerHandler(
      this.onSimplifyReceived
    );
    this.state = {
      input: '',
      explanation: '',
      explanationLoading: false,
      complexity: 'simple', // Default to simple
      lastRequestedComplexity: 'simple',
      showConversation: false,
    };
  }

  requestExplanation = (spanish: string, complexity: ExplanationComplexity = this.state.complexity) => {
    this.setState({ explanationLoading: true, lastRequestedComplexity: complexity });
    this.explanationServerHandler.request(`/explain?spanish=${encodeURIComponent(spanish)}&complexity=${complexity}`);
  };

  requestSimplify = (spanish: string) => {
    this.setState({ explanationLoading: true });
    this.simplifyServerHandler.request(`/simplify?spanish=${encodeURIComponent(spanish)}`);
  };

  onExplanationReceived = (json: any, isFinal: boolean) => {
    this.setState({ explanationLoading: !isFinal });
    if (json.error) {
      this.setState({ 
        explanation: `Error: ${json.error}`,
        explanationLoading: false 
      });
      this.props.onExplanation({ spanish: this.state.input, explanation: `Error: ${json.error}` });
    } else if (isFinal) {
      this.setState({ 
        explanation: json.explanation,
        explanationLoading: false 
      });
      this.props.onExplanation({ spanish: this.state.input, explanation: json.explanation });
    }
  };

  onSimplifyReceived = (json: any, isFinal: boolean) => {
    this.setState({ explanationLoading: !isFinal });
    if (json.error) {
      this.setState({ 
        explanation: `Error: ${json.error}`,
        explanationLoading: false 
      });
      this.props.onExplanation({ spanish: this.state.input, explanation: `Error: ${json.error}` });
    } else if (isFinal) {
      this.setState({ 
        explanation: json.simplifiedExplanation,
        explanationLoading: false 
      });
      this.props.onExplanation({ spanish: this.state.input, explanation: json.simplifiedExplanation });
    }
  };

  handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    this.setState({ input });
    
    if (input === '') {
      this.explanationServerHandler.cancel();
      this.setState({ explanation: '', explanationLoading: false });
      this.props.onExplanation({ spanish: '', explanation: '' });
    } else {
      this.requestExplanation(input, this.state.complexity);
    }
  };

  handleComplexityChange = (e) => {
    const newComplexity = e.target.value as ExplanationComplexity;
    this.setState({ complexity: newComplexity });
    if (this.state.input) {
      this.requestExplanation(this.state.input, newComplexity);
    }
  };

  handleSwitchComplexity = () => {
    const newComplexity: ExplanationComplexity = this.state.lastRequestedComplexity === 'simple' ? 'intermediate' : 'simple';
    this.setState({ complexity: newComplexity });
    if (this.state.input) {
      this.requestExplanation(this.state.input, newComplexity);
    }
  };

  handleStartConversation = () => {
    this.setState({ showConversation: true });
  };

  handleCloseConversation = () => {
    this.setState({ showConversation: false });
  };

  render() {
    const { input, explanation, explanationLoading, lastRequestedComplexity, showConversation } = this.state;

    return (
      <div>
        {/* Removed Radio.Group toggle for complexity */}
        <TextArea
          className="explanationInput"
          placeholder="Enter a Spanish word or phrase to explain"
          value={input}
          onChange={this.handleInputChange}
          variant="borderless"
          size="large"
          allowClear={true}
          ref={this.props.focusRef}
          {...(!global.testing
            ? { autoSize: { minRows: 1, maxRows: 6 } }
            : null)}
        />
        
        {explanation && (
          <Card 
            title="Explanation" 
            style={{ marginTop: 16 }}
            extra={
              <Button 
                size="small" 
                onClick={this.handleSwitchComplexity}
                loading={explanationLoading}
              >
                {lastRequestedComplexity === 'simple' ? 'Expand' : 'Simplify'}
              </Button>
            }
          >
            <div style={{ minHeight: '60px' }}>
              {explanationLoading ? 'Generating explanation...' : explanation}
            </div>
            <div style={{ marginTop: 16 }}>
              <Button 
                type="dashed" 
                onClick={this.handleStartConversation}
                style={{ width: '100%' }}
              >
                Ask follow-up questions
              </Button>
            </div>
          </Card>
        )}

        <Modal
          title="Follow-up Questions"
          open={showConversation}
          onCancel={this.handleCloseConversation}
          footer={null}
          width={800}
          style={{ top: 20 }}
          bodyStyle={{ maxHeight: '70vh', overflow: 'auto' }}
        >
          <ChatDialog
            initialMessages={[
              {
                message: `Explain this Spanish word/phrase: "${input}"`,
                type: 'human',
              },
              {
                message: explanation,
                type: 'bot',
              },
            ]}
          />
        </Modal>
      </div>
    );
  }
} 