/**
 * 工作流步骤配置组件
 * 每个步骤的详细设置 UI
 */

import React from 'react';
import { Card, Select, Slider, Switch, Input, Collapse, Tag, Space, Divider } from 'antd';
import { SettingOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { StepSetting } from '@/core/config/workflow-config';

interface StepSettingsProps {
  settings: StepSetting[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

const StepSettingsPanel: React.FC<StepSettingsProps> = ({ settings, values, onChange }) => {
  
  const renderSetting = (setting: StepSetting) => {
    const value = values[setting.key] ?? setting.default;
    
    switch (setting.type) {
      case 'select':
        return (
          <div key={setting.key} className="setting-item">
            <span className="setting-label">{setting.label}</span>
            <Select
              value={value}
              onChange={(v) => onChange(setting.key, v)}
              options={setting.options}
              style={{ width: '100%' }}
              size="small"
            />
          </div>
        );
        
      case 'slider':
        return (
          <div key={setting.key} className="setting-item">
            <span className="setting-label">{setting.label}: {value}</span>
            <Slider
              min={setting.min}
              max={setting.max}
              value={value}
              onChange={(v) => onChange(setting.key, v)}
              marks={{
                [setting.min!]: String(setting.min),
                [setting.max!]: String(setting.max)
              }}
            />
          </div>
        );
        
      case 'toggle':
        return (
          <div key={setting.key} className="setting-item toggle-item">
            <span className="setting-label">{setting.label}</span>
            <Switch
              checked={value}
              onChange={(v) => onChange(setting.key, v)}
              size="small"
            />
          </div>
        );
        
      case 'input':
        return (
          <div key={setting.key} className="setting-item">
            <span className="setting-label">{setting.label}</span>
            <Input
              value={value}
              onChange={(e) => onChange(setting.key, e.target.value)}
              size="small"
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="step-settings">
      {settings.map(renderSetting)}
    </div>
  );
};

// 工作流步骤详情组件
interface StepDetailProps {
  stepKey: string;
  title: string;
  description: string;
  settings: StepSetting[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  isActive: boolean;
  isCompleted: boolean;
}

export const StepDetailCard: React.FC<StepDetailProps> = ({
  stepKey,
  title,
  description,
  settings,
  values,
  onChange,
  isActive,
  isCompleted
}) => {
  return (
    <Card
      size="small"
      title={
        <Space>
          <span>{title}</span>
          {isCompleted && <Tag color="green" icon={<CheckCircleOutlined />}>已完成</Tag>}
          {isActive && <Tag color="blue" icon={<SettingOutlined />}>进行中</Tag>}
        </Space>
      }
      className={`step-detail-card ${isActive ? 'active' : ''}`}
    >
      <p className="step-description">{description}</p>
      <Divider orientation="left" plain>详细设置</Divider>
      <StepSettingsPanel
        settings={settings}
        values={values}
        onChange={onChange}
      />
    </Card>
  );
};

export default StepSettingsPanel;
