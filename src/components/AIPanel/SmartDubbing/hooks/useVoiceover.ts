import { useState, useCallback, useRef } from 'react';
import { message } from 'antd';
import { ttsService, TTSProvider } from '@/core/services/tts.service';
import { Voiceover } from '../types';

export const useVoiceover = () => {
  const [voiceText, setVoiceText] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<TTSProvider>('edge');
  const [selectedVoice, setSelectedVoice] = useState<string>('zh-CN-XiaoxiaoNeural');
  const [speed, setSpeed] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(0);
  const [volume, setVolume] = useState<number>(80);
  const [voiceovers, setVoiceovers] = useState<Voiceover[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const generateVoiceover = async () => {
    if (!voiceText.trim()) {
      message.warning('请输入配音文本');
      return;
    }

    setIsGenerating(true);
    const id = Date.now().toString();

    const newVoiceover: Voiceover = {
      id,
      text: voiceText,
      voice: selectedVoice,
      provider: selectedProvider,
      duration: 0,
      status: 'generating',
    };

    setVoiceovers((prev) => [newVoiceover, ...prev]);

    try {
      const result = await ttsService.synthesize({
        text: voiceText.trim(),
        voice: selectedVoice,
        provider: selectedProvider,
        speed,
        pitch,
        volume,
      });

      if (result.success && result.audioUrl) {
        setVoiceovers((prev) =>
          prev.map((v) =>
            v.id === id
              ? { ...v, status: 'completed', audioUrl: result.audioUrl, duration: result.duration || 0 }
              : v
          )
        );
        message.success('配音生成完成');
      } else {
        throw new Error(result.error || '生成失败');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '生成失败';
      setVoiceovers((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: 'error', error: errorMsg } : v))
      );
      message.error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const playVoiceover = useCallback((voiceover: Voiceover) => {
    if (!voiceover.audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(voiceover.audioUrl);
    audioRef.current = audio;
    setPlayingId(voiceover.id);

    audio.onended = () => {
      setPlayingId(null);
      audioRef.current = null;
    };

    audio.onerror = () => {
      message.error('播放失败');
      setPlayingId(null);
      audioRef.current = null;
    };

    audio.play().catch(() => {
      message.error('播放失败');
      setPlayingId(null);
      audioRef.current = null;
    });
  }, []);

  const pauseVoiceover = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingId(null);
  }, []);

  const deleteVoiceover = useCallback((id: string) => {
    setVoiceovers((prev) => prev.filter((v) => v.id !== id));
    if (playingId === id) {
      pauseVoiceover();
    }
  }, [playingId, pauseVoiceover]);

  const downloadVoiceover = useCallback((voiceover: Voiceover) => {
    if (!voiceover.audioUrl) return;

    const a = document.createElement('a');
    a.href = voiceover.audioUrl;
    a.download = `voiceover_${voiceover.id}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  return {
    // State
    voiceText,
    selectedProvider,
    selectedVoice,
    speed,
    pitch,
    volume,
    voiceovers,
    playingId,
    isGenerating,
    // Setters
    setVoiceText,
    setSelectedProvider,
    setSelectedVoice,
    setSpeed,
    setPitch,
    setVolume,
    // Actions
    generateVoiceover,
    playVoiceover,
    pauseVoiceover,
    deleteVoiceover,
    downloadVoiceover,
  };
};

export default useVoiceover;
