/**
 * TTS 语音合成服务
 * 支持多种国产 TTS 引擎：Edge TTS（免费）、阿里云、百度、讯飞
 */

import { message } from 'antd';

// TTS 提供商类型
export type TTSProvider = 'edge' | 'aliyun' | 'baidu' | 'xunfei';

// TTS 配置
export interface TTSConfig {
  provider: TTSProvider;
  apiKey?: string;
  apiSecret?: string;
  appId?: string; // 讯飞需要
  region?: string; // 阿里云区域
}

// TTS 选项
export interface TTSOptions {
  text: string;
  voice: string;
  speed?: number; // 语速 0.5-2.0
  pitch?: number; // 音调 -10 到 10
  volume?: number; // 音量 0-100
  format?: 'mp3' | 'wav' | 'pcm';
}

// TTS 结果
export interface TTSResult {
  audioUrl: string; // blob URL
  duration: number; // 预估时长（秒）
  text: string;
  voice: string;
}

// Edge TTS 语音选项
export const EDGE_VOICES = [
  { id: 'zh-CN-XiaoxiaoNeural', name: '晓晓', gender: '女', style: '温柔', locale: 'zh-CN' },
  { id: 'zh-CN-YunxiNeural', name: '云希', gender: '男', style: '自然', locale: 'zh-CN' },
  { id: 'zh-CN-YunyangNeural', name: '云扬', gender: '男', style: '专业', locale: 'zh-CN' },
  { id: 'zh-CN-XiaoyiNeural', name: '小艺', gender: '女', style: '活泼', locale: 'zh-CN' },
  { id: 'zh-CN-XiaochenNeural', name: '晓晨', gender: '女', style: '甜美', locale: 'zh-CN' },
  { id: 'zh-CN-XiaohanNeural', name: '晓涵', gender: '女', style: '知性', locale: 'zh-CN' },
  { id: 'zh-CN-XiaomengNeural', name: '晓梦', gender: '女', style: '温柔', locale: 'zh-CN' },
  { id: 'zh-CN-XiaomoNeural', name: '晓墨', gender: '男', style: '磁性', locale: 'zh-CN' },
  { id: 'zh-CN-XiaoruiNeural', name: '晓睿', gender: '男', style: '成熟', locale: 'zh-CN' },
  { id: 'zh-CN-XiaoshuangNeural', name: '晓双', gender: '女', style: '活泼', locale: 'zh-CN' },
  { id: 'zh-CN-XiaoxuanNeural', name: '晓萱', gender: '女', style: '清新', locale: 'zh-CN' },
  { id: 'zh-CN-XiaoyanNeural', name: '晓颜', gender: '女', style: '标准', locale: 'zh-CN' },
  { id: 'zh-CN-XiaoyouNeural', name: '晓悠', gender: '女', style: '可爱', locale: 'zh-CN' },
  { id: 'zh-CN-YunfengNeural', name: '云峰', gender: '男', style: '磁性', locale: 'zh-CN' },
  { id: 'zh-CN-YunhaoNeural', name: '云皓', gender: '男', style: '阳光', locale: 'zh-CN' },
  { id: 'zh-CN-YunjianNeural', name: '云健', gender: '男', style: '解说', locale: 'zh-CN' },
  { id: 'zh-CN-YunxiaNeural', name: '云夏', gender: '男', style: '少年', locale: 'zh-CN' },
  { id: 'zh-CN-YunyeNeural', name: '云野', gender: '男', style: '磁性', locale: 'zh-CN' },
  { id: 'zh-CN-YunzeNeural', name: '云泽', gender: '男', style: '成熟', locale: 'zh-CN' },
  { id: 'zh-CN-liaoning-XiaobeiNeural', name: '晓北', gender: '女', style: '东北话', locale: 'zh-CN-liaoning' },
  { id: 'zh-CN-shaanxi-XiaoniNeural', name: '晓妮', gender: '女', style: '陕西话', locale: 'zh-CN-shaanxi' },
  { id: 'zh-HK-HiuMaanNeural', name: '晓曼', gender: '女', style: '粤语', locale: 'zh-HK' },
  { id: 'zh-HK-WanLungNeural', name: '云龙', gender: '男', style: '粤语', locale: 'zh-HK' },
  { id: 'zh-TW-HsiaoChenNeural', name: '晓晨', gender: '女', style: '台湾腔', locale: 'zh-TW' },
  { id: 'zh-TW-YunJheNeural', name: '云哲', gender: '男', style: '台湾腔', locale: 'zh-TW' },
];

