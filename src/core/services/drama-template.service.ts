/**
 * 漫剧模板服务
 * 管理分镜、角色、场景、风格模板
 */

import { v4 as uuidv4 } from 'uuid';

// ========== 类型定义 ==========

// 漫剧模板类型
export type DramaTemplateType = 'storyboard' | 'character' | 'scene' | 'style' | 'dialogue';

// 分镜模板
export interface StoryboardTemplate {
  id: string;
  name: string;
  description: string;
  genre: string;
  shots: ShotTemplate[];
  transitions: string[];
  duration: number;
  tags: string[];
  usageCount: number;
  createdAt: string;
}

// 镜头模板
export interface ShotTemplate {
  type: 'wide' | 'medium' | 'close' | 'extreme_close' | 'over_shoulder' | 'pov';
  angle: 'eye_level' | 'high' | 'low' | 'dutch' | 'bird' | 'worm';
  movement: 'static' | 'pan' | 'tilt' | 'zoom' | 'track' | 'dolly';
  duration: number;
  description: string;
}

// 场景模板
export interface SceneTemplate {
  id: string;
  name: string;
  description: string;
  genre: string;
  background: string;
  lighting: string;
  mood: string;
  elements: string[];
  tags: string[];
  usageCount: number;
}

// 角色模板
export interface CharacterTemplate {
  id: string;
  name: string;
  description: string;
  appearance: {
    gender: 'male' | 'female' | 'unknown';
    age: string;
    archetype: string; // 角色原型
  };
  personality: string[];
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  tags: string[];
  usageCount: number;
}

// 对话模板
export interface DialogueTemplate {
  id: string;
  name: string;
  description: string;
  genre: string;
  patterns: DialoguePattern[];
  tags: string[];
  usageCount: number;
}

export interface DialoguePattern {
  trigger: string;
  responses: string[];
  emotion: string;
}

// 风格模板
export interface StyleTemplate {
  id: string;
  name: string;
  description: string;
  genre: string;
  artStyle: 'anime' | 'manga' | 'realistic' | 'chibi' | 'western';
  colorPalette: string[];
  lightingStyle: string;
  characteristics: string[];
  tags: string[];
  usageCount: number;
}

// ========== 默认模板 ==========

const DEFAULT_SHOT_TEMPLATES: ShotTemplate[] = [
  { type: 'wide', angle: 'eye_level', movement: 'static', duration: 3, description: '建立场景' },
  { type: 'medium', angle: 'eye_level', movement: 'pan', duration: 2, description: '角色对话' },
  { type: 'close', angle: 'eye_level', movement: 'static', duration: 2, description: '特写表情' },
  { type: 'extreme_close', angle: 'eye_level', movement: 'zoom', duration: 1, description: '强调细节' },
  { type: 'over_shoulder', angle: 'eye_level', movement: 'static', duration: 3, description: '对话视角' }
];

