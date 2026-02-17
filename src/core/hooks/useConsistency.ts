/**
 * 一致性管理 Hook
 * 管理角色一致性和解说风格统一
 */

import { useState, useCallback, useMemo } from 'react';
import {
  consistencyService,
  type Character,
  type NarrationStyle,
  type ConsistencyIssue,
  type ConsistencyCheckpoint
} from '@/core/services/consistency.service';

// Hook 返回类型
export interface UseConsistencyReturn {
  // 角色管理
  characters: Character[];
  createCharacter: (data: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => Character;
  updateCharacter: (id: string, updates: Partial<Character>) => Character | null;
  deleteCharacter: (id: string) => void;
  getCharacter: (id: string) => Character | undefined;

  // 解说风格
  styles: NarrationStyle[];
  createStyle: (data: Omit<NarrationStyle, 'id'>) => NarrationStyle;
  getStyle: (id: string) => NarrationStyle | undefined;

  // 一致性检查
  checkCharacter: (characterId: string, description: string) => ConsistencyIssue[];
  checkNarration: (styleId: string, text: string) => ConsistencyIssue[];
  autoFix: (content: string, issues: ConsistencyIssue[], context: any) => string;

  // 生成提示词
  getCharacterPrompt: (characterId: string) => string;
  getNarrationPrompt: (styleId: string) => string;

  // 导出
  exportHandbook: () => string;

  // 统计
  stats: {
    characterCount: number;
    styleCount: number;
    hasMainCharacter: boolean;
  };
}

export function useConsistency(projectId: string): UseConsistencyReturn {
  // 角色状态
  const [characters, setCharacters] = useState<Character[]>(() => {
    return consistencyService.getAllCharacters();
  });

  // 风格状态
  const [styles, setStyles] = useState<NarrationStyle[]>(() => {
    return Array.from(consistencyService.getAllCharacters()).map(() =>
      consistencyService.getNarrationStyle('default')
    ).filter(Boolean) as NarrationStyle[];
  });

  // 创建角色
  const createCharacter = useCallback((
    data: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>
  ): Character => {
    const character = consistencyService.createCharacter(data);
    setCharacters(prev => [...prev, character]);
    return character;
  }, []);

  // 更新角色
  const updateCharacter = useCallback((
    id: string,
    updates: Partial<Character>
  ): Character | null => {
    const updated = consistencyService.updateCharacter(id, updates);
    if (updated) {
      setCharacters(prev =>
        prev.map(c => c.id === id ? updated : c)
      );
    }
    return updated;
  }, []);

  // 删除角色
  const deleteCharacter = useCallback((id: string): void => {
    setCharacters(prev => prev.filter(c => c.id !== id));
  }, []);

  // 获取角色
  const getCharacter = useCallback((id: string): Character | undefined => {
    return consistencyService.getCharacter(id);
  }, []);

  // 创建风格
  const createStyle = useCallback((
    data: Omit<NarrationStyle, 'id'>
  ): NarrationStyle => {
    const style = consistencyService.createNarrationStyle(data);
    setStyles(prev => [...prev, style]);
    return style;
  }, []);

  // 获取风格
  const getStyle = useCallback((id: string): NarrationStyle | undefined => {
    return consistencyService.getNarrationStyle(id);
  }, []);

  // 检查角色一致性
  const checkCharacter = useCallback((
    characterId: string,
    description: string
  ): ConsistencyIssue[] => {
    return consistencyService.checkCharacterConsistency(characterId, description);
  }, []);

  // 检查解说一致性
  const checkNarration = useCallback((
    styleId: string,
    text: string
  ): ConsistencyIssue[] => {
    return consistencyService.checkNarrationConsistency(styleId, text);
  }, []);

  // 自动修复
  const autoFix = useCallback((
    content: string,
    issues: ConsistencyIssue[],
    context: any
  ): string => {
    return consistencyService.autoFix(content, issues, context);
  }, []);

  // 获取角色提示词
  const getCharacterPrompt = useCallback((characterId: string): string => {
    const character = consistencyService.getCharacter(characterId);
    if (!character) return '';
    return consistencyService.generateCharacterPrompt(character);
  }, []);

  // 获取解说提示词
  const getNarrationPrompt = useCallback((styleId: string): string => {
    const style = consistencyService.getNarrationStyle(styleId);
    if (!style) return '';
    return consistencyService.generateNarrationPrompt(style);
  }, []);

  // 导出手册
  const exportHandbook = useCallback((): string => {
    return consistencyService.exportCharacterHandbook(projectId);
  }, [projectId]);

  // 统计
  const stats = useMemo(() => ({
    characterCount: characters.length,
    styleCount: styles.length,
    hasMainCharacter: characters.some(c => c.name.includes('主角') || c.name.includes('Main'))
  }), [characters, styles]);

  return {
    characters,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    getCharacter,
    styles,
    createStyle,
    getStyle,
    checkCharacter,
    checkNarration,
    autoFix,
    getCharacterPrompt,
    getNarrationPrompt,
    exportHandbook,
    stats
  };
}

export default useConsistency;
