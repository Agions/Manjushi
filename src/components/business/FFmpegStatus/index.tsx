import React, { useState, useEffect } from 'react';
import {
  Card, Button, Space, Typography, Tag, Alert, Spin,
  Descriptions, Badge, Tooltip
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined,
  ToolOutlined, InfoCircleOutlined, DownloadOutlined
} from '@ant-design/icons';
import { ffmpegService, FFmpegStatus } from '@/core/services/ffmpeg.service';
import styles from './index.module.less';

const { Text, Title, Paragraph } = Typography;

const FFmpegStatusCard: React.FC = () => {
  const [status, setStatus] = useState<FFmpegStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const result = await ffmpegService.checkFFmpeg();
      setStatus(result);
    } catch (error) {
      console.error('检查 FFmpeg 失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  // 获取安装指南链接
  const getInstallGuideUrl = () => {
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('win')) {
      return 'https://ffmpeg.org/download.html#build-windows';
    } else if (platform.includes('mac')) {
      return 'https://ffmpeg.org/download.html#build-mac';
    } else {
      return 'https://ffmpeg.org/download.html#build-linux';
    }
  };

  // 获取包管理器安装命令
  const getInstallCommand = () => {
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('win')) {
      return 'winget install Gyan.FFmpeg';
    } else if (platform.includes('mac')) {
      return 'brew install ffmpeg';
    } else {
      return 'sudo apt install ffmpeg  # Ubuntu/Debian\nsudo yum install ffmpeg  # CentOS/RHEL';
    }
  };

  if (loading) {
    return (
      <Card className={styles.card}>
        <div className={styles.loading}>
          <Spin />
          <Text>正在检查 FFmpeg...</Text>
        </div>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card className={styles.card}>
        <Alert
          message="检查失败"
          description="无法检查 FFmpeg 状态，请重试"
          type="warning"
          action={
            <Button size="small" onClick={checkStatus}>
              重试
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card
      className={styles.card}
      title={
        <Space>
          <ToolOutlined />
          <span>FFmpeg 状态</span>
          {status.installed ? (
            <Badge status="success" text="已安装" />
          ) : (
            <Badge status="error" text="未安装" />
          )}
        </Space>
      }
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={checkStatus}
          loading={loading}
          size="small"
        >
          刷新
        </Button>
      }
    >
      {status.installed ? (
        <div className={styles.installed}>
          <Alert
            message="FFmpeg 已安装"
            description="视频处理功能已就绪"
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
          />
          
          {status.version && (
            <Descriptions size="small" bordered className={styles.details}>
              <Descriptions.Item label="版本" span={3}>
                <Text code>{status.version}</Text>
              </Descriptions.Item>
            </Descriptions>
          )}

          <div className={styles.features}>
            <Title level={5}>可用功能</Title>
            <Space wrap>
              <Tag color="green">视频剪辑</Tag>
              <Tag color="green">格式转换</Tag>
              <Tag color="green">提取关键帧</Tag>
              <Tag color="green">生成缩略图</Tag>
              <Tag color="green">添加字幕</Tag>
              <Tag color="green">转场效果</Tag>
              <Tag color="green">音量调节</Tag>
            </Space>
          </div>
        </div>
      ) : (
        <div className={styles.notInstalled}>
          <Alert
            message="FFmpeg 未安装"
            description="视频处理功能需要 FFmpeg，请安装后刷新"
            type="error"
            showIcon
            icon={<CloseCircleOutlined />}
          />

          <div className={styles.installGuide}>
            <Title level={5}>安装指南</Title>
            
            <div className={styles.installMethod}>
              <Text strong>方法 1：使用包管理器（推荐）</Text>
              <div className={styles.codeBlock}>
                <code>{getInstallCommand()}</code>
              </div>
            </div>

            <div className={styles.installMethod}>
              <Text strong>方法 2：手动下载</Text>
              <Paragraph>
                访问 FFmpeg 官网下载对应系统的安装包：
                <br />
                <a href={getInstallGuideUrl()} target="_blank" rel="noopener noreferrer">
                  <DownloadOutlined /> 下载 FFmpeg
                </a>
              </Paragraph>
            </div>

            <div className={styles.installMethod}>
              <Text strong>安装后</Text>
              <Paragraph>
                安装完成后，请确保 FFmpeg 已添加到系统 PATH，然后点击上方"刷新"按钮。
              </Paragraph>
            </div>
          </div>

          <Alert
            message="为什么需要 FFmpeg？"
            description="FFmpeg 是业界标准的音视频处理工具，提供视频剪辑、转码、合并、添加特效等功能。"
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
          />
        </div>
      )}
    </Card>
  );
};

export default FFmpegStatusCard;
