import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Button, Steps, Form, Input, Select, Space, Typography,
  Progress, List, Tag, Badge, Modal, message, Radio, Slider,
  Collapse, Timeline, Empty, Tooltip, Popconfirm, Divider
} from 'antd';
import {
  PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined,
  PlusOutlined, DeleteOutlined, EyeOutlined, SettingOutlined,
  CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined,
  FileTextOutlined, PictureOutlined, SoundOutlined, VideoCameraOutlined,
  EditOutlined, ExportOutlined, StepForwardOutlined
} from '@ant-design/icons';
import {
  workflowService,
  ComicDramaProject,
  WorkflowStep,
  WorkflowConfig,
  WorkflowEvent,
} from '@/core/services/workflow.service';
import { AI_PROVIDERS } from '@/core/constants';
import styles from './index.module.less';

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

// 步骤图标映射
const STEP_ICONS: Record<string, React.ReactNode> = {
  script: <FileTextOutlined />,
  storyboard: <PictureOutlined />,
  character: <EyeOutlined />,
  scene: <PictureOutlined />,
  image: <PictureOutlined />,
  dubbing: <SoundOutlined />,
  video: <VideoCameraOutlined />,
  edit: <EditOutlined />,
  export: <ExportOutlined />,
};

// 步骤颜色映射
const STEP_COLORS: Record<string, string> = {
  pending: 'default',
  running: 'processing',
  completed: 'success',
  failed: 'error',
  skipped: 'default',
};

