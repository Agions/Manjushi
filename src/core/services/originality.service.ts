/**
 * 原创性检测服务
 * 内容指纹 + 语义去重 + 模板检测
 */

import { v4 as uuidv4 } from 'uuid';

// ========== 类型定义 ==========

// 原创性检测配置
export interface OriginalityConfig {
  enableFingerprint: boolean;    // 内容指纹
  enableSemanticDedup: boolean;  // 语义去重
  enableTemplateCheck: boolean;  // 模板检测
  similarityThreshold: number;   // 相似度阈值 (0-1)
  minContentLength: number;      // 最小内容长度
}

// 原创性检测结果
export interface OriginalityResult {
  id: string;
  score: number;                 // 原创性分数 (0-100)
  isOriginal: boolean;            // 是否通过
  checks: OriginalityCheck[];
  fingerprint?: string;          // 内容指纹
  checkedAt: string;
}

// 单项检查结果
export interface OriginalityCheck {
  type: 'fingerprint' | 'semantic' | 'template';
  status: 'passed' | 'warning' | 'failed';
  score: number;
  message: string;
  details?: any;
}

// 内容指纹
export interface ContentFingerprint {
  id: string;
  hash: string;
  content: string;
  wordCount: number;
  createdAt: string;
}

// 模板匹配结果
export interface TemplateMatch {
  templateId: string;
  templateName: string;
  matchedSegments: string[];
  similarity: number;
}

// 语义相似结果
export interface SemanticSimilarity {
  targetId: string;
  targetPreview: string;
  similarity: number;
  matchedChunks: string[];
}

// ========== 哈希算法 ==========

// MurmurHash3 简单实现
function murmurhash3(key: string, seed: number = 0): number {
  const chars = key.split('').map(c => c.charCodeAt(0));
  let h1 = seed ^ chars.length;
  let h2 = seed ^ chars.length;
  let h3 = seed ^ chars.length;
  let h4 = seed ^ chars.length;

  for (let i = 0; i < chars.length; i++) {
    h1 = Math.imul(h1 ^ chars[i], 3432918353);
    h1 = h1 << 15 | h1 >>> 17;
    h2 = Math.imul(h2 ^ chars[i], 461845907);
    h2 = h2 << 13 | h2 >>> 19;
    h3 = Math.imul(h3 ^ chars[i], 2246822507);
    h3 = h3 << 16 | h3 >>> 16;
    h4 = Math.imul(h4 ^ chars[i], 3266489909);
    h4 = h4 << 17 | h4 >>> 15;
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 597399067);
  h1 = h1 << 15 | h1 >>> 17;
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2869860233);
  h2 = h2 << 13 | h2 >>> 19;
  h3 = Math.imul(h3 ^ (h3 >>> 16), 951274213);
  h3 = h3 << 15 | h3 >>> 17;
  h4 = Math.imul(h4 ^ (h4 >>> 16), 2716044179);
  h4 = h4 << 17 | h4 >>> 15;

  h1 ^= h2 ^ h3 ^ h4;
  h2 ^= h1 ^ h3 ^ h4;
  h3 ^= h1 ^ h2 ^ h4;
  h4 ^= h1 ^ h2 ^ h3;

  return Math.abs((h1 << 0) | (h2 << 1) | (h3 << 2) | (h4 << 3));
}

// 内容指纹生成
function generateFingerprint(content: string): string {
  // 1. 标准化内容
  const normalized = content
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5]/g, '') // 去除特殊字符
    .replace(/\s+/g, ' ')                   // 合并空格
    .trim();

  // 2. 生成 n-gram
  const n = 5;
  const ngrams: string[] = [];
  for (let i = 0; i <= normalized.length - n; i++) {
    ngrams.push(normalized.slice(i, i + n));
  }

  // 3. 计算哈希
  const hash = ngrams.reduce((acc, gram, idx) => {
    return acc + murmurhash3(gram, idx);
  }, 0);

  // 4. 转换为 62 进制字符串
  const hashStr = hash.toString(36);
  return hashStr.slice(0, 16); // 取前16位
}

// ========== 文本相似度 ==========

// 简单文本相似度 (Jaccard + 编辑距离)
function calculateSimilarity(text1: string, text2: string): number {
  // 词级分词
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  // Jaccard 相似度
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  const jaccard = intersection.size / union.size;

  // 字符级相似度
  const charSet1 = new Set(text1.replace(/\s/g, ''));
  const charSet2 = new Set(text2.replace(/\s/g, ''));
  const charIntersection = new Set([...charSet1].filter(x => charSet2.has(x)));
  const charUnion = new Set([...charSet1, ...charSet2]);
  const charJaccard = charIntersection.size / charUnion.size;

  // 综合相似度
  return (jaccard * 0.6 + charJaccard * 0.4);
}

