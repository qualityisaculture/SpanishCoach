import React from 'react';
import { Button } from 'antd';

type Props = {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
};

export default class SimplifyButton extends React.Component<Props> {
  static defaultProps = {
    loading: false,
    disabled: false,
    size: 'small',
  };

  render() {
    const { onClick, loading, disabled, size } = this.props;

    return (
      <Button
        size={size}
        onClick={onClick}
        loading={loading}
        disabled={disabled}
        icon={<span>🔽</span>}
      >
        Simplify
      </Button>
    );
  }
} 