const WorkflowManager: React.FC = () => {
  const [projects, setProjects] = useState<ComicDramaProject[]>([]);
  const [currentProject, setCurrentProject] = useState<ComicDramaProject | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form] = Form.useForm();
  const [eventLog, setEventLog] = useState<string[]>([]);

  // 刷新项目列表
  const refreshProjects = useCallback(() => {
    setProjects(workflowService.getAllProjects());
    if (currentProject) {
      const updated = workflowService.getProject(currentProject.id);
      if (updated) {
        setCurrentProject(updated);
      }
    }
  }, [currentProject]);

  // 订阅工作流事件
  useEffect(() => {
    const unsubscribe = workflowService.subscribe((event: WorkflowEvent) => {
      const timestamp = new Date().toLocaleTimeString();
      let logMessage = `[${timestamp}] `;

      switch (event.type) {
        case 'stepStart':
          logMessage += `开始步骤: ${event.stepType}`;
          break;
        case 'stepProgress':
          logMessage += `步骤进度: ${event.stepType} - ${event.progress}%`;
          break;
        case 'stepComplete':
          logMessage += `步骤完成: ${event.stepType}`;
          break;
        case 'stepFail':
          logMessage += `步骤失败: ${event.stepType} - ${event.error}`;
          break;
        case 'workflowComplete':
          logMessage += '工作流完成！';
          message.success('漫剧创作完成！');
          break;
        case 'workflowFail':
          logMessage += `工作流失败: ${event.error}`;
          message.error('工作流执行失败');
          break;
      }

      setEventLog(prev => [...prev.slice(-49), logMessage]);
      refreshProjects();
    });

    refreshProjects();

    return () => {
      unsubscribe();
    };
  }, [refreshProjects]);

  // 创建新项目
  const handleCreateProject = async (values: any) => {
    const config: WorkflowConfig = {
      name: values.name,
      description: values.description,
      aiProvider: values.aiProvider,
      aiApiKey: values.aiApiKey,
      imageProvider: values.imageProvider,
      imageApiKey: values.imageApiKey,
      videoProvider: values.videoProvider,
      videoApiKey: values.videoApiKey,
      ttsProvider: values.ttsProvider,
      style: values.style,
      aspectRatio: values.aspectRatio,
      duration: values.duration,
      autoProceed: values.autoProceed,
    };

    const project = workflowService.createProject(values.name, config);
    setCurrentProject(project);
    setIsCreating(false);
    form.resetFields();
    refreshProjects();
    message.success('项目创建成功');
  };

  // 开始工作流
  const handleStartWorkflow = async () => {
    if (!currentProject) return;

    try {
      await workflowService.runWorkflow(currentProject.id);
    } catch (error) {
      console.error('启动工作流失败:', error);
    }
  };

  // 暂停工作流
  const handlePauseWorkflow = () => {
    if (!currentProject) return;
    workflowService.pauseWorkflow(currentProject.id);
    refreshProjects();
    message.info('工作流已暂停');
  };

  // 继续工作流
  const handleResumeWorkflow = async () => {
    if (!currentProject) return;

    try {
      await workflowService.resumeWorkflow(currentProject.id);
    } catch (error) {
      console.error('继续工作流失败:', error);
    }
  };

  // 删除项目
  const handleDeleteProject = (projectId: string) => {
    workflowService.deleteProject(projectId);
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }
    refreshProjects();
    message.success('项目已删除');
  };

  // 获取状态图标
  const getStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'running':
        return <LoadingOutlined spin />;
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return null;
    }
  };

  // 渲染创建项目模态框
  const renderCreateModal = () => (
    <Modal
      title="创建漫剧项目"
      open={isCreating}
      onCancel={() => setIsCreating(false)}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleCreateProject}
        initialValues={{
          aiProvider: 'baidu',
          imageProvider: 'bytedance-seedream',
          videoProvider: 'bytedance-seedance',
          ttsProvider: 'edge',
          style: 'anime',
          aspectRatio: '16:9',
          duration: 5,
          autoProceed: true,
        }}
      >
        <Form.Item
          label="项目名称"
          name="name"
          rules={[{ required: true, message: '请输入项目名称' }]}
        >
          <Input placeholder="例如：我的第一部漫剧" />
        </Form.Item>

        <Form.Item
          label="项目描述"
          name="description"
        >
          <TextArea rows={2} placeholder="简要描述项目内容..." />
        </Form.Item>

        <Divider orientation="left">AI 配置</Divider>

        <Form.Item
          label="AI 模型"
          name="aiProvider"
          rules={[{ required: true }]}
        >
          <Select>
            {AI_PROVIDERS.map(provider => (
              <Option key={provider.id} value={provider.id}>
                {provider.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="API Key"
          name="aiApiKey"
          rules={[{ required: true, message: '请输入 API Key' }]}
        >
          <Input.Password placeholder="输入 AI 模型的 API Key" />
        </Form.Item>

        <Divider orientation="left">图像/视频配置</Divider>

        <Form.Item
          label="图像生成模型"
          name="imageProvider"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="bytedance-seedream">字节 Seedream</Option>
            <Option value="kling">快手可灵</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="图像 API Key"
          name="imageApiKey"
        >
          <Input.Password placeholder="输入图像生成 API Key" />
        </Form.Item>

        <Form.Item
          label="视频生成模型"
          name="videoProvider"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="bytedance-seedance">字节 Seedance</Option>
            <Option value="kling">快手可灵</Option>
            <Option value="vidu">生数 Vidu</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="视频 API Key"
          name="videoApiKey"
        >
          <Input.Password placeholder="输入视频生成 API Key" />
        </Form.Item>

        <Divider orientation="left">风格配置</Divider>

        <Form.Item
          label="画面风格"
          name="style"
        >
          <Radio.Group>
            <Radio.Button value="realistic">写实</Radio.Button>
            <Radio.Button value="anime">动漫</Radio.Button>
            <Radio.Button value="3d">3D</Radio.Button>
            <Radio.Button value="chinese">国风</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="画面比例"
          name="aspectRatio"
        >
          <Radio.Group>
            <Radio.Button value="16:9">16:9 横屏</Radio.Button>
            <Radio.Button value="9:16">9:16 竖屏</Radio.Button>
            <Radio.Button value="1:1">1:1 方形</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="视频时长"
          name="duration"
        >
          <Radio.Group>
            <Radio.Button value={5}>5 秒</Radio.Button>
            <Radio.Button value={10}>10 秒</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="配音引擎"
          name="ttsProvider"
        >
          <Select>
            <Option value="edge">Edge TTS（免费）</Option>
            <Option value="aliyun">阿里云</Option>
            <Option value="baidu">百度</Option>
            <Option value="iflytek">讯飞</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="autoProceed"
          valuePropName="checked"
        >
          <Radio checked={form.getFieldValue('autoProceed')}>
            自动执行所有步骤
          </Radio>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              创建项目
            </Button>
            <Button onClick={() => setIsCreating(false)}>
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );

  // 渲染项目列表
  const renderProjectList = () => (
    <Card
      title="漫剧项目"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreating(true)}
        >
          新建项目
        </Button>
      }
    >
      {projects.length === 0 ? (
        <Empty description="暂无项目，点击上方按钮创建">
          <Button type="primary" onClick={() => setIsCreating(true)}>
            创建项目
          </Button>
        </Empty>
      ) : (
        <List
          dataSource={projects}
          renderItem={project => (
            <List.Item
              actions={[
                <Button
                  key="open"
                  size="small"
                  type={currentProject?.id === project.id ? 'primary' : 'default'}
                  onClick={() => setCurrentProject(project)}
                >
                  {currentProject?.id === project.id ? '当前' : '打开'}
                </Button>,
                <Popconfirm
                  key="delete"
                  title="确认删除"
                  description="删除后无法恢复，是否继续？"
                  onConfirm={() => handleDeleteProject(project.id)}
                  okText="删除"
                  cancelText="取消"
                >
                  <Button size="small" danger icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Text strong>{project.name}</Text>
                    <Tag color={project.status === 'completed' ? 'success' : 'default'}>
                      {project.status === 'idle' && '未开始'}
                      {project.status === 'running' && '进行中'}
                      {project.status === 'paused' && '已暂停'}
                      {project.status === 'completed' && '已完成'}
                      {project.status === 'failed' && '失败'}
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      当前步骤: {project.steps[project.currentStep]?.name || '已完成'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      创建时间: {new Date(project.createdAt).toLocaleString()}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );

  // 渲染当前项目详情
  const renderProjectDetail = () => {
    if (!currentProject) {
      return (
        <Card>
          <Empty description="选择一个项目或创建新项目" />
        </Card>
      );
    }

    const currentStep = currentProject.steps[currentProject.currentStep];

    return (
      <Card
        title={
          <Space>
            <Text strong>{currentProject.name}</Text>
            <Badge
              status={currentProject.status === 'running' ? 'processing' : 'default'}
              text={
                currentProject.status === 'idle' ? '未开始' :
                currentProject.status === 'running' ? '进行中' :
                currentProject.status === 'paused' ? '已暂停' :
                currentProject.status === 'completed' ? '已完成' : '失败'
              }
            />
          </Space>
        }
        extra={
          <Space>
            {currentProject.status === 'idle' && (
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handleStartWorkflow}
              >
                开始创作
              </Button>
            )}
            {currentProject.status === 'running' && (
              <Button
                icon={<PauseCircleOutlined />}
                onClick={handlePauseWorkflow}
              >
                暂停
              </Button>
            )}
            {currentProject.status === 'paused' && (
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handleResumeWorkflow}
              >
                继续
              </Button>
            )}
            {(currentProject.status === 'completed' || currentProject.status === 'failed') && (
              <Button
                icon={<ReloadOutlined />}
                onClick={handleStartWorkflow}
              >
                重新运行
              </Button>
            )}
          </Space>
        }
      >
        {/* 步骤进度 */}
        <Steps
          current={currentProject.currentStep}
          status={currentProject.status === 'failed' ? 'error' : 'process'}
          direction="horizontal"
          size="small"
          className={styles.steps}
        >
          {currentProject.steps.map((step, index) => (
            <Steps.Step
              key={step.id}
              title={step.name}
              icon={index === currentProject.currentStep && step.status === 'running' ? <LoadingOutlined /> : STEP_ICONS[step.type]}
              status={
                step.status === 'completed' ? 'finish' :
                step.status === 'failed' ? 'error' :
                index === currentProject.currentStep ? 'process' : 'wait'
              }
            />
          ))}
        </Steps>

        {/* 当前步骤详情 */}
        {currentStep && (
          <Card className={styles.currentStep} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Title level={5} style={{ margin: 0 }}>
                  {STEP_ICONS[currentStep.type]} {currentStep.name}
                </Title>
                <Tag color={STEP_COLORS[currentStep.status]}>
                  {currentStep.status === 'pending' && '等待中'}
                  {currentStep.status === 'running' && '进行中'}
                  {currentStep.status === 'completed' && '已完成'}
                  {currentStep.status === 'failed' && '失败'}
                  {currentStep.status === 'skipped' && '已跳过'}
                </Tag>
              </Space>
              
              <Text type="secondary">{currentStep.description}</Text>
              
              {currentStep.status === 'running' && (
                <Progress percent={currentStep.progress} status="active" />
              )}
              
              {currentStep.error && (
                <Alert message={currentStep.error} type="error" showIcon />
              )}
            </Space>
          </Card>
        )}

        {/* 步骤列表 */}
        <Collapse className={styles.stepList}>
          <Panel header="查看所有步骤" key="steps">
            <Timeline>
              {currentProject.steps.map((step, index) => (
                <Timeline.Item
                  key={step.id}
                  dot={getStatusIcon(step.status)}
                  color={
                    step.status === 'completed' ? 'green' :
                    step.status === 'failed' ? 'red' :
                    step.status === 'running' ? 'blue' : 'gray'
                  }
                >
                  <Space direction="vertical" size={0}>
                    <Text strong>{step.name}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {step.status === 'pending' && '等待执行'}
                      {step.status === 'running' && `进行中 ${step.progress}%`}
                      {step.status === 'completed' && `已完成 ${step.duration ? `(${Math.round(step.duration / 1000)}秒)` : ''}`}
                      {step.status === 'failed' && `失败: ${step.error}`}
                    </Text>
                  </Space>
                </Timeline.Item>
              ))}
            </Timeline>
          </Panel>
        </Collapse>

        {/* 事件日志 */}
        <Card className={styles.eventLog} size="small" title="执行日志">
          <div className={styles.logContent}>
            {eventLog.length === 0 ? (
              <Text type="secondary">暂无日志</Text>
            ) : (
              eventLog.map((log, index) => (
                <div key={index} className={styles.logLine}>
                  <Text style={{ fontSize: 12 }}>{log}</Text>
                </div>
              ))
            )}
          </div>
        </Card>
      </Card>
    );
  };

  return (
    <div className={styles.container}>
      <Row gutter={16}>
        <Col span={8}>
          {renderProjectList()}
        </Col>
        <Col span={16}>
          {renderProjectDetail()}
        </Col>
      </Row>
      {renderCreateModal()}
    </div>
  );
};

export default WorkflowManager;
