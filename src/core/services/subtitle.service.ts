/**
 * 专业字幕服务
 * 支持多种格式（SRT, VTT, ASS）、语音转字幕（ASR）、智能时间轴对齐、字幕样式定制
 */

import { v4 as uuidv4 } from 'uuid';

// ==================== 类型定义 ====================

/** 字幕条目 */
export interface SubtitleCue {
  id: string;
  startTime: number; // 秒
  endTime: number;   // 秒
  text: string;
  speaker?: string;   // 说话者
  confidence?: number; // 识别置信度
}

/** 字幕格式 */
export type SubtitleFormat = 'srt' | 'vtt' | 'ass';

/** 字幕样式 */
export interface SubtitleStyleConfig {
  // 字体
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  italic: boolean;
  
  // 颜色
  primaryColor: string;    // 主文字颜色
  secondaryColor: string; // secondary颜色（用于ASS）
  outlineColor: string;    // 描边颜色
  backColor: string;      // 背景颜色
  
  // 描边和阴影
  outlineWidth: number;    // 描边宽度
  shadowDepth: number;    // 阴影深度
  
  // 位置
  position: 'top' | 'middle' | 'bottom';
  marginV: number;        // 垂直边距
  
  // 对齐
  alignment: 'left' | 'center' | 'right';
  
  // 背景
  backgroundEnabled: boolean;
  backgroundOpacity: number;
  
  // ASS 专用
  bold: boolean;
  underline: boolean;
  strikeout: boolean;
  
  // 旋转角度（ASS）
  rotation: number;
}

/** ASR 结果 */
export interface ASRResult {
  text: string;
  timestamp: number;
  duration: number;
  confidence: number;
  language?: string;
}

/** 字幕生成选项 */
export interface SubtitleGenerationOptions {
  format: SubtitleFormat;
  style?: Partial<SubtitleStyleConfig>;
  language?: string;
  maxCharsPerLine?: number;
  maxDuration?: number;
  minDuration?: number;
}

/** 字幕导出结果 */
export interface SubtitleExportResult {
  content: string;
  format: SubtitleFormat;
  fileName: string;
  mimeType: string;
  size: number;
}

// ==================== 默认配置 ====================

export const DEFAULT_SUBTITLE_STYLE: SubtitleStyleConfig = {
  fontFamily: 'Microsoft YaHei',
  fontSize: 24,
  fontWeight: 'normal',
  italic: false,
  primaryColor: '&HFFFFFF',
  secondaryColor: '&H000000',
  outlineColor: '&H000000',
  backColor: '&H80000000',
  outlineWidth: 2,
  shadowDepth: 2,
  position: 'bottom',
  marginV: 10,
  alignment: 'center',
  backgroundEnabled: true,
  backgroundOpacity: 0.5,
  bold: false,
  underline: false,
  strikeout: false,
  rotation: 0,
};

// ==================== 时间格式化 ====================

/**
 * 毫秒转 SRT 时间格式 (00:00:00,000)
 */
export function msToSRTTime(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
}

/**
 * 秒转 SRT 时间格式 (00:00:00,000)
 */
export function secondsToSRTTime(seconds: number): string {
  return msToSRTTime(Math.round(seconds * 1000));
}

/**
 * 毫秒转 VTT 时间格式 (00:00:00.000)
 */
export function msToVTTTime(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

/**
 * 秒转 VTT 时间格式 (00:00:00.000)
 */
export function secondsToVTTTime(seconds: number): string {
  return msToVTTTime(Math.round(seconds * 1000));
}

/**
 * 秒转 ASS 时间格式 (0:00:00.00)
 */
export function secondsToASSTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const centisecs = Math.round((secs - Math.floor(secs)) * 100);
  
  return `${hours}:${minutes.toString().padStart(2, '0')}:${Math.floor(secs).toString().padStart(2, '0')}.${centisecs.toString().padStart(2, '0')}`;
}

/**
 * 解析 SRT 时间字符串为秒
 */
export function parseSRTTime(timeStr: string): number {
  const match = timeStr.match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/);
  if (!match) return 0;
  
  const [, hours, minutes, seconds, ms] = match;
  return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds) + parseInt(ms) / 1000;
}

/**
 * 解析 VTT 时间字符串为秒
 */
export function parseVTTTime(timeStr: string): number {
  const match = timeStr.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
  if (!match) return 0;
  
  const [, hours, minutes, seconds, ms] = match;
  return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds) + parseInt(ms) / 1000;
}

// ==================== 字幕格式生成 ====================

/**
 * 生成 SRT 格式字幕
 */
export function generateSRT(cues: SubtitleCue[]): string {
  return cues.map((cue, index) => {
    const startTime = secondsToSRTTime(cue.startTime);
    const endTime = secondsToSRTTime(cue.endTime);
    
    return `${index + 1}\n${startTime} --> ${endTime}\n${cue.text}\n`;
  }).join('\n');
}