// 阿里云语音选项
export const ALIYUN_VOICES = [
  { id: 'xiaoyun', name: '小云', gender: '女', style: '标准' },
  { id: 'xiaogang', name: '小刚', gender: '男', style: '标准' },
  { id: 'ruoxi', name: '若兮', gender: '女', style: '温柔' },
  { id: 'siqi', name: '思琪', gender: '女', style: '温柔' },
  { id: 'sijia', name: '思佳', gender: '女', style: '标准' },
  { id: 'sicheng', name: '思诚', gender: '男', style: '标准' },
  { id: 'aiqi', name: '艾琪', gender: '女', style: '活泼' },
  { id: 'aidi', name: '艾迪', gender: '男', style: '活泼' },
  { id: 'ailing', name: '艾琳', gender: '女', style: '知性' },
  { id: 'aimei', name: '艾美', gender: '女', style: '甜美' },
  { id: 'aiyu', name: '艾雨', gender: '男', style: '磁性' },
  { id: 'aiyue', name: '艾悦', gender: '女', style: '温柔' },
  { id: 'aijing', name: '艾静', gender: '女', style: '温柔' },
  { id: 'xiaomei', name: '小美', gender: '女', style: '甜美' },
  { id: 'aina', name: '艾娜', gender: '女', style: '活泼' },
  { id: 'yina', name: '伊娜', gender: '女', style: '知性' },
  { id: 'sijing', name: '思静', gender: '女', style: '温柔' },
  { id: 'sitong', name: '思彤', gender: '女', style: '儿童' },
  { id: 'xiaobei', name: '小北', gender: '女', style: '东北话' },
  { id: 'xiaoxue', name: '小雪', gender: '女', style: '粤语' },
];

// 百度语音选项
export const BAIDU_VOICES = [
  { id: '0', name: '度小美', gender: '女', style: '标准' },
  { id: '1', name: '度小宇', gender: '男', style: '标准' },
  { id: '3', name: '度逍遥', gender: '男', style: '武侠' },
  { id: '4', name: '度丫丫', gender: '女', style: '儿童' },
  { id: '5', name: '度小博', gender: '男', style: '新闻' },
  { id: '103', name: '度米朵', gender: '女', style: '儿童' },
  { id: '106', name: '度博文', gender: '男', style: '解说' },
  { id: '110', name: '度小童', gender: '女', style: '儿童' },
  { id: '111', name: '度小萌', gender: '女', style: '可爱' },
  { id: '5003', name: '度逍遥', gender: '男', style: '精品' },
  { id: '5118', name: '度小鹿', gender: '女', style: '甜美' },
];

// 讯飞语音选项
export const XUNFEI_VOICES = [
  { id: 'xiaoyan', name: '小燕', gender: '女', style: '标准' },
  { id: 'aisjiuxu', name: '许久', gender: '男', style: '磁性' },
  { id: 'aisxping', name: '小萍', gender: '女', style: '温柔' },
  { id: 'aisjinger', name: '靖儿', gender: '女', style: '活泼' },
  { id: 'aisbabyxu', name: '许小宝', gender: '男', style: '儿童' },
];

class TTSService {
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  /**
   * 获取语音列表
   */
  getVoices(provider: TTSProvider) {
    switch (provider) {
      case 'edge':
        return EDGE_VOICES;
      case 'aliyun':
        return ALIYUN_VOICES;
      case 'baidu':
        return BAIDU_VOICES;
      case 'xunfei':
        return XUNFEI_VOICES;
      default:
        return EDGE_VOICES;
    }
  }

