# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-02-17

### Renamed
- **Project Name**: ReelForge → CineCraft (电影工坊)
  - New ASCII art logo
  - Updated all documentation references
  - GitHub: https://github.com/Agions/CineCraft

### Added
- **8-Step Drama Workflow**: Novel → Script → Storyboard → Character → Scene → Animation → Voiceover → Export
- **Novel Parser**: Automatic novel-to-script conversion with character extraction
- **Storyboard Generator**: AI-powered panel generation from script scenes
- **Character Consistency**: Character appearance and personality management
- **Drama Style System**: Genre/tone/pacing/art style management for comic dramas
- **Vision Service**: Advanced scene detection, object detection (10 classes), 5-dimension emotion analysis
- **Novel Service**: Parse novels, convert to scripts, generate storyboards

### Updated
- **LLM Models (2026 Latest)**:
  - Baidu ERNIE 5.0 (2026-01)
  - Alibaba Qwen 3.5 (2026-01)
  - Moonshot Kimi k2.5 (2025-07)
  - Zhipu GLM-5 (2026-01)
  - MiniMax M2.5 (2025-12)
- **Constants**: Centralized LLM_MODELS with accurate pricing and capabilities
- **AI Service**: Model recommendation and info query methods
- **ModelSelector**: Updated to use new model configuration

### Technical
- Added `useNovel` hook for novel parsing and script generation
- Added `useConsistency` hook for character and style management
- Added `novel.service.ts` for novel-to-script conversion
- Added `consistency.service.ts` for character consistency
- Added `drama.workflow.service.ts` for drama generation workflow
- Added `vision.service.ts` for video analysis

## [1.0.0] - 2026-02-17

### Added
- Initial release of ReelForge
- AI-powered video content creation platform
- Support for 8 major AI providers (OpenAI, Anthropic, Google, Baidu, Alibaba, Zhipu, iFlytek, Tencent)
- Professional video upload and analysis
- AI script generation with multiple styles and tones
- Video export with subtitle support
- Multi-language support (Chinese, English)
- Dark mode support
- Local storage management
- FFmpeg integration for video processing

### Features
- **Model Selector**: Smart AI model selection with cost estimation
- **Novel Parser**: Upload and parse novels (TXT/EPUB/PDF)
- **Script Generator**: AI-powered script generation from novels
- **Storyboard Generator**: Automatic storyboard creation from scripts
- **Character Designer**: AI character generation with consistency
- **Project Management**: Complete project lifecycle management
- **Storage Service**: Persistent local storage for projects and settings

### Technical
- React 18 + TypeScript + Vite
- Ant Design 5 + Framer Motion
- Tauri for desktop application
- Zustand for state management
- Modular architecture with service layer

## [0.1.0] - 2026-02-16

### Added
- Project initialization
- Basic project structure
- TypeScript configuration
- Development environment setup
