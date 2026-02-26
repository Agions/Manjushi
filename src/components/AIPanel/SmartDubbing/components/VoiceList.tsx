import React from 'react';
import { Card, List, Button, Space, Tag, Typography, Avatar, Progress } from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  DownloadOutlined,
  DeleteOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Voiceover } from '../types';

const { Text } = Typography;

interface VoiceListProps {
  voiceovers: Voiceover[];
  playingId: string | null;
  onPlay: (voiceover: Voiceover) => void;
  onPause: () => void;
  onDownload: (voiceover: Voiceover) => void;
  onDelete: (id: string) => void;
}

const STATUS_MAP: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
  pending: { color: 'default', icon: null, text: '等待中' },
  generating: { color: 'processing', icon: <LoadingOutlined spin />, text: '生成中' },
  completed: { color: 'success', icon: <CheckCircleOutlined />, text: '已完成' },
  error: { color: 'error', icon: <CloseCircleOutlined />, text: '失败' },
};

export const VoiceList: React.FC<VoiceListProps> = ({
  voiceovers,
  playingId,
  onPlay,
  onPause,
  onDownload,
  onDelete,
}) => {
  if (voiceovers.length === 0) {
    return (
      <Card title="配音列表" size="small">
        <Text type="secondary">暂无配音，请生成</Text>
      </Card>
    );
  }

  return (
    <Card title={`配音列表 (${voiceovers.length})`} size="small">
      <List
        dataSource={voiceovers}
        renderItem={(item) => {
          const status = STATUS_MAP[item.status];
          const isPlaying = playingId === item.id;

          return (
            <List.Item
              actions={[
                item.status === 'completed' && item.audioUrl && (
                  <Button
                    key="play"
                    size="small"
                    icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    onClick={() => (isPlaying ? onPause() : onPlay(item))}
                  >
                    {isPlaying ? '暂停' : '播放'}
                  </Button>
                ),
                item.status === 'completed' && item.audioUrl && (
                  <Button
                    key="download"
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => onDownload(item)}
                  >
                    下载
                  </Button>
                ),
                <Button
                  key="delete"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete(item.id)}
                >
                  删除
                </Button>,
              ].filter(Boolean)}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={
                  <Space>
                    <Text strong>{item.voice}</Text>
                    <Tag color={status.color} icon={status.icon}>
                      {status.text}
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0}>
                    <Text ellipsis style={{ maxWidth: 300 }} title={item.text}>
                      {item.text}
                    </Text>
                    {item.status === 'generating' && (
                      <Progress percent={50} size="small" status="active" />
                    )}
                    {item.status === 'completed' && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        时长: {item.duration.toFixed(1)}s
                      </Text>
                    )}
                    {item.error && (
                      <Text type="danger" style={{ fontSize: 12 }}>
                        {item.error}
                      </Text>
                    )}
                  </Space>
                }
              />
            </List.Item>
          );
        }}
      />
    </Card>
  );
};

export default VoiceList;
