import React from 'react';
import { Switch } from 'antd';
import { AppMode } from '../../Enums';

type Props = {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
};

export default class ModeToggle extends React.Component<Props> {
  handleModeChange = (checked: boolean) => {
    const newMode = checked ? AppMode.Explanation : AppMode.Translation;
    this.props.onModeChange(newMode);
  };

  render() {
    const { currentMode } = this.props;
    const isExplanationMode = currentMode === AppMode.Explanation;

    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        marginBottom: '16px'
      }}>
        <span style={{ fontSize: '14px', color: '#666' }}>
          Translation
        </span>
        <Switch
          checked={isExplanationMode}
          onChange={this.handleModeChange}
          checkedChildren="Explanation"
          unCheckedChildren="Translation"
        />
        <span style={{ fontSize: '14px', color: '#666' }}>
          Explanation
        </span>
      </div>
    );
  }
} 