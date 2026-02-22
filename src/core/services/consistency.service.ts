/**
 * 一致性服务
 * 确保角色形象在全漫剧中保持一致
 */

import { storageService } from './storage.service';

// 角色定义
export interface Character {
  id: string;
  name: string;
  description: string;
  appearance: {
    gender: 'male' | 'female' | 'unknown';
    age: string;
    hairStyle: string;
    hairColor: string;
    eyeColor: string;
    clothing: string;
    features: string[];
  };
  personality: string[];
  voice?: {
    type: string;
    pitch: string;
    speed: string;
    emotion: string;
  };
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
  characteristics: string[];
}

// 一致性规则
export interface ConsistencyRule {
  type: 'character' | 'scene' | 'timeline' | 'style';
  priority: 'high' | 'medium' | 'low';
  validator: (content: any, context: any) => boolean;
  fixer?: (content: any, context: any) => any;
}

// 一致性检查点
export interface ConsistencyCheckpoint {
  id: string;
  episodeId: string;
  sceneId: string;
  type: 'character' | 'appearance' | 'scene' | 'style';
  status: 'passed' | 'warning' | 'failed';
  issues: ConsistencyIssue[];
  checkedAt: string;
}

// 一致性问题
export interface ConsistencyIssue {
  type: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string;
  autoFixable: boolean;
}

// 角色库
export interface CharacterLibrary {
  projectId: string;
  characters: Character[];
  mainCharacter?: string;
  relationships: Array<{
    from: string;
    to: string;
    type: string;
  }>;
}

class ConsistencyService {
  private characterCache: Map<string, Character> = new Map();
  private styleCache: Map<string, DramaStyle> = new Map();