const DEFAULT_STORYBOARD_TEMPLATES: StoryboardTemplate[] = [
  {
    id: 'sb_template_1',
    name: '标准对话',
    description: '标准的双人对话场景分镜',
    genre: 'general',
    shots: [
      { type: 'wide', angle: 'eye_level', movement: 'static', duration: 3, description: '建立场景' },
      { type: 'medium', angle: 'eye_level', movement: 'pan', duration: 4, description: '角色A说话' },
      { type: 'close', angle: 'eye_level', movement: 'static', duration: 2, description: '反应镜头' },
      { type: 'medium', angle: 'eye_level', movement: 'pan', duration: 4, description: '角色B说话' }
    ],
    transitions: ['fade', 'cut', 'dissolve'],
    duration: 15,
    tags: ['对话', '标准', '日常'],
    usageCount: 120
  },
  {
    id: 'sb_template_2',
    name: '动作场景',
    description: '动作打斗场景分镜',
    genre: 'action',
    shots: [
      { type: 'wide', angle: 'high', movement: 'track', duration: 3, description: '远景展示' },
      { type: 'medium', angle: 'eye_level', movement: 'dolly', duration: 2, description: '快速推进' },
      { type: 'close', angle: 'low', movement: 'zoom', duration: 1, description: '特写' },
      { type: 'extreme_close', angle: 'eye_level', movement: 'shake', duration: 0.5, description: '冲击效果' },
      { type: 'wide', angle: 'eye_level', movement: 'static', duration: 2, description: '结果展示' }
    ],
    transitions: ['cut', 'jump_cut', 'smash_cut'],
    duration: 10,
    tags: ['动作', '打斗', '紧张'],
    usageCount: 85
  },
  {
    id: 'sb_template_3',
    name: '情感场景',
    description: '情感表达场景分镜',
    genre: 'emotional',
    shots: [
      { type: 'wide', angle: 'eye_level', movement: 'static', duration: 4, description: '环境氛围' },
      { type: 'medium', angle: 'eye_level', movement: 'tilt', duration: 3, description: '角色反应' },
      { type: 'close', angle: 'eye_level', movement: 'static', duration: 3, description: '面部特写' },
      { type: 'wide', angle: 'low', movement: 'zoom', duration: 4, description: '情感高潮' }
    ],
    transitions: ['fade', 'dissolve', 'emotional_cut'],
    duration: 16,
    tags: ['情感', '感动', '温馨'],
    usageCount: 78
  },
  {
    id: 'sb_template_4',
    name: '悬疑场景',
    description: '悬疑紧张场景分镜',
    genre: 'mystery',
    shots: [
      { type: 'wide', angle: 'low', movement: 'static', duration: 4, description: '阴暗环境' },
      { type: 'medium', angle: 'dutch', movement: 'pan', duration: 3, description: '紧张移动' },
      { type: 'close', angle: 'high', movement: 'zoom', duration: 2, description: '突然发现' },
      { type: 'extreme_close', angle: 'eye_level', movement: 'static', duration: 2, description: '惊恐表情' }
    ],
    transitions: ['cut', 'dark_cut', 'jump_cut'],
    duration: 12,
    tags: ['悬疑', '紧张', '恐怖'],
    usageCount: 62
  }
];

const DEFAULT_SCENE_TEMPLATES: SceneTemplate[] = [
  {
    id: 'scene_template_1',
    name: '室内客厅',
    description: '普通家庭客厅场景',
    genre: 'daily',
    background: '现代公寓客厅，沙发、电视、茶几、落地窗',
    lighting: '自然光+人工光混合，白天明亮',
    mood: '温馨、舒适',
    elements: ['沙发', '茶几', '电视', '窗帘', '植物'],
    tags: ['室内', '日常', '家庭'],
    usageCount: 95
  },
  {
    id: 'scene_template_2',
    name: '学校教室',
    description: '学校教室场景',
    genre: 'education',
    background: '教室内部，黑板、课桌、窗户',
    lighting: '荧光灯，自然光从窗户照入',
    mood: '学习、青春',
    elements: ['黑板', '课桌', '椅子', '书包', '教科书'],
    tags: ['学校', '学习', '青春'],
    usageCount: 72
  },
  {
    id: 'scene_template_3',
    name: '森林',
    description: '自然森林场景',
    genre: 'nature',
    background: '茂密森林，阳光透过树叶',
    lighting: '斑驳的自然光',
    mood: '神秘、宁静',
    elements: ['树木', '草地', '小花', '阳光', '鸟'],
    tags: ['自然', '森林', '户外'],
    usageCount: 68
  }
];

const DEFAULT_CHARACTER_TEMPLATES: CharacterTemplate[] = [
  {
    id: 'char_template_1',
    name: '热血主角',
    description: '积极向上的主角模板',
    appearance: { gender: 'male', age: '青年', archetype: '英雄' },
    personality: ['勇敢', '正直', '坚持', '乐观'],
    role: 'protagonist',
    tags: ['主角', '热血', '正面'],
    usageCount: 110
  },
  {
    id: 'char_template_2',
    name: '温柔女主',
    description: '温柔善良的女性角色模板',
    appearance: { gender: 'female', age: '青年', archetype: '情人' },
    personality: ['温柔', '善良', '坚强', '体贴'],
    role: 'protagonist',
    tags: ['女主', '温柔', '女性'],
    usageCount: 98
  },
  {
    id: 'char_template_3',
    name: '反派BOSS',
    description: '强大神秘的反派模板',
    appearance: { gender: 'unknown', age: '中年', archetype: '阴影' },
    personality: ['冷酷', '强大', '神秘', '野心勃勃'],
    role: 'antagonist',
    tags: ['反派', 'BOSS', '强大'],
    usageCount: 75
  }
];

