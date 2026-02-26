import React from 'react';
import { Card, Button, Input, Space, Typography, Row, Col, Divider } from 'antd';
import { AudioOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { VoiceSelector, VoiceList } from './components';
import { useVoiceover } from './hooks/useVoiceover';
import { SmartDubbingProps } from './types';
import styles from './SmartDubbing.module.less';

const { Title } = Typography;
const { TextArea } = Input;

const SmartDubbing: React.FC<SmartDubbingProps> = ({ onGenerate, onPlay }) => {
  const {
    voiceText,
    selectedProvider,
    selectedVoice,
    speed,
    pitch,
    volume,
    voiceovers,
    playingId,
    isGenerating,
    setVoiceText,
    setSelectedProvider,
    setSelectedVoice,
    setSpeed,
    setPitch,
    setVolume,
    generateVoiceover,
    playVoiceover,
    pauseVoiceover,
    deleteVoiceover,
    downloadVoiceover,
  } = useVoiceover();

  const handleGenerate = async () => {
    await generateVoiceover();
    const newVoiceover = voiceovers[0];
    if (newVoiceover && onGenerate) {
      onGenerate(newVoiceover);
    }
  };

  const handlePlay = (voiceover: typeof voiceovers[0]) => {
    playVoiceover(voiceover);
    if (onPlay) {
      onPlay(voiceover);
    }
  };

  return (
    <div className={styles.container}>
      <Card>
        <Title level={4}>
          <AudioOutlined /> 智能配音
        </Title>
        <Divider />

        <Row gutter={16}>
          <Col span={12}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* 文本输入 */}
              <div>
                <Title level={5}>配音文本</Title>
                <TextArea
                  rows={6}
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                  placeholder="请输入需要配音的文本..."
                  disabled={isGenerating}
                />
              </div>

              {/* 语音设置 */}
              <VoiceSelector
                provider={selectedProvider}
                voice={selectedVoice}
                speed={speed}
                pitch={pitch}
                volume={volume}
                onProviderChange={setSelectedProvider}
                onVoiceChange={setSelectedVoice}
                onSpeedChange={setSpeed}
                onPitchChange={setPitch}
                onVolumeChange={setVolume}
                disabled={isGenerating}
              />

              {/* 生成按钮 */}
              <Button
                type="primary"
                size="large"
                icon={isGenerating ? <LoadingOutlined /> : <PlusOutlined />}
                onClick={handleGenerate}
                loading={isGenerating}
                block
              >
                {isGenerating ? '生成中...' : '生成配音'}
              </Button>
            </Space>
          </Col>

          <Col span={12}>
            <VoiceList
              voiceovers={voiceovers}
              playingId={playingId}
              onPlay={handlePlay}
              onPause={pauseVoiceover}
              onDownload={downloadVoiceover}
              onDelete={deleteVoiceover}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SmartDubbing;