  /**
   * 合成语音
   * 优先使用 Edge TTS（免费）
   */
  async synthesize(
    options: TTSOptions,
    config?: TTSConfig
  ): Promise<TTSResult> {
    const provider = config?.provider || 'edge';

    switch (provider) {
      case 'edge':
        return this.synthesizeEdge(options);
      case 'aliyun':
        if (!config?.apiKey) throw new Error('阿里云 TTS 需要 API Key');
        return this.synthesizeAliyun(options, config);
      case 'baidu':
        if (!config?.apiKey || !config?.apiSecret) {
          throw new Error('百度 TTS 需要 API Key 和 Secret');
        }
        return this.synthesizeBaidu(options, config);
      case 'xunfei':
        if (!config?.appId || !config?.apiKey) {
          throw new Error('讯飞 TTS 需要 App ID 和 API Key');
        }
        return this.synthesizeXunfei(options, config);
      default:
        return this.synthesizeEdge(options);
    }
  }

  /**
   * Edge TTS 合成（免费）
   * 使用 Microsoft Azure 的免费 TTS 服务
   */
  private async synthesizeEdge(options: TTSOptions): Promise<TTSResult> {
    const { text, voice, speed = 1, pitch = 0, volume = 80 } = options;

    // 构建 SSML
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN">
        <voice name="${voice}">
          <prosody rate="${this.mapSpeedToPercentage(speed)}" pitch="${this.mapPitchToPercentage(pitch)}" volume="${volume}%">
            ${this.escapeXml(text)}
          </prosody>
        </voice>
      </speak>
    `;

    try {
      // 使用 Edge TTS 的公开 API
      const response = await fetch('https://speech.platform.bing.com/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        body: ssml,
      });

      if (!response.ok) {
        // Edge API 可能受限，使用备用方案：Web Speech API
        return this.synthesizeWebSpeech(options);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const duration = this.estimateDuration(text, speed);

      return {
        audioUrl,
        duration,
        text,
        voice,
      };
    } catch (error) {
      // 降级到 Web Speech API
      return this.synthesizeWebSpeech(options);
    }
  }

  /**
   * Web Speech API 合成（浏览器原生，免费）
   * 作为 Edge TTS 的备用方案
   */
  private async synthesizeWebSpeech(options: TTSOptions): Promise<TTSResult> {
    const { text, voice, speed = 1, pitch = 0, volume = 80 } = options;

    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('浏览器不支持语音合成'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = speed;
      utterance.pitch = 1 + pitch / 10;
      utterance.volume = volume / 100;

      // 尝试匹配语音
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => v.name.includes('Chinese') || v.lang === 'zh-CN');
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      // 使用 MediaRecorder 录制音频
      const audioChunks: Blob[] = [];
      
      utterance.onend = () => {
        const duration = this.estimateDuration(text, speed);
        // Web Speech API 无法直接获取音频数据，返回模拟 URL
        resolve({
          audioUrl: '', // 空表示使用浏览器原生播放
          duration,
          text,
          voice,
        });
      };

      utterance.onerror = (error) => {
        reject(new Error(`语音合成失败: ${error}`));
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * 阿里云 TTS 合成
   * 文档: https://help.aliyun.com/document_detail/84435.html
   */
  private async synthesizeAliyun(
    options: TTSOptions,
    config: TTSConfig
  ): Promise<TTSResult> {
    const { text, voice, speed = 1, pitch = 0, volume = 80 } = options;

    // 阿里云语音合成 API
    const response = await fetch('https://nls-gateway-cn-shanghai.aliyuncs.com/stream/v1/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-NLS-Token': config.apiKey!,
      },
      body: JSON.stringify({
        appkey: config.apiKey,
        text,
        format: 'mp3',
        sample_rate: 16000,
        voice,
        volume: Math.round(volume),
        speech_rate: Math.round((speed - 1) * 100),
        pitch_rate: Math.round(pitch * 10),
      }),
    });

    if (!response.ok) {
      throw new Error(`阿里云 TTS 错误: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const duration = this.estimateDuration(text, speed);

    return {
      audioUrl,
      duration,
      text,
      voice,
    };
  }