// ========== 模板定义 ==========

// 常见模板模式
const TEMPLATE_PATTERNS = [
  {
    id: 'template_1',
    name: '标准对话模板',
    patterns: [
      'xxx说道：',
      'xxx回答：',
      'xxx笑着说：',
      'xxx问道：',
      'xxx大声说：',
      '「xxx」'
    ],
    weight: 0.1
  },
  {
    id: 'template_2',
    name: '场景转换模板',
    patterns: [
      '镜头切换到',
      '画面一转',
      '时间过得很快',
      '突然',
      '就在这时',
      '紧接着'
    ],
    weight: 0.15
  },
  {
    id: 'template_3',
    name: '描写模板',
    patterns: [
      '只见',
      '看来',
      '众所周知',
      '很明显',
      '事实上',
      '一般来说'
    ],
    weight: 0.12
  },
  {
    id: 'template_4',
    name: '情绪描写模板',
    patterns: [
      'xxx非常高兴',
      'xxx心里很感动',
      'xxx脸色苍白',
      'xxx深吸一口气',
      'xxx微微一笑',
      'xxx皱起眉头'
    ],
    weight: 0.15
  }
];

// ========== 服务类 ==========

class OriginalityService {
  private fingerprintCache: Map<string, ContentFingerprint> = new Map();
  private config: OriginalityConfig = {
    enableFingerprint: true,
    enableSemanticDedup: true,
    enableTemplateCheck: true,
    similarityThreshold: 0.7,
    minContentLength: 50
  };