  /**
   * 创建角色
   */
  createCharacter(characterData: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>): Character {
    const character: Character = {
      ...characterData,
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.characterCache.set(character.id, character);
    return character;
  }

  /**
   * 更新角色
   */
  updateCharacter(id: string, updates: Partial<Character>): Character | null {
    const character = this.characterCache.get(id);
    if (!character) return null;

    const updated = {
      ...character,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.characterCache.set(id, updated);
    return updated;
  }

  /**
   * 获取角色
   */
  getCharacter(id: string): Character | undefined {
    return this.characterCache.get(id);
  }

  /**
   * 获取所有角色
   */
  getAllCharacters(): Character[] {
    return Array.from(this.characterCache.values());
  }

  /**
   * 生成角色提示词
   */
  generateCharacterPrompt(character: Character): string {
    const { appearance, personality } = character;

    return `
角色名称: ${character.name}
性别: ${appearance.gender === 'male' ? '男性' : appearance.gender === 'female' ? '女性' : '未知'}
年龄: ${appearance.age}
发型: ${appearance.hairStyle}，${appearance.hairColor}
眼睛: ${appearance.eyeColor}
服装: ${appearance.clothing}
特征: ${appearance.features.join('，')}
性格: ${personality.join('，')}

重要: 生成时必须严格保持以上特征一致，不得随意改变角色外观。
    `.trim();
  }

  /**
   * 创建漫剧风格
   */
  createDramaStyle(styleData: Omit<DramaStyle, 'id'>): DramaStyle {
    const style: DramaStyle = {
      ...styleData,
      id: `style_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    };

    this.styleCache.set(style.id, style);
    return style;
  }

  /**
   * 获取漫剧风格
   */
  getDramaStyle(id: string): DramaStyle | undefined {
    return this.styleCache.get(id);
  }

  /**
   * 生成漫剧风格提示词
   */
  generateDramaStylePrompt(style: DramaStyle): string {
    const genreMap: Record<string, string> = {
      romance: '浪漫爱情',
      action: '动作冒险',
      comedy: '喜剧搞笑',
      drama: '剧情正剧',
      mystery: '悬疑推理',
      fantasy: '奇幻玄幻'
    };

    const toneMap: Record<string, string> = {
      light: '轻松明快',
      dark: '沉重黑暗',
      neutral: '中性平衡'
    };

    const pacingMap: Record<string, string> = {
      slow: '缓慢细腻',
      normal: '适中流畅',
      fast: '快速紧凑'
    };

    const artStyleMap: Record<string, string> = {
      anime: '日式动漫',
      manga: '漫画风格',
      realistic: '写实风格',
      chibi: 'Q版可爱'
    };

    return `
漫剧风格: ${style.name}
类型: ${genreMap[style.genre]}
基调: ${toneMap[style.tone]}
节奏: ${pacingMap[style.pacing]}
画风: ${artStyleMap[style.artStyle]}

特点: ${style.characteristics.join('，')}

重要: 必须保持以上风格一致，全剧统一使用此漫剧风格。
    `.trim();
  }

  /**
   * 检查角色一致性
   */
  checkCharacterConsistency(
    characterId: string,
    newDescription: string
  ): ConsistencyIssue[] {
    const character = this.getCharacter(characterId);
    if (!character) {
      return [{
        type: 'character_not_found',
        severity: 'error',
        message: '角色不存在',
        suggestion: '请先创建角色',
        autoFixable: false
      }];
    }

    const issues: ConsistencyIssue[] = [];

    // 检查关键特征是否保持一致
    const keyFeatures = [
      ...character.appearance.features,
      character.appearance.hairColor,
      character.appearance.eyeColor
    ];

    for (const feature of keyFeatures) {
      if (!newDescription.includes(feature)) {
        issues.push({
          type: 'missing_feature',
          severity: 'warning',
          message: `描述中缺少特征: ${feature}`,
          suggestion: `确保包含角色特征: ${feature}`,
          autoFixable: true
        });
      }
    }

    return issues;
  }

  /**
   * 检查漫剧风格一致性
   */
  checkDramaStyleConsistency(
    styleId: string,
    sceneDescription: string
  ): ConsistencyIssue[] {
    const style = this.getDramaStyle(styleId);
    if (!style) {
      return [{
        type: 'style_not_found',
        severity: 'error',
        message: '漫剧风格未定义',
        suggestion: '请先创建漫剧风格',
        autoFixable: false
      }];
    }

    const issues: ConsistencyIssue[] = [];

    // 检查画风关键词
    const artStyleKeywords: Record<string, string[]> = {
      anime: ['动漫', 'anime', '日式'],
      manga: ['漫画', 'manga', '黑白'],
      realistic: ['写实', 'realistic', '真实'],
      chibi: ['Q版', 'chibi', '可爱', '大头']
    };

    const keywords = artStyleKeywords[style.artStyle];
    const hasMatchingStyle = keywords.some(kw => sceneDescription.includes(kw));

    if (!hasMatchingStyle) {
      issues.push({
        type: 'art_style_mismatch',
        severity: 'warning',
        message: `场景描述可能不符合${style.artStyle}画风`,
        suggestion: `确保场景使用${style.artStyle}风格描述`,
        autoFixable: false
      });
    }

    return issues;
  }

  /**
   * 自动修复一致性问题
   */
  autoFix(
    content: string,
    issues: ConsistencyIssue[],
    context: { character?: Character; style?: DramaStyle }
  ): string {
    let fixed = content;

    for (const issue of issues) {
      if (!issue.autoFixable) continue;

      switch (issue.type) {
        case 'missing_feature':
          if (context.character) {
            // 添加缺失的特征描述
            fixed = `${fixed} ${context.character.appearance.features.join('，')}`;
          }
          break;
      }
    }

    return fixed;
  }

  /**
   * 拆分长句子
   */
  private splitLongSentences(text: string): string {
    const sentences = text.split(/([。！？.!?])/);
    const result: string[] = [];

    for (let i = 0; i < sentences.length; i += 2) {
      const sentence = sentences[i];
      const punctuation = sentences[i + 1] || '';

      if (sentence.length > 30) {
        // 在逗号处拆分
        const parts = sentence.split(/，/);
        result.push(...parts.map((p, idx) =>
          idx === parts.length - 1 ? p + punctuation : p + '。'
        ));
      } else {
        result.push(sentence + punctuation);
      }
    }

    return result.join('');
  }

  /**
   * 生成一致性报告
   */
  generateConsistencyReport(
    episodeId: string,
    checkpoints: ConsistencyCheckpoint[]
  ): string {
    const failed = checkpoints.filter(c => c.status === 'failed');
    const warnings = checkpoints.filter(c => c.status === 'warning');
    const passed = checkpoints.filter(c => c.status === 'passed');

    return `
# 一致性检查报告

## 概览
- 剧集: ${episodeId}
- 检查时间: ${new Date().toLocaleString('zh-CN')}
- 总检查点: ${checkpoints.length}
- ✅ 通过: ${passed.length}
- ⚠️ 警告: ${warnings.length}
- ❌ 失败: ${failed.length}

## 详细结果

${checkpoints.map(cp => `
### ${cp.sceneId}
- 类型: ${cp.type}
- 状态: ${cp.status === 'passed' ? '✅ 通过' : cp.status === 'warning' ? '⚠️ 警告' : '❌ 失败'}
${cp.issues.map(issue => `
- ${issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️'} ${issue.message}
  - 建议: ${issue.suggestion}
  - 可自动修复: ${issue.autoFixable ? '是' : '否'}
`).join('')}
`).join('\n')}

## 建议
${failed.length > 0 ? '- 优先处理失败项\n' : ''}${warnings.length > 0 ? '- 关注警告项\n' : ''}- 定期检查一致性

---
*报告由 InkMotion 一致性服务生成*
    `.trim();
  }

  /**
   * 保存角色库
   */
  saveCharacterLibrary(projectId: string, library: CharacterLibrary): void {
    storageService.set(`consistency_characters_${projectId}`, library);
  }

  /**
   * 加载角色库
   */
  loadCharacterLibrary(projectId: string): CharacterLibrary | null {
    return storageService.get(`consistency_characters_${projectId}`);
  }

  /**
   * 导出角色参考手册
   */
  exportCharacterHandbook(projectId: string): string {
    const library = this.loadCharacterLibrary(projectId);
    if (!library) return '角色库为空';

    return `
# 角色参考手册

${library.characters.map(char => `
## ${char.name}

### 基本信息
- ID: ${char.id}
- 性别: ${char.appearance.gender === 'male' ? '男' : char.appearance.gender === 'female' ? '女' : '未知'}
- 年龄: ${char.appearance.age}

### 外貌特征
- 发型: ${char.appearance.hairStyle}
- 发色: ${char.appearance.hairColor}
- 眼睛: ${char.appearance.eyeColor}
- 服装: ${char.appearance.clothing}
- 特征: ${char.appearance.features.join('、')}

### 性格特点
${char.personality.map(p => `- ${p}`).join('\n')}

### 生成提示词
\`\`\`
${this.generateCharacterPrompt(char)}
\`\`\`
`).join('\n---\n')}

---
*手册生成时间: ${new Date().toLocaleString('zh-CN')}*
    `.trim();
  }
}

// 导出单例
export const consistencyService = new ConsistencyService();
export default ConsistencyService;

// 导出类型
export type {
  Character,
  DramaStyle,
  ConsistencyRule,
  ConsistencyCheckpoint,
  ConsistencyIssue,
  CharacterLibrary
};
