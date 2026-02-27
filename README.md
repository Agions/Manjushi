```
   __  __         _          ____ ___ _____
  |  \/  |__   __| |__  _   / ___|_ _|_   _|
  | |\/| '_ \ / _` '_ \| | |  \___ \| | | | |
  | |  | | | | (_| | | | |_| |___) | | |_| |
  |_|  |_| |_|\__,_| |_|\___/|____/|___|\__, |
                                        |___/
```

<p align="center">
  <strong>ManGa AI — AI 漫剧视频智能创作平台</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-2.1.0-blue.svg" alt="Version" />
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License" />
  <img src="https://img.shields.io/badge/React-18-61dafb?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tauri-ffc131?logo=tauri" alt="Tauri" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript" alt="TypeScript" />
</p>

---

## 📖 简介

**ManGa AI** 是一款专业的 AI 漫剧视频智能创作平台，将小说/剧本自动转化为高质量动态漫剧视频。

> 🎬 将文字变成画面，让故事动起来

---

## ✨ 核心功能

- 📥 **多形式导入** - 支持小说/剧本/AI提示词
- 🤖 **多模型 AI** - GPT-4 / Claude / 通义千问 / 文心一言
- 👤 **角色一致性** - 全剧角色形象统一
- 🎬 **智能分镜** - 自动生成漫画分镜
- 🎤 **语音合成** - Edge TTS / 阿里云 / 百度等多平台
- 💰 **成本控制** - 实时 API 消耗统计

---

## 🔄 7 步工作流

```
导入 → 生成 → 分镜 → 角色 → 渲染 → 合成 → 导出
```

| 步骤 | 功能 | 关键配置 |
|------|------|----------|
| 📥 导入 | 小说/剧本/提示词 | 编码检测、智能分章 |
| 🤖 生成 | AI 剧本生成 | 模型选择、集数(1-200) |
| 🎬 分镜 | 智能分镜设计 | 比例(9:16/16:9)、分辨率 |
| 👤 角色 | 角色形象设计 | 风格(日/美/国漫)、一致性 |
| 🎨 渲染 | 场景渲染 | 引擎、光照、色调 |
| ✨ 合成 | 动态合成 | 动画、TTS、音效、BGM |
| 📤 导出 | 视频导出 | 格式(MP4/WebM)、质量 |

---

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript 5 + Vite |
| UI | Ant Design 5 |
| 状态 | Zustand |
| 动画 | Framer Motion |
| 桌面 | Tauri (Rust) |

---

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/Agions/ManGaAI.git
cd ManGaAI

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建桌面端
npm run tauri build
```

---

## 🎤 语音合成

| 提供商 | 特点 |
|--------|------|
| Edge TTS | 免费、音色多 |
| Azure TTS | 高质量 |
| 阿里云 TTS | 中文优势 |
| 百度 TTS | 中文优势 |

---

## 🤖 AI 模型支持 (全部国产) - 2026年2月

### 文本生成

| 厂商 | 模型 | 发布时间 |
|------|------|----------|
| 智谱 | GLM-5 | 2026年2月 |
| MiniMax | M2.5 | 2026年2月 |
| 月之暗面 | Kimi K2.5 | 2026年 |
| 字节 | 豆包 2.0 | 2026年 |
| 阿里 | Qwen 2.5 | 2026年 |
| 百度 | ERNIE 4.0 | 2026年 |

### 图像生成

| 厂商 | 模型 | 特点 | 发布时间 |
|------|------|------|----------|
| 字节 | Seedream 5.0 | 2K直出,4K AI增强,控制笔刷 | 2026年2月10日 |
| 快手 | 可灵 1.6 | 图像+视频 | 2026年 |
| 生数 | Vidu 2.0 | 图像+视频 | 2026年 |

### 视频生成

| 厂商 | 模型 | 特点 | 发布时间 |
|------|------|------|----------|
| 字节 | Seedance 2.0 | 文本/图片/视频输入,镜头保持一致 | 2026年2月12日 |
| 快手 | 可灵 1.6 | AI视频生成 | 2026年 |
| 生数 | Vidu 2.0 | AI视频生成 | 2026年 |

### 语音合成

| 厂商 | 模型/服务 | 特点 |
|------|------------|------|
| 阿里云 | CosyVoice 2.0 | 开源,3秒复刻,支持方言/情绪 |
| 阿里云 | KAN-TTS | 神经网络+领域知识,多语种方言 |
| 百度 | TTS | 中文优势 |
| 讯飞 | TTS | 多语言支持 |

---

## 📁 项目结构

```
src/
├── core/              # 核心服务
│   ├── config/        # 配置
│   ├── services/      # 业务服务
│   └── stores/        # 状态管理
├── components/        # UI 组件
├── pages/            # 页面
│   ├── Workflow/      # 工作流
│   └── Settings/      # 设置
src-tauri/            # Tauri 桌面端
```

---

## 📄 许可证

MIT License

---

## 🤝 参与贡献

欢迎提交 Pull Request！

---

<p align="center">
  <strong>ManGa AI</strong> — 让每一帧都有灵魂
</p>
