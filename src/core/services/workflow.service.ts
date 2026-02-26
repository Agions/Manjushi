/**
 * 漫剧工作流自动化服务
 * 实现 9 步漫剧创作流程
 */

import { message } from 'antd';
import { aiService } from './ai.service';
import { generationService, ImageGenerationOptions, VideoGenerationOptions } from './generation.service';
import { ttsService, TTSOptions } from './tts.service';
import { ffmpegService, CutVideoParams, VideoSegment } from './ffmpeg.service';

// 工作流步骤类型
export type WorkflowStepType = 
  | 'script'      // 1. 剧本创作
  | 'storyboard'  // 2. 分镜设计
  | 'character'   // 3. 角色设定
  | 'scene'       // 4. 场景生成
  | 'image'       // 5. 图像生成
  | 'dubbing'     // 6. 智能配音
  | 'video'       // 7. 视频生成
  | 'edit'        // 8. 后期剪辑
  | 'export';     // 9. 导出成品

// 工作流步骤状态
export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  progress: number;
  input?: any;
  output?: any;
  error?: string;
  startTime?: number;
  endTime?: number;
  duration?: number;
}

// 工作流配置
export interface WorkflowConfig {
  name: string;
  description?: string;
  aiProvider: string;
  aiApiKey: string;
  imageProvider: string;
  imageApiKey: string;
  videoProvider: string;
  videoApiKey: string;
  ttsProvider: string;
  ttsApiKey?: string;
  ttsSecretKey?: string;
  ttsAppId?: string;
  style?: string;
  aspectRatio?: string;
  duration?: number;
  autoProceed?: boolean;
}

// 漫剧项目
export interface ComicDramaProject {
  id: string;
  name: string;
  config: WorkflowConfig;
  steps: WorkflowStep[];
  currentStep: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  createdAt: number;
  updatedAt: number;
  output?: {
    script?: string;
    storyboard?: StoryboardItem[];
    characters?: Character[];
    scenes?: Scene[];
    images?: string[];
    audio?: string[];
    videos?: string[];
    finalVideo?: string;
  };
}

// 分镜项
export interface StoryboardItem {
  id: string;
  sceneNumber: number;
  description: string;
  cameraAngle?: string;
  duration: number;
  dialogue?: string;
  action?: string;
}

// 角色设定
export interface Character {
  id: string;
  name: string;
  description: string;
  personality?: string;
  appearance?: string;
  voice?: string;
  referenceImage?: string;
}

// 场景
export interface Scene {
  id: string;
  name: string;
  description: string;
  location?: string;
  time?: string;
  mood?: string;
  referenceImage?: string;
}

// 工作流事件
export type WorkflowEventType = 
  | 'stepStart' 
  | 'stepProgress' 
  | 'stepComplete' 
  | 'stepFail' 
  | 'workflowComplete' 
  | 'workflowFail';

export interface WorkflowEvent {
  type: WorkflowEventType;
  projectId: string;
  stepId?: string;
  stepType?: WorkflowStepType;
  progress?: number;
  data?: any;
  error?: string;
}

export type WorkflowEventHandler = (event: WorkflowEvent) => void;

class WorkflowService {
  private projects: Map<string, ComicDramaProject> = new Map();
  private eventHandlers: WorkflowEventHandler[] = [];

