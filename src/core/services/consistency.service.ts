/**
 * 一致性服务
 * 确保角色形象和解说风格在全剧中保持一致
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

// 解说风格
export interface NarrationStyle {
  id: string;
  name: string;
  tone: 'professional' | 'casual' | 'dramatic' | 'humorous' | 'mysterious';
  speed: 'slow' | 'normal' | 'fast';
  emotion: 'neutral' | 'warm' | 'excited' | 'calm' | 'tense';
  vocabulary: 'simple' | 'standard' | 'rich';
  sentenceStructure: 'short' | 'mixed' | 'complex';
  characteristics: string[];
  examples: string[];
}

// 一致性规则
export interface ConsistencyRule {
  type: 'character' | 'narration' | 'scene' | 'timeline';
  priority: 'high' | 'medium' | 'low';
  validator: (content: any, context: any) => boolean;
  fixer?: (content: any, context: any) => any;
}

// 一致性检查点
export interface ConsistencyCheckpoint {
  id: string;
  episodeId: string;
  sceneId: string;
  type: 'character' | 'appearance' | 'voice' | 'narration' | 'scene';
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
  private styleCache: Map<string, NarrationStyle> = new Map();

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
   * 创建解说风格
   */
  createNarrationStyle(styleData: Omit<NarrationStyle, 'id'>): NarrationStyle {
    const style: NarrationStyle = {
      ...styleData,
      id: `style_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    };

    this.styleCache.set(style.id, style);
    return style;
  }

  /**
   * 获取解说风格
   */
  getNarrationStyle(id: string): NarrationStyle | undefined {
    return this.styleCache.get(id);
  }

  /**
   * 生成解说提示词
   */
  generateNarrationPrompt(style: NarrationStyle): string {
    const toneMap: Record<string, string> = {
      professional: '专业严谨',
      casual: '轻松随意',
      dramatic: '戏剧张力',
      humorous: '幽默风趣',
      mysterious: '神秘悬疑'
    };

    const speedMap: Record<string, string> = {
      slow: '缓慢沉稳',
      normal: '适中流畅',
      fast: '快速紧凑'
    };

    const emotionMap: Record<string, string> = {
      neutral: '中性客观',
      warm: '温暖亲切',
      excited: '兴奋激动',
      calm: '平静舒缓',
      tense: '紧张刺激'
    };

    return `
解说风格: ${style.name}
语气: ${toneMap[style.tone]}
语速: ${speedMap[style.speed]}
情感: ${emotionMap[style.emotion]}
词汇: ${style.vocabulary === 'simple' ? '简洁明了' : style.vocabulary === 'standard' ? '标准规范' : '丰富华丽'}
句式: ${style.sentenceStructure === 'short' ? '简短有力' : style.sentenceStructure === 'mixed' ? '长短结合' : '复杂优美'}

特点: ${style.characteristics.join('，')}

示例:
${style.examples.map((ex, i) => `${i + 1}. ${ex}`).join('\n')}

重要: 必须保持以上风格一致，全剧统一使用此解说风格。
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
   * 检查解说一致性
   */
  checkNarrationConsistency(
    styleId: string,
    narrationText: string
  ): ConsistencyIssue[] {
    const style = this.getNarrationStyle(styleId);
    if (!style) {
      return [{
        type: 'style_not_found',
        severity: 'error',
        message: '解说风格未定义',
        suggestion: '请先创建解说风格',
        autoFixable: false
      }];
    }

    const issues: ConsistencyIssue[] = [];

    // 检查词汇复杂度
    const wordCount = narrationText.split(/\s+/).length;
    const avgWordLength = narrationText.length / wordCount;

    if (style.vocabulary === 'simple' && avgWordLength > 5) {
      issues.push({
        type: 'vocabulary_too_complex',
        severity: 'warning',
        message: '词汇过于复杂，不符合简洁风格',
        suggestion: '使用更简单的词汇',
        autoFixable: false
      });
    }

    // 检查句子长度
    const sentences = narrationText.split(/[。！？.!?]/).filter(s => s.trim());
    const avgSentenceLength = wordCount / sentences.length;

    if (style.sentenceStructure === 'short' && avgSentenceLength > 15) {
      issues.push({
        type: 'sentence_too_long',
        severity: 'warning',
        message: '句子过长，不符合简短风格',
        suggestion: '拆分为更短的句子',
        autoFixable: true
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
    context: { character?: Character; style?: NarrationStyle }
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

        case 'sentence_too_long':
          // 尝试拆分长句
          fixed = this.splitLongSentences(fixed);
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
*报告由 CineCraft 一致性服务生成*
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
  NarrationStyle,
  ConsistencyRule,
  ConsistencyCheckpoint,
  ConsistencyIssue,
  CharacterLibrary
};
