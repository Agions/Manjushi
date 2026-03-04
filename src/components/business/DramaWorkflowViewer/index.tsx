/**
 * 漫剧工作流可视化组件
 * 展示 10 步工作流进度和状态
 */

import React, { useState } from 'react';
import { 
  Steps, 
  Card, 
  Button, 
  Progress, 
  Space, 
  Tag, 
  Timeline,
  Typography,
  Collapse,
  Badge,
  Tooltip,
  Divider
} from 'antd';
import { 
  CheckCircleOutlined, 
  LoadingOutlined, 
  ClockCircleOutlined,
  CloseCircleOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  UploadOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  PictureOutlined,
  UserOutlined,
  ScissorOutlined,
  VideoCameraOutlined,
  SoundOutlined,
  AudioOutlined,
  ExportOutlined,
  CloudUploadOutlined,
  SyncOutlined
} from '@ant-design/icons';
import type { DramaWorkflowStep } from '@/core/services/enhanced-drama-workflow.service';
import styles from './DramaWorkflowViewer.module.less';

const { Text, Title, Paragraph } = Typography;

// 步骤配置
const STEP_CONFIG: Record<DramaWorkflowStep, {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}> = {
  'novel-upload': {
    title: '上传小说',
    description: '上传 TXT/EPUB/PDF 小说文件',
    icon: <UploadOutlined />,
    color: '#1890ff'
  },
  'novel-parse': {
    title: '智能解析',
    description: 'AI 提取角色、章节、结构',
    icon: <FileSearchOutlined />,
    color: '#52c41a'
  },
  'script-generate': {
    title: '剧本生成',
    description: '生成场景化剧本',
    icon: <FileTextOutlined />,
    color: '#722ed1'
  },
  'storyboard-generate': {
    title: '智能分镜',
    description: 'AI 生成故事板面板',
    icon: <PictureOutlined />,
    color: '#eb2f96'
  },
  'character-design': {
    title: '角色设计',
    description: '设计角色形象',
    icon: <UserOutlined />,
    color: '#faad14'
  },
  'scene-render': {
    title: '场景渲染',
    description: 'AI 渲染漫画场景',
    icon: <VideoCameraOutlined />,
    color: '#fa541c'
  },
  'animation': {
    title: '动态合成',
    description: '镜头运动、转场效果',
    icon: <ScissorOutlined />,
    color: '#13c2c2'
  },
  'voiceover': {
    title: '配音配乐',
    description: 'TTS 语音、BGM、音效',
    icon: <SoundOutlined />,
    color: '#2f54eb'
  },
  'lip-sync': {
    title: '对口型',
    description: 'Wav2Lip 口型同步',
    icon: <AudioOutlined />,
    color: '#a0d911'
  },
  'export': {
    title: '导出发布',
    description: '生成成品视频',
    icon: <ExportOutlined />,
    color: '#f5222d'
  }
};

export interface StepStatus {
  step: DramaWorkflowStep;
  status: 'pending' | 'running' | 'completed' | 'error' | 'paused';
  progress: number;
  message?: string;
  duration?: number;
  data?: any;
}

export interface DramaWorkflowViewerProps {
  currentStep: DramaWorkflowStep;
  progress: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error';
  stepStatuses?: StepStatus[];
  onStepClick?: (step: DramaWorkflowStep) => void;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
}

