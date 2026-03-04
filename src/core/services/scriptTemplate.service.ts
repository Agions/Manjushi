/**
 * 脚本模板服务
 * 管理解说脚本模板
 */
import type { ScriptTemplate } from '@/core/types';

export const DEFAULT_TEMPLATES: ScriptTemplate[] = [
  {
    id: 'template_1',
    name: '专业解说',
    description: '正式专业的解说风格，适合知识类、科普类内容',
    category: 'professional',
    tags: ['知识', '科普', '正式'],
    structure: [
      { type: 'intro', name: '开场', duration: 10, description: '介绍主题' },
      { type: 'hook', name: '引入', duration: 5, description: '吸引观众' },
      { type: 'body', name: '主体', duration: 60, description: '核心内容' },
      { type: 'conclusion', name: '总结', duration: 10, description: '总结要点' },
      { type: 'cta', name: '引导', duration: 5, description: '引导互动' }
    ],
    style: {
      tone: 'professional',
      pace: 'medium',
      formality: 'formal'
    },
    examples: ['大家好，今天我们来探讨...'],
    popularity: 95
  },
  {
    id: 'template_2',
    name: '轻松休闲',
    description: '轻松幽默的解说风格，适合娱乐类、搞笑类内容',
    category: 'casual',
    tags: ['搞笑', '娱乐', '轻松'],
    structure: [
      { type: 'hook', name: '开场', duration: 8, description: '幽默开场' },
      { type: 'body', name: '主体', duration: 55, description: '轻松内容' },
      { type: 'conclusion', name: '结尾', duration: 7, description: '轻松结尾' }
    ],
    style: {
      tone: 'friendly',
      pace: 'fast',
      formality: 'casual'
    },
    examples: ['哈喽各位，今天给大家带来...'],
    popularity: 88
  },
  {
    id: 'template_3',
    name: '故事叙述',
    description: '讲故事的解说风格，适合剧情类、情感类内容',
    category: 'story',
    tags: ['故事', '剧情', '情感'],
    structure: [
      { type: 'hook', name: '引入', duration: 10, description: '设置悬念' },
      { type: 'body', name: '发展', duration: 50, description: '故事展开' },
      { type: 'transition', name: '高潮', duration: 15, description: '情感高潮' },
      { type: 'conclusion', name: '结局', duration: 10, description: '故事结局' }
    ],
    style: {
      tone: 'emotional',
      pace: 'slow',
      formality: 'neutral'
    },
    examples: ['在那个遥远的年代，有一个传说...'],
    popularity: 76
  },
  {
    id: 'template_4',
    name: '游戏解说',
    description: '激情澎湃的游戏解说风格，适合游戏类内容',
    category: 'gaming',
    tags: ['游戏', '电竞', '激情'],
    structure: [
      { type: 'hook', name: '开场', duration: 5, description: '激情开场' },
      { type: 'body', name: '实战', duration: 65, description: '游戏内容' },
      { type: 'conclusion', name: '总结', duration: 5, description: '赛后总结' }
    ],
    style: {
      tone: 'excited',
      pace: 'fast',
      formality: 'casual'
    },
    examples: ['这波操作太秀了！兄弟们看好了...'],
    popularity: 82
  },
  {
    id: 'template_5',
    name: '影评风格',
    description: '专业的影评解说风格，适合电影类内容',
    category: 'review',
    tags: ['电影', '影评', '专业'],
    structure: [
      { type: 'intro', name: '引入', duration: 8, description: '电影介绍' },
      { type: 'body', name: '分析', duration: 55, description: '深度分析' },
      { type: 'conclusion', name: '总结', duration: 12, description: '总结评价' }
    ],
    style: {
      tone: 'analytical',
      pace: 'medium',
      formality: 'formal'
    },
    examples: ['从镜头语言来看，导演在这里运用了...'],
    popularity: 70
  }
];

class ScriptTemplateService {
  private templates: ScriptTemplate[];

  constructor() {
    this.templates = [...DEFAULT_TEMPLATES];
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem('scriptTemplates');
      if (saved) {
        const custom = JSON.parse(saved) as ScriptTemplate[];
        this.templates = [...this.templates, ...custom];
      }
    } catch {
      // 忽略存储错误
    }
  }

  private saveToStorage(): void {
    try {
      const custom = this.templates.filter(t => t.isCustom);
      localStorage.setItem('scriptTemplates', JSON.stringify(custom));
    } catch {
      // 忽略存储错误
    }
  }

  getAllTemplates(): ScriptTemplate[] {
    return this.templates;
  }

  getTemplateById(id: string): ScriptTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  getTemplatesByCategory(category: string): ScriptTemplate[] {
    return this.templates.filter(t => t.category === category);
  }

  getCategories(): string[] {
    const categories = new Set<string>();
    this.templates.forEach(t => {
      if (t.category) categories.add(t.category);
    });
    return Array.from(categories);
  }

  searchTemplates(query: string): ScriptTemplate[] {
    const lowerQuery = query.toLowerCase();
    return this.templates.filter(t =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  addTemplate(template: Omit<ScriptTemplate, 'id' | 'isCustom'>): ScriptTemplate {
    const newTemplate: ScriptTemplate = {
      ...template,
      id: `custom_${Date.now()}`,
      isCustom: true
    };
    this.templates.push(newTemplate);
    this.saveToStorage();
    return newTemplate;
  }

  updateTemplate(id: string, updates: Partial<ScriptTemplate>): ScriptTemplate | undefined {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    
    this.templates[index] = { ...this.templates[index], ...updates };
    this.saveToStorage();
    return this.templates[index];
  }

  deleteTemplate(id: string): boolean {
    const index = this.templates.findIndex(t => t.id === id && t.isCustom);
    if (index === -1) return false;
    
    this.templates.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  getPopularTemplates(limit: number = 5): ScriptTemplate[] {
    return [...this.templates]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, limit);
  }
}

export const scriptTemplateService = new ScriptTemplateService();
export { ScriptTemplateService };
