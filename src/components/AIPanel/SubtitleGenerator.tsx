import React, { useState } from 'react';
import { 
  Card, Button, Select, Slider, Space, Typography, 
  Progress, Tag, Divider, List, Switch, Input, message, Tooltip
} from 'antd';
import { 
  FontSizeOutlined, PlayCircleOutlined, PauseCircleOutlined,
  DownloadOutlined, DeleteOutlined, PlusOutlined,
  BgColorsOutlined, AlignCenterOutlined, AlignLeftOutlined,
  CheckCircleOutlined, SyncOutlined, LoadingOutlined
} from '@ant-design/icons';
import styles from './SubtitleGenerator.module.less';

const { Text, Title } = Typography;
const { Option } = Select;

interface Subtitle {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
}

interface SubtitleStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  position: 'bottom' | 'top' | 'center';
  alignment: 'left' | 'center' | 'right';
}

const FONT_OPTIONS = [
  { id: 'Microsoft YaHei', name: '微软雅黑' },
  { id: 'SimHei', name: '黑体' },
  { id: 'SimSun', name: '宋体' },
  { id: 'KaiTi', name: '楷体' },
];

const SubtitleGenerator: React.FC = () => {
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [subtitles, setSubtitles] = useState<Subtitle[]>([
    {
      id: '1',
      startTime: 0,
      endTime: 3.5,
      text: '欢迎使用 AI 智能字幕功能',
      status: 'completed',
    },
    {
      id: '2',
      startTime: 3.5,
      endTime: 7.2,
      text: '自动识别视频中的语音内容',
      status: 'completed',
    },
    {
      id: '3',
      startTime: 7.2,
      endTime: 12.0,
      text: '生成精准的同步字幕',
      status: 'completed',
    },
  ]);
  const [style, setStyle] = useState<SubtitleStyle>({
    fontSize: 24,
    fontFamily: 'Microsoft YaHei',
    color: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'bottom',
    alignment: 'center',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  // 生成字幕
  const handleGenerate = () => {
    setIsGenerating(true);
    
    // 模拟生成过程
    setTimeout(() => {
      const newSubtitle: Subtitle = {
        id: Date.now().toString(),
        startTime: subtitles[subtitles.length - 1]?.endTime || 0,
        endTime: (subtitles[subtitles.length - 1]?.endTime || 0) + 4,
        text: '这是新生成的字幕内容',
        status: 'completed',
      };
      
      setSubtitles(prev => [...prev, newSubtitle]);
      setIsGenerating(false);
      message.success('字幕生成完成');
    }, 2000);
  };

  // 删除字幕
  const handleDelete = (id: string) => {
    setSubtitles(prev => prev.filter(s => s.id !== id));
    message.success('已删除字幕');
  };

  // 编辑字幕
  const handleEdit = (id: string, newText: string) => {
    setSubtitles(prev => 
      prev.map(s => s.id === id ? { ...s, text: newText } : s)
    );
  };

  // 导出字幕
  const handleExport = () => {
    message.success('字幕已导出为 SRT 格式');
  };

  // 获取总时长
  const getTotalDuration = () => {
    if (subtitles.length === 0) return 0;
    return subtitles[subtitles.length - 1].endTime;
  };

  // 获取总字数
  const getTotalChars = () => {
    return subtitles.reduce((total, s) => total + s.text.length, 0);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <FontSizeOutlined className={styles.headerIcon} />
        <Title level={5} className={styles.title}>字幕生成</Title>
      </div>

      {/* 生成模式 */}
      <div className={styles.modeSection}>
        <div className={styles.modeButtons}>
          <Button
            type={mode === 'auto' ? 'primary' : 'default'}
            onClick={() => setMode('auto')}
            icon={<SyncOutlined />}
            size="small"
          >
            AI 自动识别
          </Button>
          <Button
            type={mode === 'manual' ? 'primary' : 'default'}
            onClick={() => setMode('manual')}
            icon={<FontSizeOutlined />}
            size="small"
          >
            手动输入
          </Button>
        </div>
        <Text type="secondary" className={styles.modeHint}>
          {mode === 'auto' ? 'AI 自动识别视频中的语音内容' : '手动输入字幕文本'}
        </Text>
      </div>

      <Divider />

      {/* 字幕样式设置 */}
      <div className={styles.styleSection}>
        <Text strong className={styles.sectionLabel}>字幕样式</Text>
        
        <div className={styles.styleRow}>
          <div className={styles.styleItem}>
            <Text>字号</Text>
            <Slider
              value={style.fontSize}
              onChange={(value) => setStyle({ ...style, fontSize: value })}
              min={12}
              max={48}
            />
            <Text>{style.fontSize}px</Text>
          </div>
        </div>

        <div className={styles.styleRow}>
          <div className={styles.styleItem}>
            <Text>字体</Text>
            <Select
              value={style.fontFamily}
              onChange={(value) => setStyle({ ...style, fontFamily: value })}
              style={{ width: '100%' }}
            >
              {FONT_OPTIONS.map(font => (
                <Option key={font.id} value={font.id}>{font.name}</Option>
              ))}
            </Select>
          </div>
        </div>

        <div className={styles.styleRow}>
          <Text>颜色</Text>
          <div className={styles.colorPicker}>
            {['#ffffff', '#ffff00', '#00ff00', '#ff0000', '#00ffff'].map(color => (
              <Tooltip title={color} key={color}>
                <div
                  className={`${styles.colorSwatch} ${style.color === color ? styles.selected : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setStyle({ ...style, color })}
                />
              </Tooltip>
            ))}
          </div>
        </div>

        <div className={styles.styleRow}>
          <div className={styles.styleItem}>
            <Text>对齐方式</Text>
            <Space>
              <Tooltip title="左对齐">
                <Button
                  type={style.alignment === 'left' ? 'primary' : 'default'}
                  icon={<AlignLeftOutlined />}
                  onClick={() => setStyle({ ...style, alignment: 'left' })}
                  size="small"
                />
              </Tooltip>
              <Tooltip title="居中">
                <Button
                  type={style.alignment === 'center' ? 'primary' : 'default'}
                  icon={<AlignCenterOutlined />}
                  onClick={() => setStyle({ ...style, alignment: 'center' })}
                  size="small"
                />
              </Tooltip>
            </Space>
          </div>
        </div>

        <div className={styles.switchRow}>
          <Text>显示背景</Text>
          <Switch
            checked={style.backgroundColor !== 'transparent'}
            onChange={(checked) => setStyle({ 
              ...style, 
              backgroundColor: checked ? 'rgba(0, 0, 0, 0.5)' : 'transparent' 
            })}
          />
        </div>
      </div>

      <Divider />

      {/* 预览按钮 */}
      <Button
        type={showPreview ? 'primary' : 'default'}
        icon={showPreview ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
        onClick={() => setShowPreview(!showPreview)}
        block
      >
        {showPreview ? '关闭预览' : '预览字幕'}
      </Button>

      {/* 统计信息 */}
      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <Text type="secondary">字幕条数</Text>
          <Text strong>{subtitles.length}</Text>
        </div>
        <div className={styles.statItem}>
          <Text type="secondary">总时长</Text>
          <Text strong>{formatTime(getTotalDuration())}</Text>
        </div>
        <div className={styles.statItem}>
          <Text type="secondary">总字数</Text>
          <Text strong>{getTotalChars()}</Text>
        </div>
      </div>

      {/* 字幕列表 */}
      <div className={styles.listSection}>
        <div className={styles.listHeader}>
          <Text strong>字幕列表</Text>
          <Space>
            <Button
              type="primary"
              size="small"
              icon={isGenerating ? <LoadingOutlined /> : <PlusOutlined />}
              onClick={handleGenerate}
              loading={isGenerating}
            >
              {isGenerating ? '生成中' : '添加字幕'}
            </Button>
          </Space>
        </div>

        <div className={styles.subtitleList}>
          {subtitles.map((subtitle, index) => (
            <Card
              key={subtitle.id}
              size="small"
              className={styles.subtitleCard}
            >
              <div className={styles.subtitleHeader}>
                <Tag>#{index + 1}</Tag>
                <Text type="secondary">
                  {formatTime(subtitle.startTime)} - {formatTime(subtitle.endTime)}
                </Text>
                {subtitle.status === 'completed' && (
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                )}
              </div>
              
              {mode === 'manual' ? (
                <Input
                  value={subtitle.text}
                  onChange={(e) => handleEdit(subtitle.id, e.target.value)}
                  size="small"
                />
              ) : (
                <Text className={styles.subtitleText}>{subtitle.text}</Text>
              )}
              
              <div className={styles.subtitleActions}>
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(subtitle.id)}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 导出按钮 */}
      <div className={styles.exportSection}>
        <Button
          icon={<DownloadOutlined />}
          onClick={handleExport}
          disabled={subtitles.length === 0}
          block
        >
          导出字幕
        </Button>
      </div>
    </div>
  );
};

export default SubtitleGenerator;