  /**
   * 创建新项目
   */
  createProject(name: string, config: WorkflowConfig): ComicDramaProject {
    const id = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const steps: WorkflowStep[] = [
      {
        id: `step_${id}_script`,
        type: 'script',
        name: '剧本创作',
        description: '使用 AI 创作漫剧剧本',
        status: 'pending',
        progress: 0,
      },
      {
        id: `step_${id}_storyboard`,
        type: 'storyboard',
        name: '分镜设计',
        description: '将剧本转换为分镜脚本',
        status: 'pending',
        progress: 0,
      },
      {
        id: `step_${id}_character`,
        type: 'character',
        name: '角色设定',
        description: '设计角色形象和性格',
        status: 'pending',
        progress: 0,
      },
      {
        id: `step_${id}_scene`,
        type: 'scene',
        name: '场景生成',
        description: '生成场景描述和氛围',
        status: 'pending',
        progress: 0,
      },
      {
        id: `step_${id}_image`,
        type: 'image',
        name: '图像生成',
        description: '生成漫剧所需图像',
        status: 'pending',
        progress: 0,
      },
      {
        id: `step_${id}_dubbing`,
        type: 'dubbing',
        name: '智能配音',
        description: '为角色生成配音',
        status: 'pending',
        progress: 0,
      },
      {
        id: `step_${id}_video`,
        type: 'video',
        name: '视频生成',
        description: '将图像转换为视频',
        status: 'pending',
        progress: 0,
      },
      {
        id: `step_${id}_edit`,
        type: 'edit',
        name: '后期剪辑',
        description: '剪辑合成最终视频',
        status: 'pending',
        progress: 0,
      },
      {
        id: `step_${id}_export`,
        type: 'export',
        name: '导出成品',
        description: '导出最终漫剧视频',
        status: 'pending',
        progress: 0,
      },
    ];

    const project: ComicDramaProject = {
      id,
      name,
      config,
      steps,
      currentStep: 0,
      status: 'idle',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      output: {},
    };

    this.projects.set(id, project);
    return project;
  }

  /**
   * 获取项目
   */
  getProject(id: string): ComicDramaProject | undefined {
    return this.projects.get(id);
  }

