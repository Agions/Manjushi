/**
 * 专业工作流创建页面
 */

import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  Steps, 
  Typography, 
  Space, 
  Upload,
  Select,
  Input,
  Slider,
  Divider,
  Tag,
  List,
  Avatar,
  Progress,
  Radio,
  Alert
} from 'antd';
import { 
  UploadOutlined, 
  FileTextOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  RightOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  PictureOutlined,
  AudioOutlined,
  ExportOutlined,
  EditOutlined,
  BookOutlined,
  FileSearchOutlined,
  UnorderedListOutlined,
  ExpandOutlined
} from '@ant-design/icons';

import { WORKFLOW_CONFIGS } from '@/core/config/workflow-config';
import { dramaWorkflowService } from '@/core/services';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import styles from './index.module.less';

const { Title, Text, Paragraph } = Typography;

// 初始化配置值
const getDefaultConfig = () => ({
  import: {
    importType: 'novel',
    fileEncoding: 'auto',
    parseChapter: true,
    extractCharacters: true
  },
  generate: {
    model: 'gpt-4',
    episodes: 12,
    episodesPerChapter: 2,
    scriptStyle: 'comic',
    dialogueDetail: 3,
    autoReview: true
  },
  storyboard: {
    aspectRatio: '9:16',
    resolution: '1080p',
    framesPerScene: 3,
    transitionStyle: 'auto',
    cameraMovement: true,
    addPanz: true
  },
  character: {
    style: 'anime',
    consistency: true,
    expressionVariation: 6,
    poseVariation: 4,
    clothingVariation: true,
    voiceMatch: true
  },
  render: {
    engine: 'fast',
    backgroundStyle: 'ai-generated',
    lighting: 'auto',
    colorGrade: 'auto',
    renderQuality: 80
  },
  animate: {
    animationType: 'auto',
    fps: '30',
    transitionEffect: 'fade',
    addEffects: true,
    addParticles: false
  },
  export: {
    format: 'mp4',
    quality: 'medium',
    addSubtitles: true,
    subtitleStyle: 'modern',
    addWatermark: false,
    exportThumbnails: true,
    splitEpisodes: true
  }
});

// 7步工作流配置 (优化后)
const WORKFLOW_STEPS = [
  { 
    key: 'import', 
    title: '📥 导入', 
    icon: <UploadOutlined />,
    color: '#6366f1',
    description: '上传小说/漫画素材'
  },
  { 
    key: 'generate', 
    title: '🤖 生成', 
    icon: <ThunderboltOutlined />,
    color: '#8b5cf6',
    description: 'AI 智能生成内容'
  },
  { 
    key: 'storyboard', 
    title: '🎬 分镜', 
    icon: <PictureOutlined />,
    color: '#ec4899',
    description: 'AI 智能分镜设计'
  },
  { 
    key: 'character', 
    title: '👤 角色', 
    icon: <FileTextOutlined />,
    color: '#f59e0b',
    description: '角色形象设计'
  },
  { 
    key: 'render', 
    title: '🎨 渲染', 
    icon: <PlayCircleOutlined />,
    color: '#10b981',
    description: '场景与角色渲染'
  },
  { 
    key: 'animate', 
    title: '✨ 合成', 
    icon: <SettingOutlined />,
    color: '#06b6d4',
    description: '动态合成与转场'
  },
  { 
    key: 'export', 
    title: '📤 导出', 
    icon: <ExportOutlined />,
    color: '#f97316',
    description: '导出视频/合集'
  },
];

// 模板选项
const TEMPLATES = [
  { id: 'romance', name: '浪漫爱情', icon: '💕', color: '#ec4899' },
  { id: 'action', name: '动作冒险', icon: '⚔️', color: '#ef4444' },
  { id: 'fantasy', name: '奇幻玄幻', icon: '🧙', color: '#8b5cf6' },
  { id: 'comedy', name: '喜剧搞笑', icon: '😂', color: '#f59e0b' },
  { id: 'mystery', name: '悬疑推理', icon: '🔍', color: '#64748b' },
];

// 模型选项
const MODELS = [
  { value: 'gpt-4', label: 'GPT-4' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'claude-3', label: 'Claude 3' },
  { value: 'ernie-4', label: 'ERNIE 4.0' },
  { value: 'qwen-max', label: 'Qwen Max' },
];

const WorkflowPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [projectName, setProjectName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [chapters, setChapters] = useState(5);
  
  // 导入相关状态
  const [importType, setImportType] = useState<'novel' | 'script' | 'prompt'>('novel');
  const [episodes, setEpisodes] = useState(12);
  const [novelContent, setNovelContent] = useState('');
  const [promptContent, setPromptContent] = useState('');
  
  // 工作流详细配置
  const [workflowConfig, setWorkflowConfig] = useState(getDefaultConfig());
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 更新配置
  const updateConfig = (step: string, key: string, value: any) => {
    setWorkflowConfig(prev => ({
      ...prev,
      [step]: {
        ...prev[step as keyof typeof prev],
        [key]: value
      }
    }));
  };

  // 导入类型配置
  const IMPORT_TYPES = [
    { 
      key: 'novel', 
      title: '📚 小说导入', 
      icon: <BookOutlined />,
      color: '#6366f1',
      description: '上传 TXT/EPUB/PDF 小说文件',
      accept: '.txt,.epub,.pdf'
    },
    { 
      key: 'script', 
      title: '📝 剧本导入', 
      icon: <FileTextOutlined />,
      color: '#8b5cf6',
      description: '导入已有剧本文件',
      accept: '.json,.txt'
    },
    { 
      key: 'prompt', 
      title: '✨ AI 生成', 
      icon: <ThunderboltOutlined />,
      color: '#ec4899',
      description: '输入提示词 AI 生成剧本',
      accept: ''
    },
  ];

  const handleStart = async () => {
    // 生成项目ID
    const projectId = uuidv4();
    
    // 获取内容（小说内容或提示词）
    const content = importType === 'novel' || importType === 'script' 
      ? novelContent 
      : promptContent;
    
    // 构建工作流配置
    const config = {
      autoParse: true,
      autoGenerateScript: true,
      autoGenerateStoryboard: true,
      chaptersToUse: chapters,
      scenesPerChapter: workflowConfig.generate.episodesPerChapter || 2,
      panelsPerScene: workflowConfig.storyboard.framesPerScene || 3,
      provider: 'openai',
      model: selectedModel
    };
    
    try {
      // 调用工作流服务
      await dramaWorkflowService.start(projectId, content, config);
      
      // 跳转到项目页
      navigate(`/project/${projectId}`);
    } catch (error) {
      console.error('工作流启动失败:', error);
    }
  };

  return (
    <div className={styles.workflow}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Title level={2} className={styles.title}>
            创建新漫剧项目
          </Title>
          <Text type="secondary" className={styles.desc}>
            7 步智能工作流，小说/剧本/提示词 → 精彩漫剧
          </Text>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.main}>
          {/* 项目设置 */}
          <Card className={styles.configCard}>
            <Title level={4}>📝 项目设置</Title>
            
            <div className={styles.formGroup}>
              <Text strong>项目名称</Text>
              <Input 
                placeholder="输入项目名称" 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                size="large"
                className={styles.input}
              />
            </div>

            {/* 导入方式选择 */}
            <div className={styles.formGroup}>
              <Text strong>📥 导入方式</Text>
              <div className={styles.templateGrid}>
                {IMPORT_TYPES.map((type) => (
                  <div 
                    key={type.key}
                    className={`${styles.templateItem} ${importType === type.key ? styles.selected : ''}`}
                    onClick={() => setImportType(type.key as any)}
                    style={{ '--template-color': type.color } as React.CSSProperties}
                  >
                    <span className={styles.templateIcon}>{type.icon}</span>
                    <span className={styles.templateName}>{type.title}</span>
                    <span className={styles.templateDesc}>{type.description}</span>
                    {importType === type.key && (
                      <CheckCircleOutlined className={styles.checkIcon} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 导入内容区域 */}
            {importType === 'novel' && (
              <div className={styles.formGroup}>
                <Text strong>📄 上传小说</Text>
                <Upload.Dragger
                  accept=".txt,.epub,.pdf"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setNovelContent(e.target?.result as string || '');
                    };
                    reader.readAsText(file);
                    return false;
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <BookOutlined />
                  </p>
                  <p className="ant-upload-text">点击或拖拽小说文件到此处</p>
                  <p className="ant-upload-hint">支持 TXT/EPUB/PDF 格式</p>
                </Upload.Dragger>
                {novelContent && (
                  <Tag color="green" style={{ marginTop: 8 }}>
                    ✓ 已加载 {novelContent.substring(0, 50)}...
                  </Tag>
                )}
              </div>
            )}

            {importType === 'script' && (
              <div className={styles.formGroup}>
                <Text strong>📝 上传剧本</Text>
                <Upload.Dragger
                  accept=".json,.txt"
                  showUploadList={false}
                  beforeUpload={(file) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      try {
                        const content = e.target?.result as string;
                        JSON.parse(content); // 验证 JSON
                        setNovelContent(content);
                      } catch {
                        setNovelContent(content);
                      }
                    };
                    reader.readAsText(file);
                    return false;
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <FileTextOutlined />
                  </p>
                  <p className="ant-upload-text">点击或拖拽剧本文件到此处</p>
                  <p className="ant-upload-hint">支持 JSON/TXT 格式</p>
                </Upload.Dragger>
              </div>
            )}

            {importType === 'prompt' && (
              <div className={styles.formGroup}>
                <Text strong>✨ 输入提示词</Text>
                <Input.TextArea
                  placeholder="描述你想要生成的剧本内容...
例如：一部关于都市爱情的漫画，主角是一位年轻的画家..."
                  value={promptContent}
                  onChange={(e) => setPromptContent(e.target.value)}
                  rows={4}
                  className={styles.input}
                />
                <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                  AI 将根据你的提示词生成完整的剧本内容
                </Text>
              </div>
            )}

            {/* 集数设置 */}
            <div className={styles.formGroup}>
              <Text strong>📺 剧集总数: {episodes} 集</Text>
              <Slider 
                min={1} 
                max={200} 
                value={episodes}
                onChange={setEpisodes}
                marks={{ 1: '1', 50: '50', 100: '100', 150: '150', 200: '200' }}
              />
              <Text type="secondary}>
                AI 将根据导入内容生成 {episodes} 集剧本
              </Text>
            </div>

            <Divider />

            <div className={styles.formGroup}>
              <Text strong>选择类型</Text>
              <div className={styles.templateGrid}>
                {TEMPLATES.map((template) => (
                  <div 
                    key={template.id}
                    className={`${styles.templateItem} ${selectedTemplate === template.id ? styles.selected : ''}`}
                    onClick={() => setSelectedTemplate(template.id)}
                    style={{ '--template-color': template.color } as React.CSSProperties}
                  >
                    <span className={styles.templateIcon}>{template.icon}</span>
                    <span className={styles.templateName}>{template.name}</span>
                    {selectedTemplate === template.id && (
                      <CheckCircleOutlined className={styles.checkIcon} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <Text strong>AI 模型</Text>
              <Select
                value={selectedModel}
                onChange={setSelectedModel}
                options={MODELS}
                size="large"
                className={styles.select}
              />
            </div>

            <div className={styles.formGroup}>
              <Text strong>生成章节数: {chapters}</Text>
              <Slider 
                min={1} 
                max={20} 
                value={chapters}
                onChange={setChapters}
              />
            </div>
          </Card>

          {/* 工作流预览 */}
          <Card className={styles.previewCard}>
            <Title level={4}>🔄 工作流预览</Title>
            
            <Steps 
              direction="vertical"
              current={currentStep}
              className={styles.previewSteps}
              items={WORKFLOW_STEPS.map((step, idx) => ({
                title: (
                  <div className={`${styles.stepItem} ${idx <= currentStep ? styles.completed : ''}`}>
                    <span className={styles.stepIcon} style={{ color: step.color }}>
                      {step.icon}
                    </span>
                    <div className={styles.stepInfo}>
                      <span className={styles.stepTitle}>{step.title}</span>
                      <span className={styles.stepDesc}>{step.description}</span>
                    </div>
                  </div>
                ),
                description: '',
                status: idx < currentStep ? 'finish' : idx === currentStep ? 'process' : 'wait'
              }))}
            />
          </Card>
        </div>

        {/* 侧边栏 */}
        <div className={styles.sidebar}>
          <Card className={styles.summaryCard}>
            <Title level={5}>📋 创建摘要</Title>
            
            <div className={styles.summaryItem}>
              <Text type="secondary">项目名称</Text> <Text strong>{projectName || '未设置'}</Text>
            </div>
            
            <div className={styles.summaryItem}>
              <Text type="secondary">漫剧类型</Text>
              <Tag color="blue">
                {TEMPLATES.find(t => t.id === selectedTemplate)?.name || '未选择'}
              </Tag>
            </div>
            
            <div className={styles.summaryItem}>
              <Text type="secondary">AI 模型</Text>
              <Tag color="purple">{selectedModel}</Tag>
            </div>
            
            <div className={styles.summaryItem}>
              <Text type="secondary">章节数</Text>
              <Tag color="green">{chapters}</Tag>
            </div>

            <Divider />

            <div className={styles.price}>
              <Text type="secondary">预估消耗</Text>
              <Title level={4} className={styles.priceValue}>
                ~{chapters * 0.5}
                <Text type="secondary" className={styles.priceUnit}> 元</Text>
              </Title>
              <Text type="secondary" className={styles.priceNote}>
                实际消耗根据内容长度计算
              </Text>
            </div>

            <Button 
              type="primary" 
              size="large" 
              block
              icon={<ThunderboltOutlined />}
              className={styles.startBtn}
              disabled={!projectName || !selectedTemplate}
              onClick={handleStart}
            >
              开始创建
            </Button>
          </Card>

          {/* 提示 */}
          <Alert
            type="info"
            showIcon
            icon={<SettingOutlined />}
            message="支持断点续传"
            description="工作流支持中断继续，无需担心任务中断"
            className={styles.tipAlert}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkflowPage;
