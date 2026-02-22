/**
 * Services 统一导出
 */
export { aiService } from './ai.service';
export { videoService } from './video.service';
export { storageService } from './storage.service';
export { visionService } from './vision.service';
export { dramaWorkflowService, DramaWorkflowService } from './drama.workflow.service';
export { costService, CostService } from './cost.service';
export { consistencyService, ConsistencyService } from './consistency.service';
export { enhancedConsistencyService, EnhancedConsistencyService } from './enhanced-consistency.service';
export { novelService, NovelService } from './novel.service';
export { scriptTemplateService, ScriptTemplateService } from './scriptTemplate.service';
export { lipSyncService, LipSyncService } from './lip-sync.service';
export { enhancedDramaWorkflowService, EnhancedDramaWorkflowService } from './enhanced-drama-workflow.service';
export { originalityService, OriginalityService } from './originality.service';
export { dramaTemplateService, DramaTemplateService } from './drama-template.service';

// 工作流增强
export {
  withRetry,
  withTimeout,
  withRetryAndTimeout,
  workflowCache,
  checkpointStorage,
  createCheckpoint,
  LocalCheckpointStorage
} from './workflow-enhance.service';
export type { RetryConfig, Checkpoint, CheckpointStorage, CacheEntry } from './workflow-enhance.service';

// Legacy services (to be migrated)
export * from './legacy/aiService';
export * from './legacy/videoService';
export * from './legacy/exportService';
export * from './legacy/projectService';
export * from './legacy/tauriService';
export * from './legacy/api';

// 重新导出类型
export type { AIResponse, RequestConfig } from './ai.service';
export type { DramaWorkflowStep, DramaWorkflowState, DramaWorkflowData, DramaWorkflowConfig, DramaWorkflowCallbacks } from './drama.workflow.service';
export type { CostRecord, CostStats, CostBudget } from './cost.service';
export type { Character, DramaStyle, ConsistencyRule, ConsistencyCheckpoint, ConsistencyIssue, CharacterLibrary } from './consistency.service';
export type { NovelChapter, ScriptScene, Script, NovelParseResult, Storyboard } from './novel.service';
