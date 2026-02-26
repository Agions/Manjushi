/**
 * FFmpeg 视频处理服务
 * 封装 Tauri 后端命令，提供视频处理功能
 */

import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { message } from 'antd';

// 视频元数据
export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  bitrate: number;
}

// 视频片段
export interface VideoSegment {
  start: number;
  end: number;
  type?: string;
  content?: string;
}

// 剪辑参数
export interface CutVideoParams {
  inputPath: string;
  outputPath: string;
  segments: VideoSegment[];
  quality?: 'low' | 'medium' | 'high';
  format?: 'mp4' | 'mov' | 'avi' | 'mkv';
  transition?: 'none' | 'fade' | 'dissolve' | 'wipe' | 'slide';
  transitionDuration?: number;
  volume?: number;
  addSubtitles?: boolean;
}

// 预览参数
export interface PreviewParams {
  inputPath: string;
  segment: VideoSegment;
  transition?: string;
  transitionDuration?: number;
  volume?: number;
  addSubtitles?: boolean;
}

// 剪辑进度回调
export type CutProgressCallback = (progress: number) => void;

// FFmpeg 状态
export interface FFmpegStatus {
  installed: boolean;
  version?: string;
}

class FFmpegService {
  private unlistenFn: (() => void) | null = null;

  /**
   * 检查 FFmpeg 是否已安装
   */
  async checkFFmpeg(): Promise<FFmpegStatus> {
    try {
      const result = await invoke<Record<string, any>>('check_ffmpeg');
      return {
        installed: result.installed as boolean,
        version: result.version as string | undefined,
      };
    } catch (error) {
      console.error('检查 FFmpeg 失败:', error);
      return { installed: false };
    }
  }

  /**
   * 分析视频文件
   */
  async analyzeVideo(path: string): Promise<VideoMetadata> {
    try {
      const metadata = await invoke<VideoMetadata>('analyze_video', { path });
      return metadata;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '分析视频失败';
      message.error(errorMsg);
      throw error;
    }
  }

  /**
   * 提取关键帧
   */
  async extractKeyFrames(path: string, count: number = 5): Promise<string[]> {
    try {
      const frames = await invoke<string[]>('extract_key_frames', { path, count });
      return frames;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '提取关键帧失败';
      message.error(errorMsg);
      throw error;
    }
  }

  /**
   * 生成视频缩略图
   */
  async generateThumbnail(path: string): Promise<string> {
    try {
      const thumbnailPath = await invoke<string>('generate_thumbnail', { path });
      return thumbnailPath;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '生成缩略图失败';
      message.error(errorMsg);
      throw error;
    }
  }

  /**
   * 剪辑视频
   */
  async cutVideo(
    params: CutVideoParams,
    onProgress?: CutProgressCallback
  ): Promise<string> {
    // 监听进度事件
    if (onProgress) {
      this.unlistenFn = await listen<number>('cut_progress', (event) => {
        onProgress(event.payload);
      });
    }

    try {
      const outputPath = await invoke<string>('cut_video', {
        params: {
          input_path: params.inputPath,
          output_path: params.outputPath,
          segments: params.segments,
          quality: params.quality,
          format: params.format,
          transition: params.transition,
          transition_duration: params.transitionDuration,
          volume: params.volume,
          add_subtitles: params.addSubtitles,
        },
      });

      message.success('视频剪辑完成');
      return outputPath;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '剪辑视频失败';
      message.error(errorMsg);
      throw error;
    } finally {
      // 取消监听
      if (this.unlistenFn) {
        this.unlistenFn();
        this.unlistenFn = null;
      }
    }
  }

  /**
   * 生成预览片段
   */
  async generatePreview(params: PreviewParams): Promise<string> {
    try {
      const previewPath = await invoke<string>('generate_preview', {
        params: {
          input_path: params.inputPath,
          segment: params.segment,
          transition: params.transition,
          transition_duration: params.transitionDuration,
          volume: params.volume,
          add_subtitles: params.addSubtitles,
        },
      });

      return previewPath;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '生成预览失败';
      message.error(errorMsg);
      throw error;
    }
  }

  /**
   * 清理临时文件
   */
  async cleanTempFile(path: string): Promise<void> {
    try {
      await invoke('clean_temp_file', { params: { path } });
    } catch (error) {
      console.error('清理临时文件失败:', error);
    }
  }

  /**
   * 打开文件
   */
  async openFile(path: string): Promise<void> {
    try {
      await invoke('open_file', { path });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '打开文件失败';
      message.error(errorMsg);
      throw error;
    }
  }

  /**
   * 格式化时长
   */
  formatDuration(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 获取视频分辨率名称
   */
  getResolutionName(width: number, height: number): string {
    if (width >= 3840 || height >= 2160) return '4K';
    if (width >= 1920 || height >= 1080) return '1080p';
    if (width >= 1280 || height >= 720) return '720p';
    if (width >= 854 || height >= 480) return '480p';
    return 'SD';
  }

  /**
   * 获取推荐质量设置
   */
  getRecommendedQuality(metadata: VideoMetadata): 'low' | 'medium' | 'high' {
    const resolution = metadata.width * metadata.height;
    if (resolution >= 1920 * 1080) return 'high';
    if (resolution >= 1280 * 720) return 'medium';
    return 'low';
  }
}

// 导出单例
export const ffmpegService = new FFmpegService();
export default ffmpegService;