  /**
   * 百度 TTS 合成
   * 文档: https://ai.baidu.com/ai-doc/SPEECH/Gk4nlz8tc
   */
  private async synthesizeBaidu(
    options: TTSOptions,
    config: TTSConfig
  ): Promise<TTSResult> {
    const { text, voice, speed = 1, pitch = 0, volume = 80 } = options;

    // 获取 access token
    const tokenResponse = await fetch(
      `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${config.apiKey}&client_secret=${config.apiSecret}`,
      { method: 'POST' }
    );

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 调用 TTS API
    const params = new URLSearchParams({
      tex: encodeURIComponent(text),
      tok: accessToken,
      cuid: 'manga-ai',
      ctp: '1',
      lan: 'zh',
      spd: String(Math.round(speed * 5)), // 0-15
      pit: String(Math.round(pitch + 5)), // 0-9
      vol: String(Math.round(volume / 10)), // 0-15
      per: voice,
      aue: '3', // mp3
    });

    const response = await fetch(`https://tsn.baidu.com/text2audio?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`百度 TTS 错误: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const duration = this.estimateDuration(text, speed);

    return {
      audioUrl,
      duration,
      text,
      voice,
    };
  }

  /**
   * 讯飞 TTS 合成
   * 文档: https://www.xfyun.cn/doc/tts/online_tts/API.html
   */
  private async synthesizeXunfei(
    options: TTSOptions,
    config: TTSConfig
  ): Promise<TTSResult> {
    const { text, voice, speed = 1, pitch = 0, volume = 80 } = options;

    // 讯飞 WebSocket TTS
    const wsUrl = 'wss://tts-api.xfyun.cn/v2/tts';
    
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      const audioData: string[] = [];

      ws.onopen = () => {
        // 发送鉴权和参数
        const params = {
          common: {
            app_id: config.appId,
          },
          business: {
            aue: 'lame', // mp3
            sfl: 1,
            auf: 'audio/L16;rate=16000',
            vcn: voice,
            speed: Math.round(speed * 100),
            volume: Math.round(volume),
            pitch: Math.round(pitch * 10),
            bgs: 0,
            tte: 'UTF8',
          },
          data: {
            status: 2,
            text: btoa(unescape(encodeURIComponent(text))),
          },
        };

        ws.send(JSON.stringify(params));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.code !== 0) {
          reject(new Error(`讯飞 TTS 错误: ${data.message}`));
          return;
        }

        if (data.data && data.data.audio) {
          audioData.push(data.data.audio);
        }

        if (data.data && data.data.status === 2) {
          // 合成完成
          ws.close();
          const audioBase64 = audioData.join('');
          const audioBlob = this.base64ToBlob(audioBase64, 'audio/mp3');
          const audioUrl = URL.createObjectURL(audioBlob);
          const duration = this.estimateDuration(text, speed);

          resolve({
            audioUrl,
            duration,
            text,
            voice,
          });
        }
      };

      ws.onerror = (error) => {
        reject(new Error('讯飞 TTS WebSocket 错误'));
      };
    });
  }

  /**
   * 播放音频
   */
  play(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!audioUrl) {
        // 使用 Web Speech API 播放
        reject(new Error('使用浏览器原生播放'));
        return;
      }

      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.onended = () => resolve();
      this.currentAudio.onerror = () => reject(new Error('音频播放失败'));
      this.currentAudio.play();
    });
  }

  /**
   * 停止播放
   */
  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * 下载音频
   */
  download(audioUrl: string, filename: string): void {
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /**
   * 估算音频时长
   */
  private estimateDuration(text: string, speed: number): number {
    // 中文大约每秒 4-5 个字
    const chineseChars = text.match(/[\u4e00-\u9fa5]/g)?.length || 0;
    const otherChars = text.length - chineseChars;
    const duration = (chineseChars / 4.5 + otherChars / 10) / speed;
    return Math.max(1, Math.round(duration));
  }

  /**
   * 语速映射为百分比
   */
  private mapSpeedToPercentage(speed: number): string {
    // speed: 0.5-2.0 -> percentage: -50% to +100%
    const percentage = Math.round((speed - 1) * 100);
    return percentage >= 0 ? `+${percentage}%` : `${percentage}%`;
  }

  /**
   * 音调映射为百分比
   */
  private mapPitchToPercentage(pitch: number): string {
    // pitch: -10 to 10 -> percentage: -20% to +20%
    const percentage = Math.round(pitch * 2);
    return percentage >= 0 ? `+${percentage}%` : `${percentage}%`;
  }

  /**
   * XML 转义
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Base64 转 Blob
   */
  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }
}

// 导出单例
export const ttsService = new TTSService();
export default ttsService;