/**
 * 生成 VTT 格式字幕
 */
export function generateVTT(cues: SubtitleCue[], style?: Partial<SubtitleStyleConfig>): string {
  const lines: string[] = ['WEBVTT', ''];
  
  // 添加样式设置
  if (style) {
    lines.push('STYLE');
    lines.push('');
  }
  
  cues.forEach((cue, index) => {
    const startTime = secondsToVTTTime(cue.startTime);
    const endTime = secondsToVTTTime(cue.endTime);
    
    // VTT 支持定位
    let position = '';
    if (style?.position === 'top') {
      position = ' line:10%';
    } else if (style?.position === 'middle') {
      position = ' line:50%';
    } else {
      position = ' line:90%';
    }
    
    let alignment = '';
    if (style?.alignment === 'left') {
      alignment = ' align:start';
    } else if (style?.alignment === 'right') {
      alignment = ' align:end';
    }
    
    lines.push(`${index + 1}`);
    lines.push(`${startTime}${position}${alignment} --> ${endTime}`);
    lines.push(cue.text);
    lines.push('');
  });
  
  return lines.join('\n');
}

/**
 * 生成 ASS 格式字幕
 */
export function generateASS(cues: SubtitleCue[], style: SubtitleStyleConfig = DEFAULT_SUBTITLE_STYLE): string {
  const lines: string[] = [
    '[Script Info]',
    `Title: ManGaAI Subtitle`,
    `ScriptType: v4.00+`,
    `Collisions: Normal`,
    `PlayResX: 1920`,
    `PlayResY: 1080`,
    `Timer: 100.0`,
    '',
    '[V4+ Styles]',
    `Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding`,
    `Style: Default,${style.fontFamily},${style.fontSize},${style.primaryColor},${style.secondaryColor},${style.outlineColor},${style.backColor},${style.bold ? -1 : 0},${style.italic ? -1 : 0},${style.underline ? -1 : 0},${style.strikeout ? -1 : 0},100,100,0,${style.rotation},${style.backgroundEnabled ? 3 : 1},${style.outlineWidth},${style.shadowDepth},${getASSAlignment(style.alignment, style.position)},10,10,${style.marginV},1`,
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ];
  
  cues.forEach((cue) => {
    const startTime = secondsToASSTime(cue.startTime);
    const endTime = secondsToASSTime(cue.endTime);
    const speaker = cue.speaker || '';
    
    // 处理ASS中的特殊字符
    const text = cue.text.replace(/\{/g, '\\{').replace(/\}/g, '\\}');
    
    lines.push(`Dialogue: 0,${startTime},${endTime},Default,${speaker},0,0,0,,${text}`);
  });
  
  return lines.join('\n');
}

/**
 * 获取 ASS 对齐值
 */
function getASSAlignment(horizontal: string, vertical: string): number {
  const alignMap: Record<string, Record<string, number>> = {
    left: { top: 7, middle: 4, bottom: 1 },
    center: { top: 8, middle: 5, bottom: 2 },
    right: { top: 9, middle: 6, bottom: 3 },
  };
  return alignMap[horizontal]?.[vertical] || 2;
}

// ==================== 字幕解析 ====================

/**
 * 解析 SRT 格式字幕
 */
export function parseSRT(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  const blocks = content.trim().split(/\n\n+/);
  
  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 2) continue;
    
    // 跳过序号
    let timeLineIndex = 0;
    if (!/^\d{2}:\d{2}:\d{2}/.test(lines[0])) {
      timeLineIndex = 1;
    }
    
    const timeMatch = lines[timeLineIndex]?.match(/(\d{2}:\d{2}:\d{2}[,.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,.]\d{3})/);
    if (!timeMatch) continue;
    
    const text = lines.slice(timeLineIndex + 1).join('\n');
    
    cues.push({
      id: uuidv4(),
      startTime: parseSRTTime(timeMatch[1]),
      endTime: parseSRTTime(timeMatch[2]),
      text,
    });
  }
  
  return cues;
}

/**
 * 解析 VTT 格式字幕
 */
export function parseVTT(content: string): SubtitleCue[] {
  const cues: SubtitleCue[] = [];
  const lines = content.split('\n');
  
  let i = 0;
  // 跳过 WEBVTT 和样式声明
  while (i < lines.length) {
    if (lines[i].startsWith('WEBVTT')) {
      i++;
      continue;
    }
    if (lines[i].startsWith('STYLE') || lines[i].startsWith('NOTE')) {
      while (i < lines.length && lines[i] !== '') i++;
      i++;
      continue;
    }
    if (lines[i].trim() === '') {
      i++;
      continue;
    }
    
    // 跳过序号
    if (/^\d+$/.test(lines[i].trim())) {
      i++;
    }
    
    if (i >= lines.length) break;
    
    const timeMatch = lines[i]?.match(/(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/);
    if (!timeMatch) {
      i++;
      continue;
    }
    
    i++;
    const textLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== '') {
      textLines.push(lines[i]);
      i++;
    }
    
    cues.push({
      id: uuidv4(),
      startTime: parseVTTTime(timeMatch[1]),
      endTime: parseVTTTime(timeMatch[2]),
      text: textLines.join('\n'),
    });
  }
  
  return cues;
}

