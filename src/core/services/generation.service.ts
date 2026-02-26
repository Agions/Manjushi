/**
 * AI 生成服务
 * 支持国产图像/视频生成模型：字节 Seedream/Seedance、快手可灵、生数 Vidu
 */

import { message } from 'antd';

// 生成类型
export type GenerationType = 'image' | 'video';

// 生成提供商
export type GenerationProvider = 
  | 'bytedance-seedream'    // 字节 Seedream 图像
  | 'bytedance-seedance'    // 字节 Seedance 视频
  | 'kling'                 // 快手可灵
  | 'vidu';                 // 生数 Vidu

// 生成配置
export interface GenerationConfig {
  provider: GenerationProvider;
  apiKey: string;
  apiSecret?: string;  // 部分厂商需要
  region?: string;     // 区域配置
}

// 图像生成选项
export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  style?: string;
  seed?: number;
  numImages?: number;  // 生成数量 1-4
}

// 视频生成选项
export interface VideoGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  imageUrl?: string;   // 图生视频
  duration?: 5 | 10;   // 时长（秒）
  aspectRatio?: '16:9' | '9:16' | '1:1';
  fps?: 24 | 30;
  motionStrength?: number;  // 运动幅度 0-1
}

// 生成任务
export interface GenerationTask {
  id: string;
  type: GenerationType;
  provider: GenerationProvider;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: {
    url: string;
    urls?: string[];  // 多图生成
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
  };
  error?: string;
  createdAt: number;
  updatedAt: number;
}

// 生成结果
export interface GenerationResult {
  taskId: string;
  status: GenerationTask['status'];
  url?: string;
  urls?: string[];
  error?: string;
}

// 风格预设
export const IMAGE_STYLES = [
  { id: 'realistic', name: '写实', desc: '照片级真实感' },
  { id: 'anime', name: '动漫', desc: '日式/中式动漫风格' },
  { id: '3d', name: '3D 渲染', desc: 'CG 渲染效果' },
  { id: 'oil', name: '油画', desc: '油画艺术风格' },
  { id: 'watercolor', name: '水彩', desc: '水彩画风格' },
  { id: 'sketch', name: '素描', desc: '铅笔素描风格' },
  { id: 'cyberpunk', name: '赛博朋克', desc: '未来科幻风格' },
  { id: 'chinese', name: '国风', desc: '中国传统风格' },
  { id: 'pixel', name: '像素', desc: '像素艺术风格' },
  { id: 'minimalist', name: '极简', desc: '简约设计风格' },
];

// 视频风格预设
export const VIDEO_STYLES = [
  { id: 'cinematic', name: '电影感', desc: '电影级画面质感' },
  { id: 'anime', name: '动漫', desc: '动画风格' },
  { id: 'realistic', name: '写实', desc: '真实摄影风格' },
  { id: 'dreamy', name: '梦幻', desc: '梦幻唯美风格' },
  { id: 'dynamic', name: '动感', desc: '快节奏运动风格' },
];

// 字节 Seedream 风格映射
const SEEDREAM_STYLE_MAP: Record<string, string> = {
  realistic: 'photorealistic',
  anime: 'anime',
  '3d': '3d_render',
  oil: 'oil_painting',
  watercolor: 'watercolor',
  sketch: 'sketch',
  cyberpunk: 'cyberpunk',
  chinese: 'traditional_chinese',
  pixel: 'pixel_art',
  minimalist: 'minimalist',
};

// 快手可灵风格映射
const KLING_STYLE_MAP: Record<string, string> = {
  cinematic: 'cinema',
  anime: 'anime',
  realistic: 'realistic',
  dreamy: 'dreamy',
  dynamic: 'dynamic',
};