const DEFAULT_STYLE_TEMPLATES: StyleTemplate[] = [
  {
    id: 'style_template_1',
    name: '日式动漫',
    description: '经典日式动漫风格',
    genre: 'anime',
    artStyle: 'anime',
    colorPalette: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
    lightingStyle: '明亮鲜艳',
    characteristics: ['大头', '尖下巴', '大大眼睛', '多彩发色'],
    tags: ['日漫', '动漫', '经典'],
    usageCount: 150
  },
  {
    id: 'style_template_2',
    name: '美式漫画',
    description: '美式漫画风格',
    genre: 'comic',
    artStyle: 'western',
    colorPalette: ['#2C3E50', '#E74C3C', '#3498DB', '#F39C12'],
    lightingStyle: '高对比度',
    characteristics: ['肌肉线条', '硬朗轮廓', '鲜艳色彩', '网点'],
    tags: ['美漫', '超级英雄', '动作'],
    usageCount: 88
  },
  {
    id: 'style_template_3',
    name: '水彩漫画',
    description: '清新水彩风格',
    genre: 'artistic',
    artStyle: 'manga',
    colorPalette: ['#FFE4E1', '#E0FFFF', '#FFF0F5', '#F0FFF0'],
    lightingStyle: '柔和温暖',
    characteristics: ['水彩晕染', '柔和边缘', '淡雅色彩', '梦幻'],
    tags: ['水彩', '艺术', '唯美'],
    usageCount: 65
  }
];

// ========== 服务类 ==========

class DramaTemplateService {
  private storyboardTemplates: StoryboardTemplate[] = [...DEFAULT_STORYBOARD_TEMPLATES];
  private sceneTemplates: SceneTemplate[] = [...DEFAULT_SCENE_TEMPLATES];
  private characterTemplates: CharacterTemplate[] = [...DEFAULT_CHARACTER_TEMPLATES];
  private styleTemplates: StyleTemplate[] = [...DEFAULT_STYLE_TEMPLATES];
  private dialogueTemplates: DialogueTemplate[] = [];

  constructor() {
    this.loadFromStorage();
  }

  // ========== 分镜模板 ==========

  /**
   * 获取所有分镜模板
   */
  getStoryboardTemplates(genre?: string): StoryboardTemplate[] {
    if (genre) {
      return this.storyboardTemplates.filter(t => t.genre === genre);
    }
    return [...this.storyboardTemplates].sort((a, b) => b.usageCount - a.usageCount);
  }

  /**
   * 获取分镜模板
   */
  getStoryboardTemplate(id: string): StoryboardTemplate | undefined {
    return this.storyboardTemplates.find(t => t.id === id);
  }

  /**
   * 添加分镜模板
   */
  addStoryboardTemplate(template: Omit<StoryboardTemplate, 'id' | 'usageCount' | 'createdAt'>): StoryboardTemplate {
    const newTemplate: StoryboardTemplate = {
      ...template,
      id: `sb_${uuidv4().slice(0, 8)}`,
      usageCount: 0,
      createdAt: new Date().toISOString()
    };
    this.storyboardTemplates.push(newTemplate);
    this.saveToStorage();
    return newTemplate;
  }

  /**
   * 使用分镜模板
   */
  useStoryboardTemplate(id: string): StoryboardTemplate | undefined {
    const template = this.storyboardTemplates.find(t => t.id === id);
    if (template) {
      template.usageCount++;
      this.saveToStorage();
    }
    return template;
  }

  // ========== 场景模板 ==========

  /**
   * 获取所有场景模板
   */
  getSceneTemplates(genre?: string): SceneTemplate[] {
    if (genre) {
      return this.sceneTemplates.filter(t => t.genre === genre);
    }
    return [...this.sceneTemplates].sort((a, b) => b.usageCount - a.usageCount);
  }

  /**
   * 获取场景模板
   */
  getSceneTemplate(id: string): SceneTemplate | undefined {
    return this.sceneTemplates.find(t => t.id === id);
  }

  /**
   * 添加场景模板
   */
  addSceneTemplate(template: Omit<SceneTemplate, 'id' | 'usageCount'>): SceneTemplate {
    const newTemplate: SceneTemplate = {
      ...template,
      id: `scene_${uuidv4().slice(0, 8)}`,
      usageCount: 0
    };
    this.sceneTemplates.push(newTemplate);
    this.saveToStorage();
    return newTemplate;
  }

  // ========== 角色模板 ==========

  /**
   * 获取所有角色模板
   */
  getCharacterTemplates(role?: string): CharacterTemplate[] {
    if (role) {
      return this.characterTemplates.filter(t => t.role === role);
    }
    return [...this.characterTemplates].sort((a, b) => b.usageCount - a.usageCount);
  }