  /**
   * 设置配置
   */
  setConfig(config: Partial<OriginalityConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取配置
   */
  getConfig(): OriginalityConfig {
    return { ...this.config };
  }

  /**
   * 检测原创性
   */
  async checkOriginality(content: string): Promise<OriginalityResult> {
    const id = uuidv4();
    const checks: OriginalityCheck[] = [];
    let totalScore = 100;

    // 检查内容长度
    if (content.length < this.config.minContentLength) {
      return {
        id,
        score: 0,
        isOriginal: false,
        checks: [{
          type: 'fingerprint',
          status: 'failed',
          score: 0,
          message: `内容过短 (${content.length} 字符)，需要至少 ${this.config.minContentLength} 字符`
        }],
        checkedAt: new Date().toISOString()
      };
    }

    // 1. 内容指纹检查
    if (this.config.enableFingerprint) {
      const fingerprintCheck = await this.checkFingerprint(content);
      checks.push(fingerprintCheck);
      totalScore -= (1 - fingerprintCheck.score) * 30;
    }

    // 2. 语义去重检查
    if (this.config.enableSemanticDedup) {
      const semanticCheck = await this.checkSemanticDedup(content);
      checks.push(semanticCheck);
      totalScore -= (1 - semanticCheck.score) * 40;
    }

    // 3. 模板检测
    if (this.config.enableTemplateCheck) {
      const templateCheck = this.checkTemplate(content);
      checks.push(templateCheck);
      totalScore -= (1 - templateCheck.score) * 30;
    }

    // 最终分数
    const finalScore = Math.max(0, Math.min(100, Math.round(totalScore)));

    return {
      id,
      score: finalScore,
      isOriginal: finalScore >= 60,
      checks,
      fingerprint: generateFingerprint(content),
      checkedAt: new Date().toISOString()
    };
  }

  /**
   * 内容指纹检查
   */
  private async checkFingerprint(content: string): Promise<OriginalityCheck> {
    const fingerprint = generateFingerprint(content);

    // 检查是否已存在相同指纹
    for (const [, existing] of this.fingerprintCache) {
      if (existing.hash === fingerprint) {
        return {
          type: 'fingerprint',
          status: 'failed',
          score: 0,
          message: '内容与已有内容完全重复',
          details: { fingerprint }
        };
      }
    }

    // 保存指纹
    this.fingerprintCache.set(fingerprint, {
      id: uuidv4(),
      hash: fingerprint,
      content: content.slice(0, 100), // 只保存前100字符
      wordCount: content.length,
      createdAt: new Date().toISOString()
    });

    return {
      type: 'fingerprint',
      status: 'passed',
      score: 1,
      message: '内容指纹检查通过',
      details: { fingerprint }
    };
  }

  /**
   * 语义去重检查
   */
  private async checkSemanticDedup(content: string): Promise<OriginalityCheck> {
    const similarities: SemanticSimilarity[] = [];

    // 检查与已有内容的相似度
    for (const [, existing] of this.fingerprintCache) {
      const similarity = calculateSimilarity(content, existing.content);
      
      if (similarity > 0.3) {
        similarities.push({
          targetId: existing.id,
          targetPreview: existing.content.slice(0, 50) + '...',
          similarity,
          matchedChunks: []
        });
      }
    }

    // 找到最高相似度
    const maxSimilarity = similarities.length > 0 
      ? Math.max(...similarities.map(s => s.similarity))
      : 0;

    if (maxSimilarity >= this.config.similarityThreshold) {
      return {
        type: 'semantic',
        status: 'failed',
        score: 1 - maxSimilarity,
        message: `与已有内容高度相似 (${Math.round(maxSimilarity * 100)}%)`,
        details: { similarities: similarities.slice(0, 3) }
      };
    }

    if (maxSimilarity > 0.3) {
      return {
        type: 'semantic',
        status: 'warning',
        score: 1 - maxSimilarity,
        message: `与已有内容存在一定相似度 (${Math.round(maxSimilarity * 100)}%)`,
        details: { similarities: similarities.slice(0, 3) }
      };
    }

    return {
      type: 'semantic',
      status: 'passed',
      score: 1,
      message: '语义相似度检查通过',
      details: { maxSimilarity }
    };
  }

  /**
   * 模板检测
   */
  private checkTemplate(content: string): OriginalityCheck {
    const matches: TemplateMatch[] = [];
    let templateScore = 1;

    for (const template of TEMPLATE_PATTERNS) {
      const matchedSegments: string[] = [];
      
      for (const pattern of template.patterns) {
        const regex = new RegExp(pattern, 'gi');
        const matches_count = (content.match(regex) || []).length;
        
        if (matches_count > 0) {
          matchedSegments.push(pattern);
          templateScore -= template.weight * (matches_count / 10);
        }
      }

      if (matchedSegments.length > 0) {
        matches.push({
          templateId: template.id,
          templateName: template.name,
          matchedSegments,
          similarity: 1 - templateScore
        });
      }
    }

    templateScore = Math.max(0, templateScore);

    if (templateScore < 0.5) {
      return {
        type: 'template',
        status: 'warning',
        score: templateScore,
        message: '检测到较多模板化内容',
        details: { matches }
      };
    }

    return {
      type: 'template',
      status: 'passed',
      score: templateScore,
      message: '模板检测通过',
      details: { matches }
    };
  }

  /**
   * 批量检查
   */
  async checkBatch(contents: string[]): Promise<OriginalityResult[]> {
    const results: OriginalityResult[] = [];
    
    for (const content of contents) {
      const result = await this.checkOriginality(content);
      results.push(result);
    }
    
    return results;
  }

  /**
   * 获取指纹历史
   */
  getFingerprintHistory(): ContentFingerprint[] {
    return Array.from(this.fingerprintCache.values());
  }

  /**
   * 清理指纹缓存
   */
  clearCache(): void {
    this.fingerprintCache.clear();
  }

  /**
   * 导出检测报告
   */
  generateReport(result: OriginalityResult): string {
    const status = result.isOriginal ? '✅ 通过' : '❌ 未通过';
    
    let report = `# 原创性检测报告

## 概览
- 检测ID: ${result.id}
- 原创性分数: ${result.score}/100
- 状态: ${status}
- 检测时间: ${new Date(result.checkedAt).toLocaleString('zh-CN')}

## 检查结果

`;

    for (const check of result.checks) {
      const checkStatus = check.status === 'passed' ? '✅' : check.status === 'warning' ? '⚠️' : '❌';
      report += `### ${checkStatus} ${check.type.toUpperCase()} - ${check.message}
- 得分: ${Math.round(check.score * 100)}/100
`;
    }

    report += `
## 建议
${result.score < 60 ? '- 内容重复度过高，建议重新创作\n' : ''}
${result.checks.some(c => c.status === 'warning') ? '- 部分内容可进一步优化\n' : ''}
- 建议保持内容的独特性和创新性

---
*报告由 ClipAiMan 原创性检测服务生成*
`;

    return report;
  }
}

// 导出单例
export const originalityService = new OriginalityService();
export default OriginalityService;
