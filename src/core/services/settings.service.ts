/**
 * 设置管理服务
 * 统一管理应用配置
 */

import { STORAGE_KEYS } from '../constants/app';

// 设置分类
export type SettingsCategory = 'general' | 'ai' | 'video' | 'notification' | 'shortcut' | 'advanced';

// 通用设置
export interface GeneralSettings {
  language: 'zh' | 'en';
  theme: 'light' | 'dark' | 'auto';
  autoSave: boolean;
  autoSaveInterval: number; // 秒
  showWelcome: boolean;
  defaultProjectPath: string;
  maxRecentProjects: number;
}

// AI 设置
export interface AISettings {
  defaultProvider: string;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  timeout: number; // 毫秒
  retryCount: number;
  apiKeys: Record<string, string>;
}

// 视频设置
export interface VideoSettings {
  defaultResolution: string;
  defaultAspectRatio: string;
  defaultFrameRate: number;
  defaultCodec: string;
  defaultQuality: string;
  autoKeyframe: boolean;
  defaultOutputFormat: string;
}

// 通知设置
export interface NotificationSettings {
  projectComplete: boolean;
  projectError: boolean;
  apiQuotaWarning: boolean;
  updateNotify: boolean;
  soundEnabled: boolean;
}

// 快捷键设置
export interface ShortcutSettings {
  newProject: string;
  openProject: string;
  saveProject: string;
  undo: string;
  redo: string;
  playPreview: string;
  exportVideo: string;
  [key: string]: string;
}

// 高级设置
export interface AdvancedSettings {
  enableDebugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  autoUpdate: boolean;
  betaFeatures: boolean;
  hardwareAcceleration: boolean;
  maxConcurrentTasks: number;
  cacheSize: number; // MB
}

// 完整设置
export interface AppSettings {
  general: GeneralSettings;
  ai: AISettings;
  video: VideoSettings;
  notification: NotificationSettings;
  shortcut: ShortcutSettings;
  advanced: AdvancedSettings;
  version: string;
  lastUpdated: number;
}

// 默认设置
const DEFAULT_SETTINGS: AppSettings = {
  general: {
    language: 'zh',
    theme: 'auto',
    autoSave: true,
    autoSaveInterval: 30,
    showWelcome: true,
    defaultProjectPath: '',
    maxRecentProjects: 20,
  },
  ai: {
    defaultProvider: 'baidu',
    defaultModel: 'ernie-5.0',
    temperature: 0.7,
    maxTokens: 2000,
    timeout: 60000,
    retryCount: 3,
    apiKeys: {},
  },
  video: {
    defaultResolution: '1080p',
    defaultAspectRatio: '16:9',
    defaultFrameRate: 30,
    defaultCodec: 'h264',
    defaultQuality: 'high',
    autoKeyframe: true,
    defaultOutputFormat: 'mp4',
  },
  notification: {
    projectComplete: true,
    projectError: true,
    apiQuotaWarning: true,
    updateNotify: false,
    soundEnabled: true,
  },
  shortcut: {
    newProject: 'Ctrl+N',
    openProject: 'Ctrl+O',
    saveProject: 'Ctrl+S',
    undo: 'Ctrl+Z',
    redo: 'Ctrl+Y',
    playPreview: 'Space',
    exportVideo: 'Ctrl+E',
  },
  advanced: {
    enableDebugMode: false,
    logLevel: 'info',
    autoUpdate: true,
    betaFeatures: false,
    hardwareAcceleration: true,
    maxConcurrentTasks: 3,
    cacheSize: 1024,
  },
  version: '2.0.0',
  lastUpdated: Date.now(),
};

class SettingsService {
  private settings: AppSettings = { ...DEFAULT_SETTINGS };
  private listeners: Set<(settings: AppSettings) => void> = new Set();

  constructor() {
    this.loadSettings();
  }

