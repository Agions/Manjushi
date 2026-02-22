/**
 * 专业项目列表页面
 */

import React, { useState } from 'react';
import { 
  Card, 
  Button, 
  List, 
  Typography, 
  Space, 
  Empty, 
  Tag, 
  Input,
  Select,
  Dropdown,
  MenuProps,
  Tooltip,
  Checkbox,
  Row,
  Col,
  Badge
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  VideoCameraOutlined, 
  ClockCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  StarOutlined,
  StarFilled,
  MoreOutlined,
  CopyOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  FolderOpenOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './Projects.module.less';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

// 项目数据
interface Project {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  progress: number;
  status: 'draft' | 'processing' | 'completed';
  episodes: number;
  createdAt: string;
  updatedAt: string;
  starred: boolean;
  tags: string[];
}

const mockProjects: Project[] = [
  {
    id: '1',
    title: '星辰大海',
    description: '科幻漫剧，讲述人类探索星际的故事',
    thumbnail: 'https://picsum.photos/seed/p1/400/300',
    progress: 75,
    status: 'processing',
    episodes: 3,
    createdAt: '2026-02-15',
    updatedAt: '2小时前',
    starred: true,
    tags: ['科幻', '冒险']
  },
  {
    id: '2',
    title: '都市恋曲',
    description: '浪漫都市爱情故事',
    thumbnail: 'https://picsum.photos/seed/p2/400/300',
    progress: 100,
    status: 'completed',
    episodes: 5,
    createdAt: '2026-02-10',
    updatedAt: '昨天',
    starred: false,
    tags: ['爱情', '都市']
  },
  {
    id: '3',
    title: '修仙传',
    description: '热血修仙玄幻漫剧',
    thumbnail: 'https://picsum.photos/seed/p3/400/300',
    progress: 45,
    status: 'processing',
    episodes: 2,
    createdAt: '2026-02-18',
    updatedAt: '3天前',
    starred: true,
    tags: ['修仙', '玄幻']
  },
  {
    id: '4',
    title: '校园时光',
    description: '青春校园轻喜剧',
    thumbnail: 'https://picsum.photos/seed/p4/400/300',
    progress: 20,
    status: 'draft',
    episodes: 1,
    createdAt: '2026-02-20',
    updatedAt: '今天',
    starred: false,
    tags: ['校园', '青春']
  },
  {
    id: '5',
    title: '暗夜行动',
    description: '悬疑动作漫剧',
    thumbnail: 'https://picsum.photos/seed/p5/400/300',
    progress: 90,
    status: 'processing',
    episodes: 4,
    createdAt: '2026-02-08',
    updatedAt: '1周前',
    starred: false,
    tags: ['悬疑', '动作']
  },
];

const statusConfig = {
  draft: { label: '草稿', color: 'default' },
  processing: { label: '进行中', color: 'processing' },
  completed: { label: '已完成', color: 'success' }
};

const Projects: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');

  // 项目操作菜单
  const getProjectMenu = (project: Project): MenuProps['items'] => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑',
    },
    {
      key: 'duplicate',
      icon: <CopyOutlined />,
      label: '复制',
    },
    {
      key: 'share',
      icon: <ShareAltOutlined />,
      label: '分享',
    },
    {
      key: 'export',
      icon: <DownloadOutlined />,
      label: '导出',
    },
    { type: 'divider' },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
    },
  ];

  // 过滤项目
  const filteredProjects = mockProjects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchText.toLowerCase()) ||
                       p.description.toLowerCase().includes(searchText.toLowerCase());
    const matchTags = selectedTags.length === 0 || 
                     selectedTags.some(tag => p.tags.includes(tag));
    return matchSearch && matchTags;
  });

  // 全部标签
  const allTags = Array.from(new Set(mockProjects.flatMap(p => p.tags)));

  return (
    <div className={styles.projects}>
      {/* 顶部工具栏 */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Title level={3} className={styles.pageTitle}>
            我的项目
            <Badge count={mockProjects.length} className={styles.badge} />
          </Title>
        </div>
        
        <Space>
          <Search
            placeholder="搜索项目..."
            prefix={<SearchOutlined />}
            className={styles.searchInput}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            mode="multiple"
            placeholder="筛选标签"
            className={styles.tagFilter}
            allowClear
            value={selectedTags}
            onChange={setSelectedTags}
            options={allTags.map(tag => ({ label: tag, value: tag }))}
          />
          <Button 
            icon={<AppstoreOutlined />} 
            type={viewMode === 'grid' ? 'primary' : 'default'}
            onClick={() => setViewMode('grid')}
          />
          <Button 
            icon={<UnorderedListOutlined />} 
            type={viewMode === 'list' ? 'primary' : 'default'}
            onClick={() => setViewMode('list')}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            size="large"
            className={styles.createBtn}
            onClick={() => navigate('/workflow')}
          >
            新建项目
          </Button>
        </Space>
      </div>

      {/* 项目列表 */}
      {filteredProjects.length === 0 ? (
        <Card className={styles.emptyCard}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="暂无项目"
          >
            <Button type="primary" onClick={() => navigate('/workflow')}>
              创建第一个项目
            </Button>
          </Empty>
        </Card>
      ) : viewMode === 'grid' ? (
        <Row gutter={[20, 20]} className={styles.projectGrid}>
          {filteredProjects.map((project) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={project.id}>
              <Card 
                className={styles.projectCard}
                hoverable
                cover={
                  <div className={styles.cardCover}>
                    <img src={project.thumbnail} alt={project.title} />
                    <div className={styles.cardOverlay}>
                      <Space>
                        <Tooltip title="预览">
                          <Button 
                            type="text" 
                            icon={<EyeOutlined />}
                            classNameBtn}
                          />
={styles.overlay                        </Tooltip>
                        <Tooltip title="编辑">
                          <Button 
                            type="text" 
                            icon={<EditOutlined />}
                            className={styles.overlayBtn}
                          />
                        </Tooltip>
                        <Tooltip title="播放">
                          <Button 
                            type="text" 
                            icon={<PlayCircleOutlined />}
                            className={styles.overlayBtn}
                          />
                        </Tooltip>
                      </Space>
                    </div>
                    {project.status === 'completed' && (
                      <div className={styles.completedBadge}>
                        <PlayCircleOutlined /> 已完成
                      </div>
                    )}
                  </div>
                }
                actions={[
                  <Tooltip title={project.starred ? '取消收藏' : '收藏'}>
                    {project.starred ? <StarFilled style={{ color: '#f59e0b' }} /> : <StarOutlined />}
                  </Tooltip>,
                  <Dropdown menu={{ items: getProjectMenu(project) }} trigger={['click']}>
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                ]}
              >
                <Card.Meta
                  title={
                    <div className={styles.cardTitle}>
                      {project.title}
                      <Tag color={statusConfig[project.status].color} className={styles.statusTag}>
                        {statusConfig[project.status].label}
                      </Tag>
                    </div>
                  }
                  description={
                    <div className={styles.cardDesc}>
                      <Paragraph ellipsis={{ rows: 2 }} className={styles.desc}>
                        {project.description}
                      </Paragraph>
                      <div className={styles.cardMeta}>
                        <Space size="small">
                          <Tag>{project.episodes}集</Tag>
                          <Text type="secondary">{project.updatedAt}</Text>
                        </Space>
                      </div>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill} 
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card className={styles.listCard}>
          <List
            dataSource={filteredProjects}
            renderItem={(project) => (
              <List.Item
                className={styles.listItem}
                actions={[
                  <Button type="text" key="star">
                    {project.starred ? <StarFilled style={{ color: '#f59e0b' }} /> : <StarOutlined />}
                  </Button>,
                  <Dropdown menu={{ items: getProjectMenu(project) }} trigger={['click']}>
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div className={styles.listThumb}>
                      <img src={project.thumbnail} alt={project.title} />
                    </div>
                  }
                  title={
                    <div className={styles.listTitle}>
                      {project.title}
                      <Tag color={statusConfig[project.status].color}>
                        {statusConfig[project.status].label}
                      </Tag>
                    </div>
                  }
                  description={
                    <div className={styles.listDesc}>
                      <Text type="secondary">{project.description}</Text>
                      <div className={styles.listMeta}>
                        <Space size="large">
                          <span><FolderOpenOutlined /> {project.episodes}集</span>
                          <span><ClockCircleOutlined /> {project.updatedAt}</span>
                        </Space>
                      </div>
                    </div>
                  }
                />
                <div className={styles.listProgress}>
                  <div className={styles.progressText}>{project.progress}%</div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
};

export default Projects;
