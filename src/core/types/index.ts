/**
 * 核心类型定义
 */

// AI 模型类型
export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'baidu' | 'alibaba' | 'zhipu' | 'iflytek' | 'tencent';
export type ModelCategory = 'text' | 'code' | 'image' | 'video' | 'all';

// AI 模型
export interface AIModel {
  id: string;
  name: string;
  provider: ModelProvider;
  category: ModelCategory[];
  description: string;
  features: string[];
  tokenLimit: number;
  contextWindow: number;
  isPro?: boolean;
  isAvailable?: boolean;
  apiConfigured?: boolean;
  pricing?: {
    input: number;
    output: number;
    unit: string;
  };
}

// AI 模型设置
export interface AIModelSettings {
  enabled: boolean;
  apiKey?: string;
  apiSecret?: string;
  apiUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

// 模型配置状态
export interface ModelConfigState {
  selectedModel: string;
  models: Record<string, AIModelSettings>;
  isLoading: boolean;
  error: string | null;
}

// 视频信息
export interface VideoInfo {
  id: string;
  path: string;
  name: string;
  duration: number;
  width: number;
  height: number;
  fps: number;
  format: string;
  size: number;
  thumbnail?: string;
  createdAt: string;
}

// 视频分析结果
export interface VideoAnalysis {
  id: string;
  videoId: string;
  scenes: Scene[];
  keyframes: Keyframe[];
  audioTranscript?: AudioTranscript;
  objects: DetectedObject[];
  emotions: EmotionSegment[];
  summary: string;
  createdAt: string;
}

// 场景
export interface Scene {
  id: string;
  startTime: number;
  endTime: number;
  thumbnail: string;
  description?: string;
  tags: string[];
}

// 关键帧
export interface Keyframe {
  id: string;
  timestamp: number;
  thumbnail: string;
  description?: string;
}

// 音频转录
export interface AudioTranscript {
  segments: TranscriptSegment[];
  fullText: string;
  language: string;
}

// 转录片段
export interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  speaker?: string;
  confidence: number;
}

// 检测到的对象
export interface DetectedObject {
  id: string;
  label: string;
  confidence: number;
  timestamps: number[];
  boundingBoxes?: BoundingBox[];
}

// 边界框
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  timestamp: number;
}

// 情感片段
export interface EmotionSegment {
  id: string;
  startTime: number;
  endTime: number;
  emotion: 'happy' | 'sad' | 'angry' | 'neutral' | 'excited' | 'fear';
  confidence: number;
}

// 脚本数据
export interface ScriptData {
  id: string;
  title: string;
  content: string;
  segments: ScriptSegment[];
  metadata: ScriptMetadata;
  videoId?: string;
  createdAt: string;
  updatedAt: string;
}

// 脚本片段
export interface ScriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  content: string;
  type: 'narration' | 'dialogue' | 'subtitle' | 'action';
  speaker?: string;
  emotion?: string;
}

// 脚本元数据
export interface ScriptMetadata {
  style: string;
  tone: string;
  length: 'short' | 'medium' | 'long';
  targetAudience?: string;
  language: string;
  wordCount: number;
  estimatedDuration: number;
  generatedBy: string;
  generatedAt: string;
}

// 项目数据
export interface ProjectData {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'processing' | 'completed' | 'archived';
  video?: VideoInfo;
  analysis?: VideoAnalysis;
  script?: ScriptData;
  edit?: EditData;
  settings: ProjectSettings;
  createdAt: string;
  updatedAt: string;
}

// 编辑数据
export interface EditData {
  id: string;
  timeline: TimelineTrack[];
  transitions: Transition[];
  effects: Effect[];
  subtitles: SubtitleTrack[];
  audio: AudioTrack[];
  exportSettings: ExportSettings;
}

// 时间轴轨道
export interface TimelineTrack {
  id: string;
  type: 'video' | 'audio' | 'subtitle';
  clips: TimelineClip[];
  isLocked: boolean;
  isMuted: boolean;
  volume: number;
}

// 时间轴片段
export interface TimelineClip {
  id: string;
  sourceId: string;
  sourceType: 'video' | 'image' | 'audio';
  startTime: number;
  endTime: number;
  sourceStart: number;
  sourceEnd: number;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  opacity: number;
}

// 转场效果
export interface Transition {
  id: string;
  type: 'fade' | 'dissolve' | 'wipe' | 'slide' | 'zoom';
  duration: number;
  fromClipId: string;
  toClipId: string;
  params?: Record<string, unknown>;
}

// 特效
export interface Effect {
  id: string;
  type: string;
  startTime: number;
  endTime: number;
  clipId: string;
  params: Record<string, unknown>;
}

// 字幕轨道
export interface SubtitleTrack {
  id: string;
  segments: SubtitleSegment[];
  style: SubtitleStyle;
}

// 字幕片段
export interface SubtitleSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  style?: Partial<SubtitleStyle>;
}

// 字幕样式
export interface SubtitleStyle {
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  outline: boolean;
  outlineColor: string;
  outlineWidth: number;
  position: 'top' | 'middle' | 'bottom';
  alignment: 'left' | 'center' | 'right';
  lineSpacing: number;
  letterSpacing: number;
}

// 音频轨道
export interface AudioTrack {
  id: string;
  type: 'music' | 'sfx' | 'voice';
  clips: AudioClip[];
  volume: number;
  isMuted: boolean;
}

// 音频片段
export interface AudioClip {
  id: string;
  sourceId: string;
  startTime: number;
  endTime: number;
  sourceStart: number;
  sourceEnd: number;
  fadeIn: number;
  fadeOut: number;
  volume: number;
}

// 项目设置
export interface ProjectSettings {
  videoQuality: 'low' | 'medium' | 'high' | 'ultra';
  outputFormat: 'mp4' | 'mov' | 'webm' | 'mkv';
  resolution: '720p' | '1080p' | '2k' | '4k';
  frameRate: 24 | 30 | 60;
  audioCodec: 'aac' | 'mp3' | 'flac';
  videoCodec: 'h264' | 'h265' | 'vp9';
  subtitleEnabled: boolean;
  subtitleStyle: SubtitleStyle;
}

// 导出设置
export interface ExportSettings {
  format: 'mp4' | 'mov' | 'webm' | 'mkv';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: '720p' | '1080p' | '2k' | '4k';
  frameRate: 24 | 30 | 60;
  includeSubtitles: boolean;
  burnSubtitles: boolean;
  watermark?: {
    text: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    opacity: number;
  };
}

// 应用状态
export interface AppState {
  theme: 'light' | 'dark' | 'system';
  language: string;
  sidebarCollapsed: boolean;
  recentProjects: string[];
  preferences: UserPreferences;
}

// 用户偏好
export interface UserPreferences {
  autoSave: boolean;
  autoSaveInterval: number;
  defaultVideoQuality: 'low' | 'medium' | 'high' | 'ultra';
  defaultOutputFormat: 'mp4' | 'mov' | 'webm';
  enablePreview: boolean;
  previewQuality: 'low' | 'medium' | 'high';
  notifications: boolean;
  soundEffects: boolean;
}

// API 响应
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    timestamp: string;
  };
}

// 分页参数
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 过滤参数
export interface FilterParams {
  search?: string;
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}

// 任务状态
export interface TaskStatus {
  id: string;
  type: 'analysis' | 'script' | 'render' | 'export';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  message?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
