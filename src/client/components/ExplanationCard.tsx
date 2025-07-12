import React from 'react';
import { Card, Button, Space } from 'antd';

type Props = {
  spanish: string;
  explanation: string;
  onSave: () => void;
  onSimplify: () => void;
  loading?: boolean;
  simplifyLoading?: boolean;
};

export default class ExplanationCard extends React.Component<Props> {
  render() {
    const { 
      spanish, 
      explanation, 
      onSave, 
      onSimplify, 
      loading = false,
      simplifyLoading = false 
    } = this.props;

    return (
      <Card 
        title="Card Preview" 
        style={{ marginTop: 16 }}
        extra={
          <Space>
            <Button 
              size="small" 
              onClick={onSimplify}
              loading={simplifyLoading}
            >
              Simplify
            </Button>
            <Button 
              type="primary" 
              size="small" 
              onClick={onSave}
              loading={loading}
            >
              Save Card
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#1890ff' }}>
            Front (Spanish):
          </div>
          <div style={{ 
            padding: 12, 
            backgroundColor: '#f5f5f5', 
            borderRadius: 4,
            minHeight: '40px'
          }}>
            {spanish}
          </div>
        </div>
        
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#52c41a' }}>
            Back (Explanation):
          </div>
          <div style={{ 
            padding: 12, 
            backgroundColor: '#f6ffed', 
            borderRadius: 4,
            minHeight: '60px'
          }}>
            {explanation}
          </div>
        </div>
      </Card>
    );
  }
} 