  /**
   * 获取角色模板
   */
  getCharacterTemplate(id: string): CharacterTemplate | undefined {
    return this.characterTemplates.find(t => t.id === id);
  }

  /**
   * 添加角色模板
   */
  addCharacterTemplate(template: Omit<CharacterTemplate, 'id' | 'usageCount'>): CharacterTemplate {
    const newTemplate: CharacterTemplate = {
      ...template,
      id: `char_${uuidv4().slice(0, 8)}`,
      usageCount: 0
    };
    this.characterTemplates.push(newTemplate);
    this.saveToStorage();
    return newTemplate;
  }

  // ========== 风格模板 ==========

  /**
   * 获取所有风格模板
   */
  getStyleTemplates(genre?: string): StyleTemplate[] {
    if (genre) {
      return this.styleTemplates.filter(t => t.genre === genre);
    }
    return [...this.styleTemplates].sort((a, b) => b.usageCount - a.usageCount);
  }

  /**
   * 获取风格模板
   */
  getStyleTemplate(id: string): StyleTemplate | undefined {
    return this.styleTemplates.find(t => t.id === id);
  }

  /**
   * 添加风格模板
   */
  addStyleTemplate(template: Omit<StyleTemplate, 'id' | 'usageCount'>): StyleTemplate {
    const newTemplate: StyleTemplate = {
      ...template,
      id: `style_${uuidv4().slice(0, 8)}`,
      usageCount: 0
    };
    this.styleTemplates.push(newTemplate);
    this.saveToStorage();
    return newTemplate;
  }

  // ========== 存储 ==========

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('dramaTemplates');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.storyboards) this.storyboardTemplates = [...this.storyboardTemplates, ...data.storyboards];
        if (data.scenes) this.sceneTemplates = [...this.sceneTemplates, ...data.scenes];
        if (data.characters) this.characterTemplates = [...this.characterTemplates, ...data.characters];
        if (data.styles) this.styleTemplates = [...this.styleTemplates, ...data.styles];
      }
    } catch (e) {
      console.error('加载模板失败:', e);
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        storyboards: this.storyboardTemplates.filter(t => t.id.startsWith('sb_')),
        scenes: this.sceneTemplates.filter(t => t.id.startsWith('scene_')),
        characters: this.characterTemplates.filter(t => t.id.startsWith('char_')),
        styles: this.styleTemplates.filter(t => t.id.startsWith('style_'))
      };
      localStorage.setItem('dramaTemplates', JSON.stringify(data));
    } catch (e) {
      console.error('保存模板失败:', e);
    }
  }

  /**
   * 生成模板使用报告
   */
  generateUsageReport(): string {
    const totalUsage = 
      this.storyboardTemplates.reduce((sum, t) => sum + t.usageCount, 0) +
      this.sceneTemplates.reduce((sum, t) => sum + t.usageCount, 0) +
      this.characterTemplates.reduce((sum, t) => sum + t.usageCount, 0) +
      this.styleTemplates.reduce((sum, t) => sum + t.usageCount, 0);

    const topStoryboard = [...this.storyboardTemplates].sort((a, b) => b.usageCount - a.usageCount)[0];
    const topScene = [...this.sceneTemplates].sort((a, b) => b.usageCount - a.usageCount)[0];
    const topStyle = [...this.styleTemplates].sort((a, b) => b.usageCount - a.usageCount)[0];

    return `# 模板使用报告

## 概览
- 总使用次数: ${totalUsage}
- 分镜模板: ${this.storyboardTemplates.length} 个
- 场景模板: ${this.sceneTemplates.length} 个
- 角色模板: ${this.characterTemplates.length} 个
- 风格模板: ${this.styleTemplates.length} 个

## 最常用模板

### 分镜模板
- 名称: ${topStoryboard?.name || '无'}
- 使用次数: ${topStoryboard?.usageCount || 0}

### 场景模板
- 名称: ${topScene?.name || '无'}
- 使用次数: ${topScene?.usageCount || 0}

### 风格模板
- 名称: ${topStyle?.name || '无'}
- 使用次数: ${topStyle?.usageCount || 0}

---
*报告生成时间: ${new Date().toLocaleString('zh-CN')}*`;
  }
}

// 导出单例
export const dramaTemplateService = new DramaTemplateService();
export default DramaTemplateService;

// 导出类型
export type {
  StoryboardTemplate,
  ShotTemplate,
  SceneTemplate,
  CharacterTemplate,
  DialogueTemplate,
  DialoguePattern,
  StyleTemplate,
  DramaTemplateType
};
