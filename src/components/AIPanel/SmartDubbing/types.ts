import { TTSProvider } from '@/core/services/tts.service';

export interface Voiceover {
  id: string;
  text: string;
  voice: string;
  provider: TTSProvider;
  duration: number;
  status: 'pending' | 'generating' | 'completed' | 'error';
  audioUrl?: string;
  error?: string;
}

export interface SmartDubbingProps {
  onGenerate?: (voiceover: Voiceover) => void;
  onPlay?: (voiceover: Voiceover) => void;
}
