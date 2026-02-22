/**
 * 重试装饰器 - 增强工作流稳定性
 */

import { v4 as uuidv4 } from 'uuid';

// 重试配置
export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: [
    'network',
    'timeout',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND'
  ]
};

// 可重试错误类型
const isRetryableError = (error: unknown, config: RetryConfig): boolean => {
  if (!error) return false;
  
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // 检查是否配置了可重试的错误
  if (config.retryableErrors) {
    return config.retryableErrors.some(e => errorMessage.includes(e));
  }
  
  // 默认: 网络错误都重试
  return errorMessage.includes('network') || 
         errorMessage.includes('timeout') ||
         errorMessage.includes('fetch');
};

/**
 * 带重试的异步函数执行
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  onRetry?: (attempt: number, delay: number, error: Error) => void
): Promise<T> {
  const cfg = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error;
  let delay = cfg.initialDelay;

  for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // 检查是否可重试
      if (!isRetryableError(error, cfg) || attempt >= cfg.maxAttempts) {
        throw lastError;
      }

      // 回调
      onRetry?.(attempt, delay, lastError);
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // 指数退避
      delay = Math.min(delay * cfg.backoffMultiplier, cfg.maxDelay);
    }
  }

  throw lastError!;
}

/**
 * 带重试的 Promise.race - 支持超时
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError?: string
): Promise<T> {
  const timeout = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error(timeoutError || `操作超时 (${timeoutMs}ms)`)), timeoutMs)
  );
  
  return Promise.race([promise, timeout]);
}

/**
 * 带重试和超时的组合
 */
export async function withRetryAndTimeout<T>(
  fn: () => Promise<T>,
  retryConfig: Partial<RetryConfig> = {},
  timeoutMs: number = 30000
): Promise<T> {
  return withRetry(
    () => withTimeout(fn(), timeoutMs),
    retryConfig
  );
}

// 检查点管理
export interface Checkpoint {
  id: string;
  step: string;
  progress: number;
  data: Record<string, any>;
  timestamp: number;
  version: string;
}

/**
 * 检查点存储接口
 */
export interface CheckpointStorage {
  save(checkpoint: Checkpoint): Promise<void>;
  load(id: string): Promise<Checkpoint | null>;
  list(projectId: string): Promise<Checkpoint[]>;
  delete(id: string): Promise<void>;
}

/**
 * 默认检查点存储 - 使用 localStorage
 */
export class LocalCheckpointStorage implements CheckpointStorage {
  private prefix = 'clipaiman_checkpoint_';

  async save(checkpoint: Checkpoint): Promise<void> {
    const key = `${this.prefix}${checkpoint.id}`;
    localStorage.setItem(key, JSON.stringify(checkpoint));
  }

  async load(id: string): Promise<Checkpoint | null> {
    const key = `${this.prefix}${id}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  async list(projectId: string): Promise<Checkpoint[]> {
    const checkpoints: Checkpoint[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const cp = JSON.parse(data) as Checkpoint;
            if (cp.id.includes(projectId)) {
              checkpoints.push(cp);
            }
          }
        } catch {}
      }
    }
    return checkpoints.sort((a, b) => b.timestamp - a.timestamp);
  }

  async delete(id: string): Promise<void> {
    const key = `${this.prefix}${id}`;
    localStorage.removeItem(key);
  }
}

/**
 * 创建检查点
 */
export function createCheckpoint(
  step: string,
  progress: number,
  data: Record<string, any>,
  version: string = '1.0.0'
): Checkpoint {
  return {
    id: `${step}_${Date.now()}_${uuidv4().slice(0, 8)}`,
    step,
    progress,
    data,
    timestamp: Date.now(),
    version
  };
}

// 缓存管理
export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  hash: string;
}

/**
 * 简单缓存实现
 */
export class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 3600000; // 1小时

  set<T>(key: string, value: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
      hash: key
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value as T;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 生成内容 hash 用于缓存 key
  static hashContent(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

// 全局缓存实例
export const workflowCache = new SimpleCache();
export const checkpointStorage = new LocalCheckpointStorage();