class GenerationService {
  private tasks: Map<string, GenerationTask> = new Map();
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * 生成图像
   */
  async generateImage(
    options: ImageGenerationOptions,
    config: GenerationConfig,
    onProgress?: (progress: number) => void
  ): Promise<GenerationResult> {
    const taskId = this.generateTaskId();
    
    // 创建任务
    const task: GenerationTask = {
      id: taskId,
      type: 'image',
      provider: config.provider,
      status: 'pending',
      progress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.tasks.set(taskId, task);

    try {
      task.status = 'processing';
      onProgress?.(10);

      let result: GenerationResult;

      switch (config.provider) {
        case 'bytedance-seedream':
          result = await this.generateSeedreamImage(taskId, options, config, onProgress);
          break;
        case 'kling':
          result = await this.generateKlingImage(taskId, options, config, onProgress);
          break;
        default:
          throw new Error(`不支持的图像生成提供商: ${config.provider}`);
      }

      task.status = result.status;
      task.result = result.url ? {
        url: result.url,
        urls: result.urls,
        width: options.width || 1024,
        height: options.height || 1024,
        format: 'png',
      } : undefined;
      task.error = result.error;
      task.updatedAt = Date.now();

      return result;
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : '生成失败';
      task.updatedAt = Date.now();
      throw error;
    }
  }

  /**
   * 生成视频
   */
  async generateVideo(
    options: VideoGenerationOptions,
    config: GenerationConfig,
    onProgress?: (progress: number) => void
  ): Promise<GenerationResult> {
    const taskId = this.generateTaskId();
    
    const task: GenerationTask = {
      id: taskId,
      type: 'video',
      provider: config.provider,
      status: 'pending',
      progress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.tasks.set(taskId, task);

    try {
      task.status = 'processing';
      onProgress?.(10);

      let result: GenerationResult;

      switch (config.provider) {
        case 'bytedance-seedance':
          result = await this.generateSeedanceVideo(taskId, options, config, onProgress);
          break;
        case 'kling':
          result = await this.generateKlingVideo(taskId, options, config, onProgress);
          break;
        case 'vidu':
          result = await this.generateViduVideo(taskId, options, config, onProgress);
          break;
        default:
          throw new Error(`不支持的视频生成提供商: ${config.provider}`);
      }

      task.status = result.status;
      task.result = result.url ? {
        url: result.url,
        width: options.aspectRatio === '9:16' ? 1080 : 1920,
        height: options.aspectRatio === '9:16' ? 1920 : 1080,
        duration: options.duration || 5,
        format: 'mp4',
      } : undefined;
      task.error = result.error;
      task.updatedAt = Date.now();

      return result;
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : '生成失败';
      task.updatedAt = Date.now();
      throw error;
    }
  }

  /**
   * 字节 Seedream 图像生成
   * 文档: https://www.volcengine.com/docs/6791/1363796
   */
  private async generateSeedreamImage(
    taskId: string,
    options: ImageGenerationOptions,
    config: GenerationConfig,
    onProgress?: (progress: number) => void
  ): Promise<GenerationResult> {
    const { prompt, negativePrompt, width = 1024, height = 1024, style, seed, numImages = 1 } = options;

    // 构建请求
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'seedream-2-0',
        prompt: this.enhancePrompt(prompt, style),
        negative_prompt: negativePrompt,
        width,
        height,
        seed: seed || Math.floor(Math.random() * 2147483647),
        n: Math.min(Math.max(numImages, 1), 4),
        response_format: 'url',
        style: style ? SEEDREAM_STYLE_MAP[style] : undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Seedream API 错误: ${response.status} - ${error.error?.message || '未知错误'}`);
    }

    onProgress?.(50);

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      throw new Error('生成失败：未返回图像');
    }

    onProgress?.(100);

    return {
      taskId,
      status: 'completed',
      url: data.data[0].url,
      urls: data.data.map((item: any) => item.url),
    };
  }

  /**
   * 快手可灵图像生成
   * 文档: https://klingai.com/
   */
  private async generateKlingImage(
    taskId: string,
    options: ImageGenerationOptions,
    config: GenerationConfig,
    onProgress?: (progress: number) => void
  ): Promise<GenerationResult> {
    const { prompt, negativePrompt, aspectRatio = '1:1', style, numImages = 1 } = options;

    // 提交生成任务
    const submitResponse = await fetch('https://api.klingai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'kling-image-v1',
        prompt: this.enhancePrompt(prompt, style),
        negative_prompt: negativePrompt,
        aspect_ratio: aspectRatio,
        n: Math.min(Math.max(numImages, 1), 4),
        style: style ? KLING_STYLE_MAP[style] : undefined,
      }),
    });

    if (!submitResponse.ok) {
      const error = await submitResponse.json().catch(() => ({}));
      throw new Error(`可灵 API 错误: ${submitResponse.status} - ${error.error?.message || '未知错误'}`);
    }

    const submitData = await submitResponse.json();
    const internalTaskId = submitData.data.task_id;

    onProgress?.(30);

    // 轮询任务状态
    return this.pollTask(
      taskId,
      internalTaskId,
      config,
      'image',
      onProgress
    );
  }

  /**
   * 字节 Seedance 视频生成
   * 文档: https://www.volcengine.com/docs/6791/1363797
   */
  private async generateSeedanceVideo(
    taskId: string,
    options: VideoGenerationOptions,
    config: GenerationConfig,
    onProgress?: (progress: number) => void
  ): Promise<GenerationResult> {
    const { prompt, imageUrl, duration = 5, aspectRatio = '16:9', fps = 24 } = options;

    // 提交生成任务
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/videos/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'seedance-2-0',
        prompt,
        image_url: imageUrl,
        duration,
        aspect_ratio: aspectRatio,
        fps,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Seedance API 错误: ${response.status} - ${error.error?.message || '未知错误'}`);
    }

    const data = await response.json();
    const internalTaskId = data.id;

    onProgress?.(20);

    // 轮询任务状态
    return this.pollTask(
      taskId,
      internalTaskId,
      config,
      'video',
      onProgress
    );
  }

