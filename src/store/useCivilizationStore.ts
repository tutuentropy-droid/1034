import { create } from 'zustand';
import type {
  CivilizationState,
  Stage,
  CivilizationStats,
  HistoryEntry,
  ChoiceResult,
  HistoricalEvent,
  EventResult,
} from '../types';
import { fetchAllStages, submitChoice, resetCivilization, checkEventTrigger, resolveEvent } from '../utils/api';

interface CivilizationStore extends CivilizationState {
  stages: Stage[];
  isLoading: boolean;
  error: string | null;
  currentStage: Stage | null;
  isTransitioning: boolean;
  transitionData: ChoiceResult | null;
  showFlavorText: boolean;
  currentEvent: HistoricalEvent | null;
  eventResult: EventResult | null;
  showEventModal: boolean;
  showEventResult: boolean;
  eventHistory: HistoryEntry[];

  init: () => Promise<void>;
  makeChoice: (choiceId: string) => Promise<void>;
  advanceStage: () => void;
  reset: () => Promise<void>;
  setCivilizationName: (name: string) => void;
  closeFlavorText: () => void;
  checkForEvent: () => Promise<void>;
  makeEventChoice: (choiceId: string) => Promise<void>;
  closeEventModal: () => void;
  closeEventResult: () => void;
}

const CIVILIZATION_NAMES = [
  '曙光部落',
  '晨曦之民',
  '河流之子',
  '星辰之族',
  '大地守望者',
  '火焰传承者',
  '智慧之邦',
  '永恒之民',
];

function getRandomCivilizationName(): string {
  return CIVILIZATION_NAMES[Math.floor(Math.random() * CIVILIZATION_NAMES.length)];
}

const initialStats: CivilizationStats = {
  population: 10,
  technology: 5,
  culture: 5,
  military: 5,
  agriculture: 0,
};

export const useCivilizationStore = create<CivilizationStore>((set, get) => ({
  currentStageId: '',
  stats: initialStats,
  history: [],
  isComplete: false,
  civilizationName: getRandomCivilizationName(),
  stages: [],
  isLoading: false,
  error: null,
  currentStage: null,
  isTransitioning: false,
  transitionData: null,
  showFlavorText: false,
  currentEvent: null,
  eventResult: null,
  showEventModal: false,
  showEventResult: false,
  eventHistory: [],

  init: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchAllStages();
      if (response.success && response.data) {
        const stages = response.data;
        const firstStage = stages[0];
        const initialState = {
          ...initialStats,
          ...firstStage.startingStats,
        } as CivilizationStats;

        set({
          stages,
          currentStageId: firstStage.id,
          currentStage: firstStage,
          stats: initialState,
          isLoading: false,
        });
      } else {
        throw new Error(response.error || 'Failed to load stages');
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },

  makeChoice: async (choiceId: string) => {
    const { currentStageId, stats, currentStage, history } = get();
    if (!currentStage) return;

    set({ isLoading: true });
    try {
      const response = await submitChoice(currentStageId, choiceId, stats);
      if (response.success && response.data) {
        const choice = currentStage.choices.find((c) => c.id === choiceId)!;
        const newHistory: HistoryEntry = {
          stageId: currentStageId,
          choiceId,
          timestamp: Date.now(),
          stageTitle: currentStage.title,
          choiceTitle: choice.title,
        };

        set({
          transitionData: response.data,
          history: [...history, newHistory],
          stats: response.data.newStats,
          isComplete: response.data.nextStage === null,
          showFlavorText: true,
          isLoading: false,
        });
      } else {
        throw new Error(response.error || 'Failed to process choice');
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },

  advanceStage: () => {
    const { transitionData } = get();
    if (!transitionData || !transitionData.nextStage) return;

    set({
      isTransitioning: true,
    });

    setTimeout(() => {
      set({
        currentStageId: transitionData.nextStage!.id,
        currentStage: transitionData.nextStage,
        transitionData: null,
        isTransitioning: false,
        showFlavorText: false,
      });
    }, 800);
  },

  reset: async () => {
    set({ isLoading: true });
    try {
      const response = await resetCivilization();
      if (response.success && response.data) {
        set({
          currentStageId: response.data.currentStage.id,
          currentStage: response.data.currentStage,
          stats: response.data.initialStats,
          history: [],
          isComplete: false,
          civilizationName: getRandomCivilizationName(),
          transitionData: null,
          showFlavorText: false,
          isTransitioning: false,
          isLoading: false,
          error: null,
          currentEvent: null,
          eventResult: null,
          showEventModal: false,
          showEventResult: false,
          eventHistory: [],
        });
      } else {
        throw new Error(response.error || 'Failed to reset');
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },

  setCivilizationName: (name: string) => {
    set({ civilizationName: name });
  },

  closeFlavorText: () => {
    set({ showFlavorText: false });
  },

  checkForEvent: async () => {
    const { stats, currentStage, isComplete, showEventModal, showFlavorText, isTransitioning } = get();
    if (!currentStage || isComplete || showEventModal || showFlavorText || isTransitioning) return;

    try {
      const response = await checkEventTrigger(stats, currentStage.eraColor);
      if (response.success && response.data?.shouldTrigger && response.data.event) {
        set({
          currentEvent: response.data.event,
          showEventModal: true,
        });
      }
    } catch (error) {
      console.error('Failed to check for event:', error);
    }
  },

  makeEventChoice: async (choiceId: string) => {
    const { currentEvent, stats, eventHistory } = get();
    if (!currentEvent) return;

    set({ isLoading: true });
    try {
      const response = await resolveEvent(currentEvent.id, choiceId, stats);
      if (response.success && response.data) {
        const choice = currentEvent.choices.find((c) => c.id === choiceId)!;
        const newHistoryEntry: HistoryEntry = {
          stageId: `event-${currentEvent.id}`,
          choiceId,
          timestamp: Date.now(),
          stageTitle: currentEvent.title,
          choiceTitle: choice.title,
        };

        set({
          eventResult: response.data,
          stats: response.data.newStats,
          showEventModal: false,
          showEventResult: true,
          eventHistory: [...eventHistory, newHistoryEntry],
          isLoading: false,
        });
      } else {
        throw new Error(response.error || 'Failed to process event choice');
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false,
      });
    }
  },

  closeEventModal: () => {
    set({ showEventModal: false, currentEvent: null });
  },

  closeEventResult: () => {
    set({ showEventResult: false, eventResult: null });
  },
}));