const DramaWorkflowViewer: React.FC<DramaWorkflowViewerProps> = ({
  currentStep,
  progress,
  status,
  stepStatuses = [],
  onStepClick,
  onPause,
  onResume,
  onCancel,
  onRetry
}) => {
  const [activeKey, setActiveKey] = useState<string[]>(['details']);

  // 获取当前步骤索引
  const stepOrder: DramaWorkflowStep[] = [
    'novel-upload', 'novel-parse', 'script-generate', 'storyboard-generate',
    'character-design', 'scene-render', 'animation', 'voiceover', 'lip-sync', 'export'
  ];
  
  const currentIndex = stepOrder.indexOf(currentStep);

  // 获取步骤状态
  const getStepStatus = (step: DramaWorkflowStep): StepStatus['status'] => {
    const stepStatus = stepStatuses.find(s => s.step === step);
    if (stepStatus) return stepStatus.status;
    
    const idx = stepOrder.indexOf(step);
    if (idx < currentIndex) return 'completed';
    if (idx === currentIndex) return status === 'running' ? 'running' : status === 'paused' ? 'paused' : 'pending';
    return 'pending';
  };

  // 获取状态图标
  const getStatusIcon = (stepStatus: StepStatus['status']) => {
    switch (stepStatus) {
      case 'completed': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'running': return <LoadingOutlined spin style={{ color: '#1890ff' }} />;
      case 'error': return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'paused': return <PauseCircleOutlined style={{ color: '#faad14' }} />;
      default: return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  // 获取当前步骤详情
  const currentStepConfig = STEP_CONFIG[currentStep];
  const currentStepStatus = stepStatuses.find(s => s.step === currentStep);

  return (
    <div className={styles.container}>
      {/* 顶部进度条 */}
      <Card className={styles.progressCard}>
        <div className={styles.progressHeader}>
          <div className={styles.progressInfo}>
            <Title level={4} className={styles.title}>
              {currentStepConfig?.title || '工作流'}
            </Title>
            <Text type="secondary">{currentStepConfig?.description}</Text>
          </div>
          <div className={styles.progressStats}>
            <Badge 
              status={status === 'completed' ? 'success' : status === 'running' ? 'processing' : status === 'error' ? 'error' : 'default'} 
              text={status === 'completed' ? '已完成' : status === 'running' ? '进行中' : status === 'paused' ? '已暂停' : status === 'error' ? '出错' : '未开始'}
            />
            <Text className={styles.progressText}>{progress}%</Text>
          </div>
        </div>
        <Progress 
          percent={progress} 
          status={status === 'error' ? 'exception' : status === 'completed' ? 'success' : 'active'}
          strokeColor={currentStepConfig?.color}
          showInfo={false}
        />
        
        {/* 操作按钮 */}
        <div className={styles.actions}>
          <Space>
            {status === 'running' && (
              <Button icon={<PauseCircleOutlined />} onClick={onPause}>
                暂停
              </Button>
            )}
            {status === 'paused' && (
              <Button type="primary" icon={<PlayCircleOutlined />} onClick={onResume}>
                继续
              </Button>
            )}
            {status === 'error' && (
              <Button type="primary" icon={<SyncOutlined />} onClick={onRetry}>
                重试
              </Button>
            )}
            {(status === 'running' || status === 'paused') && (
              <Button danger icon={<CloseCircleOutlined />} onClick={onCancel}>
                取消
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* 步骤导航 */}
      <Card className={styles.stepsCard}>
        <Steps 
          current={currentIndex}
          status={status === 'error' ? 'error' : status === 'completed' ? 'finish' : 'process'}
          size="small"
          className={styles.steps}
        >
          {stepOrder.map((step, idx) => {
            const config = STEP_CONFIG[step];
            const stepStatus = getStepStatus(step);
            
            return (
              <Steps.Step
                key={step}
                title={
                  <Tooltip title={config.description}>
                    <span className={styles.stepTitle}>{config.title}</span>
                  </Tooltip>
                }
                icon={getStatusIcon(stepStatus)}
                description=""
                onClick={() => onStepClick?.(step)}
                className={styles.stepItem}
              />
            );
          })}
        </Steps>
      </Card>

      {/* 步骤详情 */}
      <Collapse 
        activeKey={activeKey} 
        onChange={(keys) => setActiveKey(keys as string[])}
        className={styles.detailsCollapse}
      >
        <Collapse.Panel key="details" header="步骤详情">
          <Timeline className={styles.timeline}>
            {stepOrder.map((step, idx) => {
              const config = STEP_CONFIG[step];
              const stepStatus = getStepStatus(step);
              const statusData = stepStatuses.find(s => s.step === step);
              
              return (
                <Timeline.Item
                  key={step}
                  dot={getStatusIcon(stepStatus)}
                  color={stepStatus === 'completed' ? 'green' : stepStatus === 'error' ? 'red' : stepStatus === 'running' ? 'blue' : 'gray'}
                >
                  <div className={`${styles.timelineItem} ${idx === currentIndex ? styles.active : ''}`}>
                    <div className={styles.timelineHeader}>
                      <Tag color={config.color}>{config.title}</Tag>
                      {stepStatus === 'running' && (
                        <Tag color="blue">进行中</Tag>
                      )}
                      {stepStatus === 'completed' && (
                        <Tag color="green">已完成</Tag>
                      )}
                      {stepStatus === 'error' && (
                        <Tag color="red">出错</Tag>
                      )}
                      {stepStatus === 'paused' && (
                        <Tag color="orange">已暂停</Tag>
                      )}
                    </div>
                    <Text type="secondary" className={styles.timelineDesc}>
                      {config.description}
                    </Text>
                    {statusData?.message && (
                      <div className={styles.timelineMessage}>
                        <Text type="warning">{statusData.message}</Text>
                      </div>
                    )}
                    {statusData?.duration && (
                      <div className={styles.timelineDuration}>
                        <Text type="secondary">耗时: {(statusData.duration / 1000).toFixed(1)}s</Text>
                      </div>
                    )}
                  </div>
                </Timeline.Item>
              );
            })}
          </Timeline>
        </Collapse.Panel>
      </Collapse>

      {/* 快捷操作 */}
      <Card className={styles.quickActions} size="small">
        <Space split={<Divider type="vertical" />}>
          <Button size="small" type="text" icon={<UploadOutlined />}>
            上传
          </Button>
          <Button size="small" type="text" icon={<FileSearchOutlined />}>
            解析
          </Button>
          <Button size="small" type="text" icon={<FileTextOutlined />}>
            剧本
          </Button>
          <Button size="small" type="text" icon={<PictureOutlined />}>
            分镜
          </Button>
          <Button size="small" type="text" icon={<UserOutlined />}>
            角色
          </Button>
          <Button size="small" type="text" icon={<ExportOutlined />}>
            导出
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default DramaWorkflowViewer;
export type { DramaWorkflowStep };
