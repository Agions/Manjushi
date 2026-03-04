/**
 * 统一类型定义
 * 角色一致性服务使用的核心类型
 */

// 角色外观特征
export interface CharacterAppearance {
  gender: 'male' | 'female' | 'unknown';
  age: string;
  hairStyle: string;
  hairColor: string;
  eyeColor: string;
  eyeShape: string;
  clothing: string;
  features: string[];
  bodyType: string;
  height: string;
}

// 角色表情系统
export interface CharacterExpressions {
  happy: string;
  sad: string;
  angry: string;
  surprised: string;
  neutral: string;
  custom: Record<string, string>;
}

// 角色声音配置
export interface CharacterVoice {
  type: string;
  pitch: string;
  speed: string;
  emotion: string;
  tone: string;
  referenceAudio?: string;
}

// 完整角色定义
export interface Character {
  id: string;
  name: string;
  description: string;
  appearance: CharacterAppearance;
  personality: string[];
  expressions: CharacterExpressions;
  voice?: CharacterVoice;
  referenceImages: string[];
  createdAt: string;
  updatedAt: string;
}

// 漫剧风格
export interface DramaStyle {
  id: string;
  name: string;
  genre: 'romance' | 'action' | 'comedy' | 'drama' | 'mystery' | 'fantasy';
  tone: 'light' | 'dark' | 'neutral';
  pacing: 'slow' | 'normal' | 'fast';
  artStyle: 'anime' | 'manga' | 'realistic' | 'chibi';
  colorPalette: string[];
  lightingStyle: string;
  characteristics: string[];
  basePrompt: string;
}

// 一致性问题
export interface ConsistencyIssue {
  type: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string;
  autoFixable: boolean;
  relatedFeatures?: string[];
}

// 一致性检查结果
export interface ConsistencyCheckResult {
  characterId: string;
  isConsistent: boolean;
  score: number; // 0-100
  issues: ConsistencyIssue[];
  checkedAt: string;
}

// 角色库
export interface CharacterLibrary {
  projectId: string;
  characters: Character[];
  mainCharacter?: string;
  dramaStyle?: DramaStyle;
  relationships: Array<{
    from: string;
    to: string;
    type: string;
  }>;
}

// AI 验证请求
export interface AIValidationRequest {
  character: Character;
  content: string;
  type: 'appearance' | 'expression' | 'action' | 'scene';
  context?: Record<string, any>;
}

// AI 验证响应
export interface AIValidationResponse {
  isConsistent: boolean;
  confidence: number;
  issues: ConsistencyIssue[];
  suggestions: string[];
}

// 表情映射常量
export const EXPRESSION_PROMPTS: Record<string, string> = {
  happy: '笑容灿烂，眼睛眯成月牙状，嘴角上扬，露出牙齿，整体欢乐愉悦',
  sad: '忧郁，嘴角下垂，面色眉头微皱，眼神苍白，整体悲伤低沉',
  angry: '眉头紧锁，眼睛瞪大，嘴角紧抿，面色阴沉，整体愤怒不满',
  surprised: '眼睛瞪大，嘴巴微张，眉毛上扬，整体惊讶震撼',
  neutral: '表情自然放松，眼神平和，嘴唇自然闭合，整体平静温和',
  thinking: '眼睛微眯，手指轻抚下巴，眉头微皱，整体陷入思考',
  afraid: '眼睛瞪大，嘴巴张大，面色苍白，身体微微颤抖，整体惊恐害怕',
  embarrassed: '脸颊微红，眼神躲闪，挠头摸脸，整体尴尬不好意思',
  confused: '眼睛迷茫，眉头扭曲，嘴巴歪斜，整体困惑不解',
  laughing: '开怀大笑，眼睛眯成缝，嘴巴大张，整体大笑不止'
};

// 画风关键词映射
export const ART_STYLE_KEYWORDS: Record<string, string[]> = {
  anime: ['动漫', 'anime', '日式', '二次元'],
  manga: ['漫画', 'manga', '黑白', '少年漫'],
  realistic: ['写实', 'realistic', '真实', '真人'],
  chibi: ['Q版', 'chibi', '可爱', '大头', '萌系']
};
