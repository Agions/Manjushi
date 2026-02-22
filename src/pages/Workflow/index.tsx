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
  ExportOutlined
} from '@ant-design/icons';
import styles from './index.module.less';

const { Title, Text, Paragraph } = Typography;

// 10步工作流配置
const WORKFLOW_STEPS = [
  { 
    key: 'novel-upload', 
    title: '上传小说', 
    icon: <UploadOutlined />,
    color: '#6366f1',
    description: '上传 TXT/EPUB/PDF 文件'
  },
  { 
    key: 'novel-parse', 
    title: '智能解析', 
    icon: <FileTextOutlined />,
    color: '#8b5cf6',
    description: 'AI 提取角色和章节'
  },
  { 
    key: 'script-generate', 
    title: '剧本生成', 
    icon: <PlayCircleOutlined />,
    color: '#ec4899',
    description: '生成场景化剧本'
  },
  { 
    key: 'storyboard-generate', 
    title: '智能分镜', 
    icon: <PictureOutlined />,
    color: '#f59e0b',
    description: 'AI 生成分镜面板'
  },
  { 
    key: 'character-design', 
    title: '角色设计', 
    icon: <Avatar />,
    color: '#10b981',
    description: '设计角色形象'
  },
  { 
    key: 'scene-render', 
    title: '场景渲染', 
    icon: <PictureOutlined />,
    color: '#14b8a6',
    description: 'AI 渲染漫画场景'
  },
  { 
    key: 'animation', 
    title: '动态合成', 
    icon: <PlayCircleOutlined />,
    color: '#3b82f6',
    description: '镜头运动和转场'
  },
  { 
    key: 'voiceover', 
    title: '配音配乐', 
    icon: <AudioOutlined />,
    color: '#f97316',
    description: 'TTS 语音和 BGM'
  },
  { 
    key: 'lip-sync', 
    title: '对口型', 
    icon: <AudioOutlined />,
    color: '#ef4444',
    description: 'Wav2Lip 口型同步'
  },
  { 
    key: 'export', 
    title: '导出发布', 
    icon: <ExportOutlined />,
    color: '#6366f1',
    description: '生成成品视频'
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
  const [currentStep, setCurrentStep] = useState(0);
  const [projectName, setProjectName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [chapters, setChapters] = useState(5);

  const handleStart = () => {
    console.log('开始工作流:', { projectName, selectedTemplate, selectedModel, chapters });
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
            10 步智能工作流，将小说转化为精彩漫剧
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
              <Text type="</Text>
             secondary">项目名称 <Text strong>{projectName || '未设置'}</Text>
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
