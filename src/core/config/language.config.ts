/**
 * 语言配置
 * 集中管理多语言支持配置
 */

import type { Language } from '../../utils/i18n';

// 支持的语言列表
export const SUPPORTED_LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'en', name: 'English', nativeName: 'English' }
];

// 默认语言配置
export const DEFAULT_LANGUAGE: Language = 'zh';

// 语言存储键名
export const LANGUAGE_STORAGE_KEY = 'app_language';

// 语言切换配置
export const LANGUAGE_CONFIG = {
  // 是否记住用户的选择
  rememberPreference: true,
  // 是否根据浏览器语言自动选择
  autoDetectBrowserLanguage: true,
  // 是否显示语言切换UI
  showLanguageSwitcher: true,
  // 支持的语言
  supported: SUPPORTED_LANGUAGES,
  // 默认语言
  default: DEFAULT_LANGUAGE
} as const;

// 获取浏览器推荐语言
export function getBrowserLanguage(): Language {
  const navigatorLang = navigator.language.toLowerCase();
  return navigatorLang.startsWith('zh') ? 'zh' : 'en';
}

// 获取存储的语言设置
export function getStoredLanguage(): Language | null {
  if (typeof localStorage === 'undefined') return null;
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === 'zh' || stored === 'en') {
    return stored;
  }
  return null;
}

// 保存语言设置
export function setStoredLanguage(lang: Language): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

// 获取初始语言（优先级：存储 > 浏览器 > 默认）
export function getInitialLanguage(): Language {
  const stored = getStoredLanguage();
  if (stored) return stored;
  
  if (LANGUAGE_CONFIG.autoDetectBrowserLanguage) {
    return getBrowserLanguage();
  }
  
  return DEFAULT_LANGUAGE;
}
