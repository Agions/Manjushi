import React from 'react';
import { Card, Select, Slider, Space, Typography, Radio, Tag } from 'antd';
import {
  GlobalOutlined,
  CloudOutlined,
  ThunderboltOutlined,
  AudioOutlined,
} from '@ant-design/icons';
import {
  TTSProvider,
  EDGE_VOICES,
  ALIYUN_VOICES,
  BAIDU_VOICES,
  XUNFEI_VOICES,
} from '@/core/services/tts.service';

const { Text } = Typography;
const { Option } = Select;

const PROVIDER_OPTIONS: { key: TTSProvider; name: string; icon: React.ReactNode; desc: string }[] = [
  { key: 'edge', name: 'Edge TTS', icon: <GlobalOutlined />, desc: '免费，25+种音色' },
  { key: 'aliyun', name: '阿里云', icon: <CloudOutlined />, desc: '20+种音色，需API Key' },
  { key: 'baidu', name: '百度', icon: <ThunderboltOutlined />, desc: '10+种音色，需API Key' },
  { key: 'xunfei', name: '讯飞', icon: <AudioOutlined />, desc: '5+种音色，需App ID' },
];

interface VoiceSelectorProps {
  provider: TTSProvider;
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  onProviderChange: (provider: TTSProvider) => void;
  onVoiceChange: (voice: string) => void;
  onSpeedChange: (speed: number) => void;
  onPitchChange: (pitch: number) => void;
  onVolumeChange: (volume: number) => void;
  disabled?: boolean;
}

const getVoiceOptions = (provider: TTSProvider) => {
  switch (provider) {
    case 'edge':
      return EDGE_VOICES;
    case 'aliyun':
      return ALIYUN_VOICES;
    case 'baidu':
      return BAIDU_VOICES;
    case 'xunfei':
      return XUNFEI_VOICES;
    default:
      return EDGE_VOICES;
  }
};

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  provider,
  voice,
  speed,
  pitch,
  volume,
  onProviderChange,
  onVoiceChange,
  onSpeedChange,
  onPitchChange,
  onVolumeChange,
  disabled,
}) => {
  const voices = getVoiceOptions(provider);

  return (
    <Card title="语音设置" size="small">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* 提供商选择 */}
        <div>
          <Text strong>TTS 引擎</Text>
          <Radio.Group
            value={provider}
            onChange={(e) => onProviderChange(e.target.value)}
            disabled={disabled}
          >
            {PROVIDER_OPTIONS.map((p) => (
              <Radio.Button key={p.key} value={p.key}>
                <Space>
                  {p.icon}
                  {p.name}
                  <Tag size="small">{p.desc}</Tag>
                </Space>
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>

        {/* 音色选择 */}
        <div>
          <Text strong>音色</Text>
          <Select
            style={{ width: '100%' }}
            value={voice}
            onChange={onVoiceChange}
            disabled={disabled}
          >
            {voices.map((v) => (
              <Option key={v.id} value={v.id}>
                {v.name} - {v.desc}
              </Option>
            ))}
          </Select>
        </div>

        {/* 语速 */}
        <div>
          <Text strong>语速: {speed.toFixed(1)}x</Text>
          <Slider
            min={0.5}
            max={2}
            step={0.1}
            value={speed}
            onChange={onSpeedChange}
            disabled={disabled}
          />
        </div>

        {/* 音调 */}
        <div>
          <Text strong>音调: {pitch > 0 ? `+${pitch}` : pitch}</Text>
          <Slider
            min={-10}
            max={10}
            step={1}
            value={pitch}
            onChange={onPitchChange}
            disabled={disabled}
          />
        </div>

        {/* 音量 */}
        <div>
          <Text strong>音量: {volume}%</Text>
          <Slider
            min={0}
            max={100}
            step={5}
            value={volume}
            onChange={onVolumeChange}
            disabled={disabled}
          />
        </div>
      </Space>
    </Card>
  );
};

export default VoiceSelector;
