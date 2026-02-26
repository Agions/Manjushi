import React, { useState, useCallback, useEffect } from 'react';
import {
  Card, Button, Input, Select, Slider, Space, Typography,
  Radio, Upload, Progress, List, Tag, message, Image, Spin,
  Tabs, Row, Col, Empty, Tooltip, Badge, Modal
} from 'antd';
import {
  PictureOutlined, VideoCameraOutlined, LoadingOutlined,
  DownloadOutlined, DeleteOutlined, ReloadOutlined, PlusOutlined,
  EyeOutlined, SettingOutlined, ClockCircleOutlined, CheckCircleOutlined,
  CloseCircleOutlined, FileImageOutlined, PlayCircleOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  generationService,
  IMAGE_STYLES,
  VIDEO_STYLES,
  GenerationTask,
  ImageGenerationOptions,
  VideoGenerationOptions,
  GenerationProvider,
} from '@/core/services/generation.service';
import styles from './index.module.less';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

// 提供商配置
const PROVIDER_CONFIG: { 
  key: GenerationProvider; 
  name: string; 
  type: 'image' | 'video' | 'both';
  desc: string;
}[] = [
  { key: 'bytedance-seedream', name: '字节 Seedream', type: 'image', desc: '高质量图像生成' },
  { key: 'bytedance-seedance', name: '字节 Seedance', type: 'video', desc: '高质量视频生成' },
  { key: 'kling', name: '快手可灵', type: 'both', desc: '图像+视频生成' },
  { key: 'vidu', name: '生数 Vidu', type: 'video', desc: '视频生成' },
];

// 尺寸预设
const SIZE_PRESETS = [
  { label: '1:1 方形', value: '1:1', width: 1024, height: 1024 },
  { label: '16:9 宽屏', value: '16:9', width: 1920, height: 1080 },
  { label: '9:16 竖屏', value: '9:16', width: 1080, height: 1920 },
  { label: '4:3 标准', value: '4:3', width: 1440, height: 1080 },
  { label: '3:4 竖版', value: '3:4', width: 1080, height: 1440 },
];

const AIImageGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<GenerationProvider>('bytedance-seedream');
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [numImages, setNumImages] = useState(1);
  const [duration, setDuration] = useState<5 | 10>(5);
  const [motionStrength, setMotionStrength] = useState(0.5);
  const [referenceImage, setReferenceImage] = useState<UploadFile | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tasks, setTasks] = useState<GenerationTask[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);

  // 刷新任务列表
  const refreshTasks = useCallback(() => {
    setTasks(generationService.getAllTasks());
  }, []);

  // 定时刷新
  useEffect(() => {
    refreshTasks();
    const interval = setInterval(refreshTasks, 3000);
    return () => clearInterval(interval);
  }, [refreshTasks]);

  // 获取当前可用的提供商
  const getAvailableProviders = (type: 'image' | 'video') => {
    return PROVIDER_CONFIG.filter(
      p => p.type === type || p.type === 'both'
    );
  };

  // 切换标签时更新默认提供商
  useEffect(() => {
    const providers = getAvailableProviders(activeTab);
    if (providers.length > 0 && !providers.find(p => p.key === selectedProvider)) {
      setSelectedProvider(providers[0].key);
    }
  }, [activeTab, selectedProvider]);

  // 生成图像
  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      message.warning('请输入描述词');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const size = SIZE_PRESETS.find(s => s.value === aspectRatio);
      const options: ImageGenerationOptions = {
        prompt: prompt.trim(),
        negativePrompt: negativePrompt.trim() || undefined,
        width: size?.width || 1024,
        height: size?.height || 1024,
        aspectRatio: aspectRatio as any,
        style: selectedStyle,
        numImages,
      };

      const result = await generationService.generateImage(
        options,
        { provider: selectedProvider, apiKey: 'mock-api-key' }, // TODO: 从设置获取 API Key
        (p) => setProgress(p)
      );

      if (result.status === 'completed') {
        message.success('图像生成完成');
        if (result.url) {
          setPreviewImage(result.url);
        }
      } else {
        message.error(result.error || '生成失败');
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : '生成失败');
    } finally {
      setIsGenerating(false);
      setProgress(0);
      refreshTasks();
    }
  };

  // 生成视频
  const handleGenerateVideo = async () => {
    if (!prompt.trim()) {
      message.warning('请输入描述词');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const options: VideoGenerationOptions = {
        prompt: prompt.trim(),
        negativePrompt: negativePrompt.trim() || undefined,
        imageUrl: referenceImage?.url,
        duration,
        aspectRatio: aspectRatio as any,
        motionStrength,
      };

      const result = await generationService.generateVideo(
        options,
        { provider: selectedProvider, apiKey: 'mock-api-key' }, // TODO: 从设置获取 API Key
        (p) => setProgress(p)
      );

      if (result.status === 'completed') {
        message.success('视频生成完成');
        if (result.url) {
          setPreviewVideo(result.url);
        }
      } else {
        message.error(result.error || '生成失败');
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : '生成失败');
    } finally {
      setIsGenerating(false);
      setProgress(0);
      refreshTasks();
    }
  };

  // 取消任务
  const handleCancelTask = (taskId: string) => {
    generationService.cancelTask(taskId);
    message.info('已取消任务');
    refreshTasks();
  };

  // 删除任务
  const handleDeleteTask = (taskId: string) => {
    generationService.deleteTask(taskId);
    message.success('已删除任务');
    refreshTasks();
  };

  // 下载结果
  const handleDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 获取状态图标
  const getStatusIcon = (status: GenerationTask['status']) => {
    switch (status) {
      case 'pending':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'processing':
        return <LoadingOutlined spin style={{ color: '#1890ff' }} />;
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    }
  };

  // 获取状态文字
  const getStatusText = (status: GenerationTask['status']) => {
    switch (status) {
      case 'pending':
        return '等待中';
      case 'processing':
        return '生成中';
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
    }
  };

  const currentProviders = getAvailableProviders(activeTab);
  const styleOptions = activeTab === 'image' ? IMAGE_STYLES : VIDEO_STYLES;

  return (
    <div className={styles.container}>
      <Card className={styles.generatorCard}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'image' | 'video')}
          className={styles.tabs}
        >
          <TabPane
            tab={
              <span>
                <PictureOutlined />
                图像生成
              </span>
            }
            key="image"
          />
          <TabPane
            tab={
              <span>
                <VideoCameraOutlined />
                视频生成
              </span>
            }
            key="video"
          />
        </Tabs>

        <div className={styles.formSection}>
          {/* 提供商选择 */}
          <div className={styles.formItem}>
            <Text strong>选择模型</Text>
            <Radio.Group
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              buttonStyle="solid"
            >
              {currentProviders.map((provider) => (
                <Radio.Button key={provider.key} value={provider.key}>
                  <Tooltip title={provider.desc}>
                    <span>{provider.name}</span>
                  </Tooltip>
                </Radio.Button>
              ))}
            </Radio.Group>
          </div>

          {/* 提示词输入 */}
          <div className={styles.formItem}>
            <Text strong>描述词</Text>
            <TextArea
              placeholder={`描述你想要的${activeTab === 'image' ? '图像' : '视频'}内容...`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              maxLength={1000}
              showCount
            />
          </div>

          {/* 反向提示词 */}
          <div className={styles.formItem}>
            <Text strong>反向提示词（可选）</Text>
            <TextArea
              placeholder="描述你不想要的内容..."
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              rows={2}
              maxLength={500}
              showCount
            />
          </div>

          {/* 风格选择 */}
          <div className={styles.formItem}>
            <Text strong>风格</Text>
            <Select
              value={selectedStyle}
              onChange={setSelectedStyle}
              style={{ width: '100%' }}
            >
              {styleOptions.map((style) => (
                <Option key={style.id} value={style.id}>
                  <Space>
                    <span>{style.name}</span>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {style.desc}
                    </Text>
                  </Space>
                </Option>
              ))}
            </Select>
          </div>

          {/* 尺寸/比例 */}
          <div className={styles.formItem}>
            <Text strong>比例</Text>
            <Radio.Group
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              buttonStyle="solid"
            >
              {SIZE_PRESETS.map((size) => (
                <Radio.Button key={size.value} value={size.value}>
                  {size.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </div>

          {/* 图像特有：数量 */}
          {activeTab === 'image' && (
            <div className={styles.formItem}>
              <div className={styles.sliderHeader}>
                <Text strong>生成数量</Text>
                <Text>{numImages} 张</Text>
              </div>
              <Slider
                value={numImages}
                onChange={setNumImages}
                min={1}
                max={4}
                step={1}
                marks={{ 1: '1', 2: '2', 3: '3', 4: '4' }}
              />
            </div>
          )}

          {/* 视频特有：时长 */}
          {activeTab === 'video' && (
            <>
              <div className={styles.formItem}>
                <Text strong>时长</Text>
                <Radio.Group
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value={5}>5 秒</Radio.Button>
                  <Radio.Button value={10}>10 秒</Radio.Button>
                </Radio.Group>
              </div>

              <div className={styles.formItem}>
                <div className={styles.sliderHeader}>
                  <Text strong>运动幅度</Text>
                  <Text>{Math.round(motionStrength * 100)}%</Text>
                </div>
                <Slider
                  value={motionStrength}
                  onChange={setMotionStrength}
                  min={0}
                  max={1}
                  step={0.1}
                />
              </div>

              {/* 参考图上传 */}
              <div className={styles.formItem}>
                <Text strong>参考图（可选）</Text>
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  fileList={referenceImage ? [referenceImage] : []}
                  onChange={({ fileList }) => {
                    setReferenceImage(fileList[0] || null);
                  }}
                  beforeUpload={() => false}
                >
                  {!referenceImage && (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>上传</div>
                    </div>
                  )}
                </Upload>
              </div>
            </>
          )}

          {/* 生成按钮 */}
          <Button
            type="primary"
            size="large"
            icon={activeTab === 'image' ? <PictureOutlined /> : <VideoCameraOutlined />}
            onClick={activeTab === 'image' ? handleGenerateImage : handleGenerateVideo}
            loading={isGenerating}
            disabled={!prompt.trim() || isGenerating}
            block
          >
            {isGenerating ? '生成中...' : `生成${activeTab === 'image' ? '图像' : '视频'}`}
          </Button>

          {/* 进度条 */}
          {isGenerating && (
            <div className={styles.progressSection}>
              <Progress percent={progress} status="active" />
              <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
                {progress < 30 && '提交任务...'}
                {progress >= 30 && progress < 90 && 'AI 生成中，请稍候...'}
                {progress >= 90 && '即将完成...'}
              </Text>
            </div>
          )}
        </div>
      </Card>

      {/* 预览区域 */}
      {(previewImage || previewVideo) && (
        <Card className={styles.previewCard} title="生成结果">
          {previewImage && (
            <div className={styles.previewContainer}>
              <Image
                src={previewImage}
                alt="生成的图像"
                style={{ maxWidth: '100%', maxHeight: 400 }}
                preview={{ mask: <EyeOutlined /> }}
              />
              <div className={styles.previewActions}>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(previewImage, `image_${Date.now()}.png`)}
                >
                  下载
                </Button>
                <Button onClick={() => setPreviewImage(null)}>关闭</Button>
              </div>
            </div>
          )}
          {previewVideo && (
            <div className={styles.previewContainer}>
              <video
                src={previewVideo}
                controls
                style={{ maxWidth: '100%', maxHeight: 400 }}
              />
              <div className={styles.previewActions}>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(previewVideo, `video_${Date.now()}.mp4`)}
                >
                  下载
                </Button>
                <Button onClick={() => setPreviewVideo(null)}>关闭</Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* 任务历史 */}
      <Card className={styles.historyCard} title="生成历史">
        {tasks.length === 0 ? (
          <Empty description="暂无生成记录" />
        ) : (
          <List
            dataSource={tasks}
            renderItem={(task) => (
              <List.Item
                actions={[
                  task.status === 'processing' && (
                    <Button
                      key="cancel"
                      size="small"
                      onClick={() => handleCancelTask(task.id)}
                    >
                      取消
                    </Button>
                  ),
                  task.status === 'completed' && task.result?.url && (
                    <Button
                      key="download"
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={() =>
                        handleDownload(
                          task.result!.url!,
                          `${task.type}_${task.id}.${task.type === 'image' ? 'png' : 'mp4'}`
                        )
                      }
                    >
                      下载
                    </Button>
                  ),
                  <Button
                    key="delete"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    删除
                  </Button>,
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={getStatusIcon(task.status)}
                  title={
                    <Space>
                      <Tag>{task.type === 'image' ? '图像' : '视频'}</Tag>
                      <Tag>
                        {PROVIDER_CONFIG.find((p) => p.key === task.provider)?.name}
                      </Tag>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(task.createdAt).toLocaleString()}
                      </Text>
                    </Space>
                  }
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        状态: {getStatusText(task.status)}
                        {task.status === 'processing' && ` (${Math.round(task.progress)}%)`}
                      </Text>
                      {task.error && (
                        <div>
                          <Text type="danger" style={{ fontSize: 12 }}>
                            错误: {task.error}
                          </Text>
                        </div>
                      )}
                      {task.status === 'completed' && task.result && (
                        <div className={styles.taskResult}>
                          {task.type === 'image' && task.result.url && (
                            <Image
                              src={task.result.url}
                              alt="生成结果"
                              width={100}
                              height={100}
                              style={{ objectFit: 'cover' }}
                              preview
                            />
                          )}
                          {task.type === 'video' && task.result.url && (
                            <video
                              src={task.result.url}
                              width={100}
                              height={100}
                              style={{ objectFit: 'cover' }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default AIImageGenerator;
