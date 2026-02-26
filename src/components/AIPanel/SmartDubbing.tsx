import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, Button, Select, Slider, Space, Typography, 
  Progress, Tag, Divider, List, Avatar, message, Input, Tooltip, Radio
} from 'antd';
import { 
  AudioOutlined, PlayCircleOutlined, PauseCircleOutlined,
  DownloadOutlined, DeleteOutlined, PlusOutlined,
  UserOutlined, RobotOutlined, SoundOutlined, SyncOutlined,
  CheckCircleOutlined, LoadingOutlined, CloudOutlined,
  GlobalOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import { 
  ttsService, 
  EDGE_VOICES, 
  ALIYUN_VOICES, 
  BAIDU_VOICES,
  XUNFEI_VOICES,
  TTSProvider,
  TTSResult 
} from '@/core/services/tts.service';
import styles from './SmartDubbing.module.less';

const { Text, Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Voiceover {
  id: string;
  text: string;
  voice: string;
  provider: TTSProvider;
  duration: number;
  status: 'pending' | 'generating' | 'completed' | 'error';
  audioUrl?: string;
  error?: string;
}

interface SmartDubbingProps {
  onGenerate?: (voiceover: Voiceover) => void;
  onPlay?: (voiceover: Voiceover) => void;
}

const PROVIDER_OPTIONS: { key: TTSProvider; name: string; icon: React.ReactNode; desc: string }[] = [
  { key: 'edge', name: 'Edge TTS', icon: <GlobalOutlined />, desc: '免费，25+种音色' },
  { key: 'aliyun', name: '阿里云', icon: <CloudOutlined />, desc: '20+种音色，需API Key' },
  { key: 'baidu', name: '百度', icon: <ThunderboltOutlined />, desc: '10+种音色，需API Key' },
  { key: 'xunfei', name: '讯飞', icon: <AudioOutlined />, desc: '5+种音色，需App ID' },
];

const SmartDubbing: React.FC<SmartDubbingProps> = ({ onGenerate, onPlay }) => {
  const [voiceText, setVoiceText] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<TTSProvider>('edge');
  const [selectedVoice, setSelectedVoice] = useState<string>('zh-CN-XiaoxiaoNeural');
  const [speed, setSpeed] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(0);
  const [volume, setVolume] = useState<number>(80);
  const [voiceovers, setVoiceovers] = useState<Voiceover[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioElements, setAudioElements] = useState<Map<string, HTMLAudioElement>>(new Map());

  // 根据提供商获取语音列表
  const getVoiceOptions = useCallback(() => {
    switch (selectedProvider) {
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
  }, [selectedProvider]);

  // 切换提供商时，重置语音选择
  useEffect(() => {
    const voices = getVoiceOptions();
    if (voices.length > 0) {
      setSelectedVoice(voices[0].id);
    }
  }, [selectedProvider, getVoiceOptions]);

  // 生成配音
  const handleGenerate = async () => {
    if (!voiceText.trim()) {
      message.warning('请输入配音文本');
      return;
    }

    setIsGenerating(true);
    const id = Date.now().toString();

    const newVoiceover: Voiceover = {
      id,
      text: voiceText,
      voice: selectedVoice,
      provider: selectedProvider,
      duration: 0,
      status: 'generating',
    };

    setVoiceovers(prev => [...prev, newVoiceover]);
    setVoiceText('');

    try {
      // 调用 TTS 服务
      const result = await ttsService.synthesize(
        {
          text: voiceText,
          voice: selectedVoice,
          speed,
          pitch,
          volume,
        },
        { provider: selectedProvider }
      );

      // 创建音频元素
      if (result.audioUrl) {
        const audio = new Audio(result.audioUrl);
        setAudioElements(prev => new Map(prev).set(id, audio));
      }

      const completedVoiceover: Voiceover = {
        ...newVoiceover,
        status: 'completed',
        audioUrl: result.audioUrl,
        duration: result.duration,
      };

      setVoiceovers(prev =>
        prev.map(v => (v.id === id ? completedVoiceover : v))
      );

      message.success('配音生成完成');
      onGenerate?.(completedVoiceover);
    } catch (error) {
      const errorVoiceover: Voiceover = {
        ...newVoiceover,
        status: 'error',
        error: error instanceof Error ? error.message : '生成失败',
      };

      setVoiceovers(prev =>
        prev.map(v => (v.id === id ? errorVoiceover : v))
      );

      message.error(error instanceof Error ? error.message : '配音生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  // 播放/暂停
  const handlePlay = async (voiceover: Voiceover) => {
    // 停止当前播放
    if (playingId && playingId !== voiceover.id) {
      const currentAudio = audioElements.get(playingId);
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
      ttsService.stop();
    }

    if (playingId === voiceover.id) {
      // 暂停
      const audio = audioElements.get(voiceover.id);
      if (audio) {
        audio.pause();
      }
      ttsService.stop();
      setPlayingId(null);
    } else {
      // 播放
      setPlayingId(voiceover.id);

      if (voiceover.audioUrl) {
        try {
          await ttsService.play(voiceover.audioUrl);
          setPlayingId(null);
        } catch {
          // 播放结束或失败
          setPlayingId(null);
        }
      } else {
        // 使用 Web Speech API 作为备用
        try {
          await ttsService.synthesize(
            {
              text: voiceover.text,
              voice: voiceover.voice,
              speed,
              pitch,
              volume,
            },
            { provider: voiceover.provider }
          );
        } catch (error) {
          message.error('播放失败');
        } finally {
          setPlayingId(null);
        }
      }

      onPlay?.(voiceover);
    }
  };

  // 删除配音
  const handleDelete = (id: string) => {
    // 停止播放
    if (playingId === id) {
      const audio = audioElements.get(id);
      if (audio) {
        audio.pause();
      }
      ttsService.stop();
      setPlayingId(null);
    }

    // 释放音频 URL
    const voiceover = voiceovers.find(v => v.id === id);
    if (voiceover?.audioUrl) {
      URL.revokeObjectURL(voiceover.audioUrl);
    }

    // 移除音频元素
    setAudioElements(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });

    setVoiceovers(prev => prev.filter(v => v.id !== id));
    message.success('已删除配音');
  };

  // 下载配音
  const handleDownload = (voiceover: Voiceover) => {
    if (voiceover.audioUrl) {
      const filename = `配音_${voiceover.id}_${Date.now()}.mp3`;
      ttsService.download(voiceover.audioUrl, filename);
      message.success('开始下载');
    } else {
      message.warning('暂无可下载的音频');
    }
  };

  // 获取语音名称
  const getVoiceName = (voiceId: string, provider: TTSProvider) => {
    const voices = ttsService.getVoices(provider);
    const voice = voices.find(v => v.id === voiceId);
    return voice ? `${voice.name} (${voice.style})` : voiceId;
  };

  // 格式化时长
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}秒`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}分${secs}秒`;
  };

  // 估算字符时长
  const estimateDuration = (text: string): number => {
    if (!text) return 0;
    // 中文大约每秒 4-5 个字
    const chineseChars = text.match(/[\u4e00-\u9fa5]/g)?.length || 0;
    const otherChars = text.length - chineseChars;
    return (chineseChars / 4.5 + otherChars / 10) / speed;
  };

  // 获取提供商名称
  const getProviderName = (provider: TTSProvider) => {
    return PROVIDER_OPTIONS.find(p => p.key === provider)?.name || provider;
  };

  const voiceOptions = getVoiceOptions();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <AudioOutlined className={styles.headerIcon} />
        <Title level={5} className={styles.title}>智能配音</Title>
      </div>

      {/* 配音输入 */}
      <div className={styles.inputSection}>
        <TextArea
          placeholder="输入配音文本..."
          value={voiceText}
          onChange={(e) => setVoiceText(e.target.value)}
          rows={4}
          maxLength={2000}
          showCount
        />
        <div className={styles.estimateInfo}>
          <SoundOutlined />
          <Text type="secondary">
            预计时长: {formatDuration(estimateDuration(voiceText))}
          </Text>
        </div>
      </div>

      {/* 提供商选择 */}
      <div className={styles.providerSection}>
        <Text strong className={styles.sectionLabel}>TTS 引擎</Text>
        <Radio.Group
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
          buttonStyle="solid"
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
        >
          {PROVIDER_OPTIONS.map(provider => (
            <Radio.Button key={provider.key} value={provider.key}>
              <Space>
                {provider.icon}
                <span>{provider.name}</span>
              </Space>
            </Radio.Button>
          ))}
        </Radio.Group>
        <Text type="secondary" style={{ fontSize: 12, marginTop: 4 }}>
          {PROVIDER_OPTIONS.find(p => p.key === selectedProvider)?.desc}
        </Text>
      </div>

      {/* 语音选择 */}
      <div className={styles.voiceSection}>
        <Text strong className={styles.sectionLabel}>选择音色</Text>
        <Select
          value={selectedVoice}
          onChange={setSelectedVoice}
          style={{ width: '100%' }}
          optionLabelProp="label"
          showSearch
          filterOption={(input, option) =>
            (option?.children as any)?.props?.children?.[2]?.props?.children
              ?.toLowerCase()
              .includes(input.toLowerCase())
          }
        >
          {voiceOptions.map(voice => (
            <Option 
              key={voice.id} 
              value={voice.id}
              label={voice.name}
            >
              <Space>
                <Avatar 
                  size="small" 
                  icon={voice.gender === '女' ? <UserOutlined /> : <RobotOutlined />}
                  style={{ 
                    backgroundColor: voice.gender === '女' ? '#eb6f92' : '#3b82f6' 
                  }}
                />
                <span>{voice.name}</span>
                <Tag size="small">{voice.gender}</Tag>
                <Text type="secondary" style={{ fontSize: 12 }}>{voice.style}</Text>
              </Space>
            </Option>
          ))}
        </Select>
      </div>

      {/* 参数调节 */}
      <div className={styles.paramsSection}>
        <Text strong className={styles.sectionLabel}>参数调节</Text>
        
        <div className={styles.paramItem}>
          <div className={styles.paramHeader}>
            <Text>语速</Text>
            <Text>{speed.toFixed(1)}x</Text>
          </div>
          <Slider
            value={speed}
            onChange={setSpeed}
            min={0.5}
            max={2}
            step={0.1}
          />
        </div>

        <div className={styles.paramItem}>
          <div className={styles.paramHeader}>
            <Text>音调</Text>
            <Text>{pitch > 0 ? `+${pitch}` : pitch}</Text>
          </div>
          <Slider
            value={pitch}
            onChange={setPitch}
            min={-10}
            max={10}
          />
        </div>

        <div className={styles.paramItem}>
          <div className={styles.paramHeader}>
            <Text>音量</Text>
            <Text>{volume}%</Text>
          </div>
          <Slider
            value={volume}
            onChange={setVolume}
            min={0}
            max={100}
          />
        </div>
      </div>

      <Divider />

      {/* 生成按钮 */}
      <Button
        type="primary"
        icon={<AudioOutlined />}
        onClick={handleGenerate}
        disabled={!voiceText.trim() || isGenerating}
        loading={isGenerating}
        block
      >
        {isGenerating ? '生成中...' : '生成配音'}
      </Button>

      {/* 配音列表 */}
      {voiceovers.length > 0 && (
        <div className={styles.listSection}>
          <Text strong className={styles.sectionLabel}>
            配音列表 ({voiceovers.length})
          </Text>
          
          <List
            className={styles.voiceoverList}
            dataSource={voiceovers}
            renderItem={(item) => (
              <List.Item
                className={`${styles.voiceoverItem} ${
                  item.status === 'generating' ? styles.generating : ''
                } ${item.status === 'error' ? styles.error : ''}`}
                actions={[
                  <Tooltip title={playingId === item.id ? '暂停' : '播放'} key="play">
                    <Button
                      type="text"
                      size="small"
                      icon={
                        item.status === 'generating' 
                          ? <LoadingOutlined spin />
                          : playingId === item.id 
                            ? <PauseCircleOutlined /> 
                            : <PlayCircleOutlined />
                      }
                      onClick={() => handlePlay(item)}
                      disabled={item.status === 'generating' || item.status === 'error'}
                    />
                  </Tooltip>,
                  <Tooltip title="下载" key="download">
                    <Button
                      type="text"
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownload(item)}
                      disabled={!item.audioUrl}
                    />
                  </Tooltip>,
                  <Tooltip title="删除" key="delete">
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(item.id)}
                    />
                  </Tooltip>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={<AudioOutlined />}
                      style={{ 
                        backgroundColor: 
                          item.status === 'error' ? '#ff4d4f' :
                          item.status === 'completed' ? '#52c41a' : '#1890ff'
                      }}
                    />
                  }
                  title={
                    <Space>
                      <Text strong>配音 {item.id.slice(-4)}</Text>
                      <Tag size="small">{getProviderName(item.provider)}</Tag>
                      {item.status === 'completed' && (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      )}
                      {item.status === 'generating' && (
                        <SyncOutlined spin style={{ color: '#1890ff' }} />
                      )}
                      {item.status === 'error' && (
                        <Text type="danger" style={{ fontSize: 12 }}>
                          {item.error}
                        </Text>
                      )}
                    </Space>
                  }
                  description={
                    <div className={styles.itemDesc}>
                      <Text ellipsis className={styles.itemText}>{item.text}</Text>
                      <Space size="small" wrap>
                        <Tag size="small">{getVoiceName(item.voice, item.provider)}</Tag>
                        {item.duration > 0 && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatDuration(item.duration)}
                          </Text>
                        )}
                      </Space>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default SmartDubbing;