// ==================== 时间轴对齐 ====================

/**
 * 智能时间轴对齐
 * 将原始 ASR 结果转换为带时间戳的字幕
 */
export function alignTimeline(
  asrResults: ASRResult[],
  options: {
    maxCharsPerLine?: number;
    maxDuration?: number;
    minDuration?: number;
    mergeShortSegments?: boolean;
  } = {}
): SubtitleCue[] {
  const {
    maxCharsPerLine = 50,
    maxDuration = 7,
    minDuration = 1,
    mergeShortSegments = true,
  } = options;
  
  const cues: SubtitleCue[] = [];
  
  for (const result of asrResults) {
    const text = result.text.trim();
    if (!text) continue;
    
    let startTime = result.timestamp;
    let endTime = result.timestamp + result.duration;
    
    // 根据字符数分割长文本
    const chars = text.length;
    let currentText = text;
    
    if (chars > maxCharsPerLine) {
      // 智能断句
      const lines = smartSplit(text, maxCharsPerLine);
      const lineDuration = (endTime - startTime) / lines.length;
      
      for (let i = 0; i < lines.length; i++) {
        const lineStart = startTime + i * lineDuration;
        const lineEnd = lineStart + lineDuration;
        
        cues.push({
          id: uuidv4(),
          startTime: Math.max(0, lineStart),
          endTime: Math.min(lineEnd, endTime),
          text: lines[i],
          confidence: result.confidence,
        });
      }
    } else {
      // 确保最小/最大时长
      let duration = endTime - startTime;
      if (duration < minDuration) {
        startTime = Math.max(0, startTime - (minDuration - duration) / 2);
        endTime = startTime + minDuration;
      } else if (duration > maxDuration) {
        endTime = startTime + maxDuration;
      }
      
      cues.push({
        id: uuidv4(),
        startTime,
        endTime,
        text,
        confidence: result.confidence,
      });
    }
  }
  
  // 合并短片段
  if (mergeShortSegments) {
    return mergeShortCues(cues, minDuration * 2);
  }
  
  return cues;
}

/**
 * 智能文本分割
 */
function smartSplit(text: string, maxLength: number): string[] {
  const lines: string[] = [];
  let currentLine = '';
  
  // 按句子分割
  const sentences = text.split(/([。！？.!?])/);
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    
    // 保留标点符号
    const isPunctuation = /^[。！？.!?]+$/.test(sentence);
    const potentialLine = currentLine + sentence;
    
    if (potentialLine.length <= maxLength) {
      currentLine = potentialLine;
    } else {
      if (currentLine) {
        lines.push(currentLine.trim());
      }
      
      // 如果单个句子超过最大长度，强制分割
      if (sentence.length > maxLength) {
        const chunks = sentence.match(new RegExp(`.{1,${maxLength}}`, 'g')) || [sentence];
        chunks.forEach((chunk, idx) => {
          if (idx === chunks.length - 1) {
            currentLine = chunk;
          } else {
            lines.push(chunk);
          }
        });
      } else {
        currentLine = sentence;
      }
    }
  }
  
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }
  
  return lines;
}

/**
 * 合并短片段
 */
function mergeShortCues(cues: SubtitleCue[], minDuration: number): SubtitleCue[] {
  if (cues.length <= 1) return cues;
  
  const merged: SubtitleCue[] = [];
  let current = { ...cues[0] };
  
  for (let i = 1; i < cues.length; i++) {
    const cue = cues[i];
    const currentDuration = current.endTime - current.startTime;
    
    // 如果当前片段足够长，或者与下一片段之间有明显间隔
    if (currentDuration >= minDuration || cue.startTime - current.endTime > 0.5) {
      merged.push(current);
      current = { ...cue };
    } else {
      // 合并
      current.endTime = cue.endTime;
      current.text += '\n' + cue.text;
    }
  }
  
  merged.push(current);
  return merged;
}

// ==================== 样式转换 ====================

/**
 * 将 HEX 颜色转换为 ASS 格式
 */
export function hexToASSColor(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = Math.round((1 - alpha) * 255);
  
  // ASS 颜色格式: &HAABBGGRR
  return `&H${a.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${r.toString(16).padStart(2, '0')}`;
}

/**
 * 将 UI 样式转换为 ASS 格式
 */