  /**
   * 快手可灵视频生成
   * 文档: https://klingai.com/
   */
  private async generateKlingVideo(
    taskId: string,
    options: VideoGenerationOptions,
    config: GenerationConfig,
    onProgress?: (progress: number) => void
  ): Promise<GenerationResult> {
    const { prompt, imageUrl, duration = 5, aspectRatio = '16:9', motionStrength = 0.5 } = options;

    const response = await fetch('https://api.klingai.com/v1/videos/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'kling-video-v1',
        prompt,
        image: imageUrl,
        duration,
        aspect_ratio: aspectRatio,
        camera_control: {
          motion_strength: motionStrength,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`可灵视频 API 错误: ${response.status} - ${error.error?.message || '未知错误'}`);
    }

    const data = await response.json();
    const internalTaskId = data.data.task_id;

    onProgress?.(20);

    return this.pollTask(
      taskId,
      internalTaskId,
      config,
      'video',
      onProgress
    );
  }

  /**
   * 生数 Vidu 视频生成
   * 文档: https://www.vidu.com/
   */
  private async generateViduVideo(
    taskId: string,
    options: VideoGenerationOptions,
    config: GenerationConfig,
    onProgress?: (progress: number) => void
  ): Promise<GenerationResult> {
    const { prompt, imageUrl, duration = 5, aspectRatio = '16:9' } = options;

    const response = await fetch('https://api.vidu.com/v1/videos/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'vidu-2-0',
        prompt,
        image_url: imageUrl,
        duration,
        aspect_ratio: aspectRatio,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Vidu API 错误: ${response.status} - ${error.error?.message || '未知错误'}`);
    }

    const data = await response.json();
    const internalTaskId = data.data.task_id;

    onProgress?.(20);

    return this.pollTask(
      taskId,
      internalTaskId,
      config,
      'video',
      onProgress
    );
  }

  /**
   * 轮询任务状态
   */
  private async pollTask(
    taskId: string,
    internalTaskId: string,
    config: GenerationConfig,
    type: GenerationType,
    onProgress?: (progress: number) => void
  ): Promise<GenerationResult> {
    return new Promise((resolve, reject) => {
      const maxAttempts = 60; // 最多轮询 60 次（5分钟）
      let attempts = 0;

      const interval = setInterval(async () => {
        attempts++;

        try {
          const statusUrl = type === 'image'
            ? `https://api.klingai.com/v1/images/generations/${internalTaskId}`
            : this.getVideoStatusUrl(config.provider, internalTaskId);

          const response = await fetch(statusUrl, {
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
            },
          });

          if (!response.ok) {
            clearInterval(interval);
            reject(new Error('查询任务状态失败'));
            return;
          }

          const data = await response.json();
          const task = data.data;

          // 更新进度
          const progress = Math.min(20 + attempts * 1.3, 95);
          onProgress?.(progress);

          // 更新任务状态
          const generationTask = this.tasks.get(taskId);
          if (generationTask) {
            generationTask.progress = progress;
            generationTask.updatedAt = Date.now();
          }

          // 检查是否完成
          if (task.status === 'succeeded' || task.status === 'completed') {
            clearInterval(interval);
            onProgress?.(100);

            const result: GenerationResult = {
              taskId,
              status: 'completed',
              url: task.result?.url || task.result?.video_url,
              urls: task.result?.urls,
            };

            if (generationTask) {
              generationTask.status = 'completed';
              generationTask.progress = 100;
              generationTask.result = {
                url: result.url!,
                urls: result.urls,
              };
            }

            resolve(result);
          } else if (task.status === 'failed') {
            clearInterval(interval);

            if (generationTask) {
              generationTask.status = 'failed';
              generationTask.error = task.error?.message || '生成失败';
            }

            reject(new Error(task.error?.message || '生成失败'));
          }

          // 超时检查
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            reject(new Error('生成超时，请稍后查询'));
          }
        } catch (error) {
          clearInterval(interval);
          reject(error);
        }
      }, 5000); // 每 5 秒查询一次

      this.pollingIntervals.set(taskId, interval);
    });
  }

  /**
   * 获取视频状态查询 URL
   */
  private getVideoStatusUrl(provider: GenerationProvider, taskId: string): string {
    switch (provider) {
      case 'bytedance-seedance':
        return `https://ark.cn-beijing.volces.com/api/v3/videos/generations/${taskId}`;
      case 'kling':
        return `https://api.klingai.com/v1/videos/generations/${taskId}`;
      case 'vidu':
        return `https://api.vidu.com/v1/videos/generations/${taskId}`;
      default:
        throw new Error(`未知的提供商: ${provider}`);
    }
  }

  /**
   * 增强提示词
   */
  private enhancePrompt(prompt: string, style?: string): string {
    if (!style) return prompt;

    const styleEnhancements: Record<string, string> = {
      realistic: 'photorealistic, highly detailed, 8k uhd',
      anime: 'anime style, vibrant colors, detailed illustration',
      '3d': '3d render, octane render, blender, cgi',
      oil: 'oil painting, artistic, textured brushstrokes',
      watercolor: 'watercolor painting, soft colors, artistic',
      sketch: 'pencil sketch, detailed drawing, monochrome',
      cyberpunk: 'cyberpunk, neon lights, futuristic, sci-fi',
      chinese: 'traditional chinese art, ink wash painting style',
      pixel: 'pixel art, retro game style, 8-bit',
      minimalist: 'minimalist, clean design, simple composition',
    };

    const enhancement = styleEnhancements[style];
    if (enhancement) {
      return `${prompt}, ${enhancement}`;
    }

    return prompt;
  }

  /**
   * 获取任务状态
   */
  getTask(taskId: string): GenerationTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * 获取所有任务
   */
  getAllTasks(): GenerationTask[] {
    return Array.from(this.tasks.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * 取消任务
   */
  cancelTask(taskId: string): boolean {
    const interval = this.pollingIntervals.get(taskId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(taskId);
    }

    const task = this.tasks.get(taskId);
    if (task && task.status === 'processing') {
      task.status = 'failed';
      task.error = '用户取消';
      task.updatedAt = Date.now();
      return true;
    }

    return false;
  }

  /**
   * 删除任务
   */
  deleteTask(taskId: string): boolean {
    this.cancelTask(taskId);
    return this.tasks.delete(taskId);
  }

  /**
   * 生成任务 ID
   */
  private generateTaskId(): string {
    return `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 清理旧任务
   */
  cleanupOldTasks(maxAge: number = 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    let count = 0;

    for (const [taskId, task] of this.tasks) {
      if (now - task.createdAt > maxAge) {
        this.deleteTask(taskId);
        count++;
      }
    }

    return count;
  }
}

// 导出单例
export const generationService = new GenerationService();
export default generationService;