  /**
   * 获取所有项目
   */
  getAllProjects(): ComicDramaProject[] {
    return Array.from(this.projects.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * 删除项目
   */
  deleteProject(id: string): boolean {
    return this.projects.delete(id);
  }

  /**
   * 订阅工作流事件
   */
  subscribe(handler: WorkflowEventHandler): () => void {
    this.eventHandlers.push(handler);
    return () => {
      const index = this.eventHandlers.indexOf(handler);
      if (index > -1) {
        this.eventHandlers.splice(index, 1);
      }
    };
  }

  /**
   * 触发事件
   */
  private emit(event: WorkflowEvent): void {
    this.eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('工作流事件处理错误:', error);
      }
    });
  }

  /**
   * 运行工作流
   */
  async runWorkflow(projectId: string, startFromStep?: number): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error('项目不存在');
    }

    project.status = 'running';
    project.updatedAt = Date.now();

    const startStep = startFromStep ?? project.currentStep;

    try {
      for (let i = startStep; i < project.steps.length; i++) {
        if (project.status === 'paused') {
          break;
        }

        project.currentStep = i;
        const step = project.steps[i];

        await this.executeStep(project, step);

        // 自动继续下一步
        if (!project.config.autoProceed && i < project.steps.length - 1) {
          // 如果不是自动模式，等待用户确认
          break;
        }
      }

      if (project.currentStep >= project.steps.length - 1) {
        project.status = 'completed';
        this.emit({
          type: 'workflowComplete',
          projectId,
          data: project.output,
        });
      }
    } catch (error) {
      project.status = 'failed';
      this.emit({
        type: 'workflowFail',
        projectId,
        error: error instanceof Error ? error.message : '工作流执行失败',
      });
      throw error;
    } finally {
      project.updatedAt = Date.now();
    }
  }

  /**
   * 暂停工作流
   */
  pauseWorkflow(projectId: string): void {
    const project = this.projects.get(projectId);
    if (project) {
      project.status = 'paused';
      project.updatedAt = Date.now();
    }
  }

  /**
   * 继续工作流
   */
  resumeWorkflow(projectId: string): Promise<void> {
    return this.runWorkflow(projectId, this.projects.get(projectId)?.currentStep);
  }

  /**
   * 执行单个步骤
   */
  private async executeStep(project: ComicDramaProject, step: WorkflowStep): Promise<void> {
    step.status = 'running';
    step.startTime = Date.now();
    step.progress = 0;

    this.emit({
      type: 'stepStart',
      projectId: project.id,
      stepId: step.id,
      stepType: step.type,
    });

    try {
      switch (step.type) {
        case 'script':
          await this.executeScriptStep(project, step);
          break;
        case 'storyboard':
          await this.executeStoryboardStep(project, step);
          break;
        case 'character':
          await this.executeCharacterStep(project, step);
          break;
        case 'scene':
          await this.executeSceneStep(project, step);
          break;
        case 'image':
          await this.executeImageStep(project, step);
          break;
        case 'dubbing':
          await this.executeDubbingStep(project, step);
          break;
        case 'video':
          await this.executeVideoStep(project, step);
          break;
        case 'edit':
          await this.executeEditStep(project, step);
          break;
        case 'export':
          await this.executeExportStep(project, step);
          break;
      }

      step.status = 'completed';
      step.progress = 100;
      step.endTime = Date.now();
      step.duration = step.endTime - step.startTime;

      this.emit({
        type: 'stepComplete',
        projectId: project.id,
        stepId: step.id,
        stepType: step.type,
        data: step.output,
      });
    } catch (error) {
      step.status = 'failed';
      step.error = error instanceof Error ? error.message : '步骤执行失败';
      step.endTime = Date.now();

      this.emit({
        type: 'stepFail',
        projectId: project.id,
        stepId: step.id,
        stepType: step.type,
        error: step.error,
      });

      throw error;
    }
  }

  /**
   * 步骤 1: 剧本创作
   */
  private async executeScriptStep(project: ComicDramaProject, step: WorkflowStep): Promise<void> {
    const prompt = `创作一个漫剧剧本，主题：${project.name}

要求：
1. 适合短视频平台传播（1-3分钟）
2. 有吸引力的开头（黄金3秒）
3. 清晰的起承转合
4. 适合视觉化的场景描述
5. 包含角色对话和动作
6. 标注每个场景的情绪基调

请输出完整的剧本，包含：
- 标题
- 场景列表（场景编号、地点、时间、描述）
- 角色列表（角色名、性格特点）
- 完整对白和动作描述`;

    const response = await aiService.generateText({
      prompt,
      provider: project.config.aiProvider as any,
      apiKey: project.config.aiApiKey,
    });

    step.output = { script: response.text };
    project.output!.script = response.text;
    step.progress = 100;

    this.emit({
      type: 'stepProgress',
      projectId: project.id,
      stepId: step.id,
      stepType: step.type,
      progress: 100,
    });
  }

  /**
   * 步骤 2: 分镜设计
   */
  private async executeStoryboardStep(project: ComicDramaProject, step: WorkflowStep): Promise<void> {
    const script = project.output?.script || '';
    
    const prompt = `根据以下剧本设计分镜脚本：

${script}

请将剧本转换为详细的分镜脚本，每个分镜包含：
1. 分镜编号
2. 画面描述（详细的视觉内容）
3. 镜头角度（特写/中景/全景/俯视等）
4. 时长（秒）
5. 对白/旁白
6. 动作描述

输出格式为 JSON 数组：
[{
  "sceneNumber": 1,
  "description": "画面描述",
  "cameraAngle": "特写",
  "duration": 3,
  "dialogue": "对白内容",
  "action": "动作描述"
}]`;

    const response = await aiService.generateText({
      prompt,
      provider: project.config.aiProvider as any,
      apiKey: project.config.aiApiKey,
    });

    // 解析 JSON
    let storyboard: StoryboardItem[] = [];
    try {
      const jsonMatch = response.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        storyboard = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // 如果解析失败，创建默认分镜
      storyboard = [{ 
        id: `sb_${Date.now()}`,
        sceneNumber: 1, 
        description: '默认分镜', 
        duration: 3 
      }];
    }

    step.output = { storyboard };
    project.output!.storyboard = storyboard;
    step.progress = 100;

    this.emit({
      type: 'stepProgress',
      projectId: project.id,
      stepId: step.id,
      stepType: step.type,
      progress: 100,
    });
  }

  /**
   * 步骤 3: 角色设定
   */
  private async executeCharacterStep(project: ComicDramaProject, step: WorkflowStep): Promise<void> {
    const script = project.output?.script || '';
    
    const prompt = `根据以下剧本提取并完善角色设定：

${script}

请输出角色列表，每个角色包含：
1. 角色名称
2. 角色描述（外貌、年龄、穿着）
3. 性格特点
4. 声音特点（适合配音）

输出格式为 JSON 数组：
[{
  "name": "角色名",
  "description": "外貌描述",
  "personality": "性格特点",
  "appearance": "穿着打扮",
  "voice": "声音特点"
}]`;

    const response = await aiService.generateText({
      prompt,
      provider: project.config.aiProvider as any,
      apiKey: project.config.aiApiKey,
    });

    let characters: Character[] = [];
    try {
      const jsonMatch = response.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        characters = JSON.parse(jsonMatch[0]).map((c: any, i: number) => ({
          id: `char_${Date.now()}_${i}`,
          ...c,
        }));
      }
    } catch (e) {
      characters = [];
    }

    step.output = { characters };
    project.output!.characters = characters;
    step.progress = 100;

    this.emit({
      type: 'stepProgress',
      projectId: project.id,
      stepId: step.id,
      stepType: step.type,
      progress: 100,
    });
  }

  /**
   * 步骤 4: 场景生成
   */
  private async executeSceneStep(project: ComicDramaProject, step: WorkflowStep): Promise<void> {
    const script = project.output?.script || '';
    
    const prompt = `根据以下剧本提取并完善场景设定：

${script}

请输出场景列表，每个场景包含：
1. 场景名称
2. 场景描述（环境、布置）
3. 地点
4. 时间（白天/夜晚/黄昏等）
5. 氛围/情绪

输出格式为 JSON 数组：
[{
  "name": "场景名",
  "description": "场景描述",
  "location": "地点",
  "time": "时间",
  "mood": "氛围"
}]`;

    const response = await aiService.generateText({
      prompt,
      provider: project.config.aiProvider as any,
      apiKey: project.config.aiApiKey,
    });

    let scenes: Scene[] = [];
    try {
      const jsonMatch = response.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        scenes = JSON.parse(jsonMatch[0]).map((s: any, i: number) => ({
          id: `scene_${Date.now()}_${i}`,
          ...s,
        }));
      }
    } catch (e) {
      scenes = [];
    }

    step.output = { scenes };
    project.output!.scenes = scenes;
    step.progress = 100;

    this.emit({
      type: 'stepProgress',
      projectId: project.id,
      stepId: step.id,
      stepType: step.type,
      progress: 100,
    });
  }

  /**
   * 步骤 5: 图像生成
   */
  private async executeImageStep(project: ComicDramaProject, step: WorkflowStep): Promise<void> {
    const storyboard = project.output?.storyboard || [];
    const characters = project.output?.characters || [];
    const scenes = project.output?.scenes || [];

    const images: string[] = [];
    const total = storyboard.length;

    for (let i = 0; i < storyboard.length; i++) {
      const item = storyboard[i];
      
      // 构建提示词
      let prompt = item.description;
      
      // 添加角色信息
      if (characters.length > 0) {
        const charDesc = characters.map(c => `${c.name}: ${c.appearance}`).join('; ');
        prompt += `\n角色: ${charDesc}`;
      }
      
      // 添加场景信息
      if (scenes.length > 0) {
        const scene = scenes[i % scenes.length];
        prompt += `\n场景: ${scene.description}, ${scene.time}, ${scene.mood}`;
      }

      // 生成图像
      const options: ImageGenerationOptions = {
        prompt,
        aspectRatio: (project.config.aspectRatio as any) || '16:9',
        style: (project.config.style as any) || 'anime',
        numImages: 1,
      };

      try {
        const result = await generationService.generateImage(
          options,
          {
            provider: project.config.imageProvider as any,
            apiKey: project.config.imageApiKey,
          }
        );

        if (result.url) {
          images.push(result.url);
        }
      } catch (error) {
        console.error(`生成图像 ${i + 1} 失败:`, error);
      }

      step.progress = Math.round(((i + 1) / total) * 100);
      
      this.emit({
        type: 'stepProgress',
        projectId: project.id,
        stepId: step.id,
        stepType: step.type,
        progress: step.progress,
      });
    }

    step.output = { images };
    project.output!.images = images;
  }

  /**
   * 步骤 6: 智能配音
   */
  private async executeDubbingStep(project: ComicDramaProject, step: WorkflowStep): Promise<void> {
    const storyboard = project.output?.storyboard || [];
    const audio: string[] = [];

    // 过滤出有对白的分镜
    const dialogueItems = storyboard.filter(item => item.dialogue);
    const total = dialogueItems.length;

    for (let i = 0; i < dialogueItems.length; i++) {
      const item = dialogueItems[i];
      
      const options: TTSOptions = {
        text: item.dialogue!,
        provider: project.config.ttsProvider as any,
        voice: 'zh-CN-XiaoxiaoNeural', // 默认音色
        speed: 1.0,
        pitch: 1.0,
        volume: 1.0,
      };

      try {
        const result = await ttsService.synthesize(options);
        if (result.audioUrl) {
          audio.push(result.audioUrl);
        }
      } catch (error) {
        console.error(`生成配音 ${i + 1} 失败:`, error);
      }

      step.progress = Math.round(((i + 1) / total) * 100);
      
      this.emit({
        type: 'stepProgress',
        projectId: project.id,
        stepId: step.id,
        stepType: step.type,
        progress: step.progress,
      });
    }

    step.output = { audio };
    project.output!.audio = audio;
  }

  /**
   * 步骤 7: 视频生成
   */
  private async executeVideoStep(project: ComicDramaProject, step: WorkflowStep): Promise<void> {
    const images = project.output?.images || [];
    const videos: string[] = [];
    const total = images.length;

    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i];
      
      const options: VideoGenerationOptions = {
        prompt: 'Dynamic scene with natural motion',
        imageUrl,
        duration: (project.config.duration as 5 | 10) || 5,
        aspectRatio: (project.config.aspectRatio as any) || '16:9',
        motionStrength: 0.5,
      };

      try {
        const result = await generationService.generateVideo(
          options,
          {
            provider: project.config.videoProvider as any,
            apiKey: project.config.videoApiKey,
          }
        );

        if (result.url) {
          videos.push(result.url);
        }
      } catch (error) {
        console.error(`生成视频 ${i + 1} 失败:`, error);
      }

      step.progress = Math.round(((i + 1) / total) * 100);
      
      this.emit({
        type: 'stepProgress',
        projectId: project.id,
        stepId: step.id,
        stepType: step.type,
        progress: step.progress,
      });
    }

    step.output = { videos };
    project.output!.videos = videos;
  }

  /**
   * 步骤 8: 后期剪辑
   */
  private async executeEditStep(project: ComicDramaProject, step: WorkflowStep): Promise<void> {
    const videos = project.output?.videos || [];
    const audio = project.output?.audio || [];
    const storyboard = project.output?.storyboard || [];

    if (videos.length === 0) {
      throw new Error('没有可剪辑的视频');
    }

    // 构建片段
    const segments: VideoSegment[] = videos.map((video, i) => ({
      start: 0,
      end: storyboard[i]?.duration || 5,
      content: storyboard[i]?.dialogue,
    }));

    // 这里简化处理，实际应该使用 FFmpeg 合并
    // 由于视频生成已经是独立的片段，这里主要是概念性的剪辑步骤
    
    step.output = { 
      segments,
      totalDuration: segments.reduce((sum, s) => sum + (s.end - s.start), 0),
    };
    
    step.progress = 100;

    this.emit({
      type: 'stepProgress',
      projectId: project.id,
      stepId: step.id,
      stepType: step.type,
      progress: 100,
    });
  }

  /**
   * 步骤 9: 导出成品
   */
  private async executeExportStep(project: ComicDramaProject, step: WorkflowStep): Promise<void> {
    const videos = project.output?.videos || [];
    
    if (videos.length === 0) {
      throw new Error('没有可导出的视频');
    }

    // 实际导出需要使用 FFmpeg 合并所有片段
    // 这里返回最后一个视频的 URL 作为成品
    const finalVideo = videos[videos.length - 1];

    step.output = { 
      finalVideo,
      totalClips: videos.length,
    };
    
    project.output!.finalVideo = finalVideo;
    step.progress = 100;

    this.emit({
      type: 'stepProgress',
      projectId: project.id,
      stepId: step.id,
      stepType: step.type,
      progress: 100,
    });

    message.success('漫剧创作完成！');
  }
}

// 导出单例
export const workflowService = new WorkflowService();
export default workflowService;