export function convertStyleToASS(style: Partial<SubtitleStyleConfig>): Partial<SubtitleStyleConfig> {
  const converted = { ...style };
  
  if (style.primaryColor) {
    converted.primaryColor = hexToASSColor(style.primaryColor);
  }
  if (style.outlineColor) {
    converted.outlineColor = hexToASSColor(style.outlineColor);
  }
  if (style.backColor) {
    const opacity = style.backgroundOpacity ?? 0.5;
    converted.backColor = hexToASSColor(style.backColor, opacity);
  }
  
  return converted;
}

// ==================== 字幕服务类 ====================

class SubtitleService {
  private style: SubtitleStyleConfig = { ...DEFAULT_SUBTITLE_STYLE };
  
  /**
   * 设置字幕样式
   */
  setStyle(style: Partial<SubtitleStyleConfig>): void {
    this.style = { ...this.style, ...style };
  }
  
  /**
   * 获取当前样式
   */
  getStyle(): SubtitleStyleConfig {
    return { ...this.style };
  }
  
  /**
   * 生成字幕
   */
  generate(cues: SubtitleCue[], options: SubtitleGenerationOptions): SubtitleExportResult {
    const format = options.format;
    let content: string;
    let fileName: string;
    let mimeType: string;
    
    switch (format) {
      case 'srt':
        content = generateSRT(cues);
        fileName = 'subtitle.srt';
        mimeType = 'text/plain';
        break;
      case 'vtt':
        content = generateVTT(cues, options.style);
        fileName = 'subtitle.vtt';
        mimeType = 'text/vtt';
        break;
      case 'ass':
        const assStyle = { ...this.style, ...options.style };
        content = generateASS(cues, assStyle);
        fileName = 'subtitle.ass';
        mimeType = 'text/plain';
        break;
      default:
        content = generateSRT(cues);
        fileName = 'subtitle.srt';
        mimeType = 'text/plain';
    }
    
    return {
      content,
      format,
      fileName,
      mimeType,
      size: new Blob([content]).size,
    };
  }
  
  /**
   * 导出字幕
   */
  export(cues: SubtitleCue[], format: SubtitleFormat): SubtitleExportResult {
    return this.generate(cues, { format, style: this.style });
  }
  
  /**
   * 解析字幕文件
   */
  parse(content: string, format?: SubtitleFormat): SubtitleCue[] {
    // 自动检测格式
    if (!format) {
      if (content.startsWith('WEBVTT')) {
        format = 'vtt';
      } else if (content.includes('[Script Info]')) {
        // ASS 格式需要更复杂的解析，这里简化处理
        return [];
      } else {
        format = 'srt';
      }
    }
    
    switch (format) {
      case 'srt':
        return parseSRT(content);
      case 'vtt':
        return parseVTT(content);
      default:
        return parseSRT(content);
    }
  }
  
  /**
   * ASR 结果转字幕
   */
  convertFromASR(asrResults: ASRResult[], options?: Partial<SubtitleGenerationOptions>): SubtitleCue[] {
    return alignTimeline(asrResults, {
      maxCharsPerLine: options?.maxCharsPerLine,
      maxDuration: options?.maxDuration,
      minDuration: options?.minDuration,
    });
  }
  
  /**
   * 生成预览 HTML
   */
  generatePreviewHTML(cues: SubtitleCue[], currentTime: number): string | null {
    const activeCue = cues.find(
      cue => currentTime >= cue.startTime && currentTime <= cue.endTime
    );
    
    return activeCue?.text || null;
  }
  
  /**
   * 下载字幕文件
   */
  download(cues: SubtitleCue[], format: SubtitleFormat): void {
    const result = this.export(cues, format);
    const blob = new Blob([result.content], { type: result.mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = result.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  /**
   * 创建字幕片段（手动添加）
   */
  createCue(startTime: number, endTime: number, text: string): SubtitleCue {
    return {
      id: uuidv4(),
      startTime,
      endTime,
      text,
    };
  }
  
  /**
   * 更新字幕时间
   */
  updateCueTime(cue: SubtitleCue, startTime: number, endTime: number): SubtitleCue {
    return { ...cue, startTime, endTime };
  }
  
  /**
   * 批量调整时间偏移
   */
  offsetCues(cues: SubtitleCue[], offset: number): SubtitleCue[] {
    return cues.map(cue => ({
      ...cue,
      startTime: Math.max(0, cue.startTime + offset),
      endTime: Math.max(0, cue.endTime + offset),
    }));
  }
  
  /**
   * 时间轴缩放
   */
  scaleCues(cues: SubtitleCue[], factor: number): SubtitleCue[] {
    return cues.map(cue => ({
      ...cue,
      startTime: cue.startTime * factor,
      endTime: cue.endTime * factor,
    }));
  }
}

export const subtitleService = new SubtitleService();
export default subtitleService;
