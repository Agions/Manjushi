<div align="center">

<img src="https://raw.githubusercontent.com/Agions/ManGaAI/main/assets/logo.png" alt="ManGaAI Logo" width="120" />

# ManGaAI

**AI 漫剧视频智能创作平台**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/Agions/ManGaAI)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tauri](https://img.shields.io/badge/Tauri-1.x-FFC131?logo=tauri)](https://tauri.app/)

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#使用指南">使用指南</a> •
  <a href="#技术架构">技术架构</a> •
  <a href="#开发文档">开发文档</a>
</p>

</div>

---

## ✨ 功能特性

### 🤖 AI 对话引擎（6 大国产模型）

ManGaAI 深度集成国内主流 AI 大模型，为用户提供多样化选择：

| 厂商 | 模型 | 特点 | 状态 |
|------|------|------|------|
| 百度 | ERNIE 5.0 | 知识增强、多模态理解 | ✅ |
| 阿里 | Qwen 3.5 | 长文本、代码能力 | ✅ |
| 智谱 | GLM-5 | 双语对话、逻辑推理 | ✅ |
| 月之暗面 | Kimi k2.5 | 超长上下文、文件理解 | ✅ |
| MiniMax | M2.5 | 多轮对话、情感表达 | ✅ |
| 字节 | 豆包 Pro | 多场景适配、高效推理 | ✅ |

### 🔊 TTS 语音合成（4 引擎 60+ 音色）

支持多种语音合成引擎，满足不同场景需求：

| 引擎 | 音色数 | 特点 | 费用 |
|------|--------|------|------|
| Edge TTS | 25+ | 免费、含方言、在线 | 免费 |
| 阿里云 | 20+ | 情感丰富、商用级 | 需 API Key |
| 百度 | 11 | 标准音色、稳定 | 需 API Key |
| 讯飞 | 5 | 高自然度、情感细腻 | 需 App ID |

**特色功能**：
- 语速、音调、音量精细调节
- 方言支持（粤语、四川话等）
- 情感风格切换
- 批量生成与下载

### 🎨 AI 图像生成

| 厂商 | 模型 | 特点 |
|------|------|------|
| 字节 | Seedream 2.0 | 10 种艺术风格、高质量 |
| 快手 | 可灵 1.6 | 国产领先、语义理解强 |

**支持功能**：
- 文生图、图生图
- 10 种风格：动漫、写实、油画、水彩等
- 多比例输出：1:1、16:9、9:16、4:3
- 批量生成任务管理

### 🎬 AI 视频生成

| 厂商 | 模型 | 时长 | 特点 |
|------|------|------|------|
| 字节 | Seedance 2.0 | 5-10s | 运动流畅、画质清晰 |
| 快手 | 可灵 1.6 | 5-10s | 国产领先、物理准确 |
| 生数 | Vidu 2.0 | 4-8s | 高保真、细节丰富 |

**支持功能**：
- 图生视频、文生视频
- 5 种视频风格
- 镜头运动控制
- 任务队列管理

### 🎞️ FFmpeg 视频处理

完整的视频后期处理能力：

- **视频分析**：时长、分辨率、FPS、编码信息
- **关键帧提取**：智能提取场景关键帧
- **缩略图生成**：自定义尺寸缩略图
- **视频剪辑**：多片段合并、精确裁剪
- **转场效果**：淡入淡出、溶解、擦除、滑动
- **字幕添加**：SRT 格式字幕合成
- **音频处理**：音量调节、混音
- **格式转换**：MP4、MOV、AVI 等

### ⚡ 9 步漫剧工作流

从创意到成品的完整自动化流程：

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  1.剧本创作  │ → │  2.分镜设计  │ → │  3.角色设定  │
│   AI生成    │    │  剧本转分镜  │    │  提取角色   │
└─────────────┘    └─────────────┘    └─────────────┘
       ↓
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  4.场景生成  │ → │  5.图像生成  │ → │  6.智能配音  │
│   提取场景   │    │  批量生成   │    │  角色配音   │
└─────────────┘    └─────────────┘    └─────────────┘
       ↓
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  7.视频生成  │ → │  8.后期剪辑  │ → │  9.导出成品  │
│  图生视频   │    │  片段管理   │    │  输出视频   │
└─────────────┘    └─────────────┘    └─────────────┘
```

**工作流特性**：
- 可视化进度追踪
- 断点续传
- 错误自动重试
- 实时日志
- 项目历史管理

### 📦 40+ 漫剧模板

丰富的创作模板库：

| 类型 | 数量 | 示例 |
|------|------|------|
| 分镜模板 | 12 | 浪漫邂逅、职场对决、古风武侠、科幻未来 |
| 场景模板 | 10 | 古风庭院、未来都市、海边沙滩、咖啡厅 |
| 角色模板 | 8 | 霸道总裁、邻家女孩、高冷学霸、热血少年 |
| 风格模板 | 9 | 赛博朋克、水墨国风、治愈系、暗黑哥特 |

---

## 🚀 快速开始

### 环境要求

- Node.js ≥ 18
- Rust ≥ 1.70
- FFmpeg（可选，用于视频处理）

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/Agions/ManGaAI.git
cd ManGaAI

# 安装前端依赖
npm install

# 安装 Tauri 依赖
cd src-tauri
cargo build
cd ..
```

### 开发运行

```bash
# 启动开发服务器
npm run tauri dev
```

### 构建发布

```bash
# 构建生产版本
npm run tauri build
```

---

## 📖 使用指南

### 首次使用

1. **配置 API Key**
   - 进入「设置」→「AI 配置」
   - 添加所需 AI 厂商的 API Key
   - 设置默认使用的 AI 模型

2. **创建项目**
   - 点击首页「新建漫剧」
   - 输入剧本主题或上传剧本
   - 选择模板风格

3. **执行工作流**
   - 系统自动执行 9 步工作流
   - 实时查看进度和日志
   - 可随时暂停/继续

4. **导出成品**
   - 工作流完成后预览
   - 调整参数后导出视频

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + N` | 新建项目 |
| `Ctrl + O` | 打开项目 |
| `Ctrl + S` | 保存项目 |
| `Ctrl + Z` | 撤销 |
| `Ctrl + Y` | 重做 |
| `Space` | 播放/暂停预览 |
| `Ctrl + E` | 导出视频 |

---

## 🏗️ 技术架构

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18 | UI 框架 |
| TypeScript | 5 | 类型安全 |
| Vite | 5 | 构建工具 |
| Ant Design | 5 | 组件库 |
| Framer Motion | 11 | 动画 |
| Zustand | 4 | 状态管理 |
| React Router | 6 | 路由 |

### 后端技术栈

| 技术 | 用途 |
|------|------|
| Tauri | 桌面应用框架 |
| Rust | 系统层开发 |
| FFmpeg | 视频处理 |

### 项目结构

```
ManGaAI/
├── src/
│   ├── core/
│   │   ├── constants/          # 常量配置
│   │   ├── services/           # 核心服务
│   │   │   ├── ai.service.ts      # AI 对话
│   │   │   ├── tts.service.ts     # 语音合成
│   │   │   ├── generation.service.ts  # 图像/视频生成
│   │   │   ├── ffmpeg.service.ts  # 视频处理
│   │   │   ├── workflow.service.ts # 工作流
│   │   │   └── settings.service.ts # 设置管理
│   │   └── types/              # 类型定义
│   ├── components/
│   │   ├── business/           # 业务组件
│   │   │   ├── AIImageGenerator/   # 图像生成器
│   │   │   ├── WorkflowManager/    # 工作流管理
│   │   │   ├── FFmpegStatus/       # FFmpeg 状态
│   │   │   └── RecommendPanel/     # 推荐面板
│   │   └── layout/             # 布局组件
│   ├── pages/                  # 页面
│   │   ├── Home.tsx            # 首页
│   │   ├── Workflow/           # 工作流页面
│   │   ├── Editor/             # 编辑器页面
│   │   └── Settings.tsx        # 设置页面
│   ├── hooks/                  # 自定义 Hooks
│   └── App.tsx
├── src-tauri/                  # Tauri 后端
│   └── src/
│       └── main.rs
├── docs/                       # 文档
└── package.json
```

---

## 🛠️ 开发文档

### 核心服务

#### AI 服务

```typescript
import { aiService } from '@/core/services';

// 调用 AI 对话
const response = await aiService.chat({
  provider: 'baidu',
  model: 'ernie-5.0',
  messages: [{ role: 'user', content: '你好' }],
});
```

#### TTS 服务

```typescript
import { ttsService } from '@/core/services';

// 生成语音
const result = await ttsService.synthesize({
  provider: 'edge',
  voice: 'zh-CN-XiaoxiaoNeural',
  text: '你好，世界',
  speed: 1.0,
  pitch: 0,
  volume: 100,
});
```

#### 工作流服务

```typescript
import { workflowService } from '@/core/services';

// 创建工作流项目
const project = workflowService.createProject({
  name: '我的漫剧',
  description: '测试项目',
});

// 启动工作流
await workflowService.startWorkflow(project.id);
```

### 添加新的 AI 模型

1. 在 `src/core/constants/ai.ts` 添加模型配置
2. 在 `src/core/services/ai.service.ts` 实现调用方法
3. 在 `src/pages/Settings.tsx` 添加 UI 配置

---

## 📝 更新日志

### v2.0.0 (2026-02-26)

- ✨ 全新工作流系统，9 步漫剧自动化
- 🤖 新增 3 个国产 AI 模型（Kimi、MiniMax、豆包）
- 🔊 完整 TTS 语音合成服务
- 🎨 AI 图像/视频生成服务
- 🎞️ FFmpeg 视频处理后端
- 📦 40+ 漫剧模板库
- ⚙️ 专业设置管理系统

---

## 🤝 贡献指南

欢迎提交 Issue 和 PR！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 📄 许可证

[MIT](LICENSE) © 2026 ManGaAI Team

---

<div align="center">

**Made with ❤️ by ManGaAI Team**

</div>
