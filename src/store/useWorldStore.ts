import { create } from 'zustand';
import type { WorldState, AIAction, AICivilization } from '../types';
import { initializeWorld, processTurn, getPlayerActions } from '../lib/gameEngine';

interface WorldStore {
  worldState: WorldState | null;
  isLoading: boolean;
  error: string | null;
  selectedCivilization: AICivilization | null;
  gameMode: 'classic' | 'multiCiv';

  initMultiCivGame: (playerName?: string) => void;
  executePlayerAction: (action: AIAction) => void;
  selectCivilization: (civ: AICivilization | null) => void;
  setGameMode: (mode: 'classic' | 'multiCiv') => void;
  resetMultiCivGame: () => void;
  getAvailableActions: () => AIAction[];
}

export const useWorldStore = create<WorldStore>((set, get) => ({
  worldState: null,
  isLoading: false,
  error: null,
  selectedCivilization: null,
  gameMode: 'classic',

  initMultiCivGame: (playerName = '你的文明') => {
    set({ isLoading: true });
    try {
      const worldState = initializeWorld(playerName);
      set({ worldState, isLoading: false, error: null });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '未知错误',
        isLoading: false,
      });
    }
  },

  executePlayerAction: (action: AIAction) => {
    const { worldState } = get();
    if (!worldState || worldState.gameOver) return;

    set({ isLoading: true });
    try {
      const newState = processTurn(worldState, action);
      set({ worldState: newState, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '未知错误',
        isLoading: false,
      });
    }
  },

  selectCivilization: (civ) => {
    set({ selectedCivilization: civ });
  },

  setGameMode: (mode) => {
    set({ gameMode: mode });
    if (mode === 'multiCiv' && !get().worldState) {
      get().initMultiCivGame();
    }
  },

  resetMultiCivGame: () => {
    const { worldState } = get();
    if (worldState) {
      const playerName = worldState.civilizations.find(c => c.id === worldState.playerCivilizationId)?.name || '你的文明';
      get().initMultiCivGame(playerName);
    }
  },

  getAvailableActions: () => {
    const { worldState } = get();
    if (!worldState) return [];
    return getPlayerActions(worldState);
  },
}));