  // 加载设置
  private loadSettings(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = this.mergeSettings(DEFAULT_SETTINGS, parsed);
      }
    } catch (e) {
      console.error('加载设置失败:', e);
    }
  }

  // 保存设置
  private saveSettings(): void {
    try {
      this.settings.lastUpdated = Date.now();
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(this.settings));
    } catch (e) {
      console.error('保存设置失败:', e);
    }
  }

  // 合并设置
  private mergeSettings(defaults: AppSettings, custom: Partial<AppSettings>): AppSettings {
    return {
      ...defaults,
      ...custom,
      general: { ...defaults.general, ...custom.general },
      ai: { ...defaults.ai, ...custom.ai },
      video: { ...defaults.video, ...custom.video },
      notification: { ...defaults.notification, ...custom.notification },
      shortcut: { ...defaults.shortcut, ...custom.shortcut },
      advanced: { ...defaults.advanced, ...custom.advanced },
    };
  }

  // 获取所有设置
  getSettings(): AppSettings {
    return { ...this.settings };
  }

  // 获取通用设置
  getGeneralSettings(): GeneralSettings {
    return { ...this.settings.general };
  }

  // 获取 AI 设置
  getAISettings(): AISettings {
    return { ...this.settings.ai };
  }

  // 获取视频设置
  getVideoSettings(): VideoSettings {
    return { ...this.settings.video };
  }

  // 获取通知设置
  getNotificationSettings(): NotificationSettings {
    return { ...this.settings.notification };
  }

  // 获取快捷键设置
  getShortcutSettings(): ShortcutSettings {
    return { ...this.settings.shortcut };
  }

  // 获取高级设置
  getAdvancedSettings(): AdvancedSettings {
    return { ...this.settings.advanced };
  }

  // 更新通用设置
  updateGeneralSettings(settings: Partial<GeneralSettings>): void {
    this.settings.general = { ...this.settings.general, ...settings };
    this.saveSettings();
    this.notifyListeners();
  }

  // 更新 AI 设置
  updateAISettings(settings: Partial<AISettings>): void {
    this.settings.ai = { ...this.settings.ai, ...settings };
    this.saveSettings();
    this.notifyListeners();
  }

  // 更新视频设置
  updateVideoSettings(settings: Partial<VideoSettings>): void {
    this.settings.video = { ...this.settings.video, ...settings };
    this.saveSettings();
    this.notifyListeners();
  }

  // 更新通知设置
  updateNotificationSettings(settings: Partial<NotificationSettings>): void {
    this.settings.notification = { ...this.settings.notification, ...settings };
    this.saveSettings();
    this.notifyListeners();
  }

  // 更新快捷键设置
  updateShortcutSettings(settings: Partial<ShortcutSettings>): void {
    this.settings.shortcut = { ...this.settings.shortcut, ...settings };
    this.saveSettings();
    this.notifyListeners();
  }

  // 更新高级设置
  updateAdvancedSettings(settings: Partial<AdvancedSettings>): void {
    this.settings.advanced = { ...this.settings.advanced, ...settings };
    this.saveSettings();
    this.notifyListeners();
  }

  // 重置设置
  resetSettings(category?: SettingsCategory): void {
    if (category) {
      (this.settings as any)[category] = (DEFAULT_SETTINGS as any)[category];
    } else {
      this.settings = { ...DEFAULT_SETTINGS };
    }
    this.saveSettings();
    this.notifyListeners();
  }

  // 导出设置
  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  // 导入设置
  importSettings(json: string): boolean {
    try {
      const parsed = JSON.parse(json);
      this.settings = this.mergeSettings(DEFAULT_SETTINGS, parsed);
      this.saveSettings();
      this.notifyListeners();
      return true;
    } catch (e) {
      console.error('导入设置失败:', e);
      return false;
    }
  }

  // 订阅设置变更
  subscribe(listener: (settings: AppSettings) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // 通知监听器
  private notifyListeners(): void {
    const settings = this.getSettings();
    this.listeners.forEach((listener) => listener(settings));
  }

  // 获取 API Key
  getApiKey(provider: string): string | undefined {
    return this.settings.ai.apiKeys[provider];
  }

  // 设置 API Key
  setApiKey(provider: string, key: string): void {
    this.settings.ai.apiKeys[provider] = key;
    this.saveSettings();
  }

  // 删除 API Key
  removeApiKey(provider: string): void {
    delete this.settings.ai.apiKeys[provider];
    this.saveSettings();
  }
}

// 导出单例
export const settingsService = new SettingsService();

// 导出类型
export type {
  AppSettings,
  GeneralSettings,
  AISettings,
  VideoSettings,
  NotificationSettings,
  ShortcutSettings,
  AdvancedSettings,
};

// 导出默认设置
export { DEFAULT_SETTINGS };

export default settingsService;
