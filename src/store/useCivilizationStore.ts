import { create } from 'zustand';
import type {
  CivilizationState,
  Stage,
  CivilizationStats,
  HistoryEntry,
  ChoiceResult,
  HistoricalEvent,
  EventResult,
  GreatPersonAction,
  GreatPersonState,
  EraStage,
  CivilizationCulture,
} from '../types';
void 0 as import('../types').GreatPerson;
void 0 as import('../types').GreatPersonTimelineEvent;
import { fetchAllStages, submitChoice, resetCivilization, checkEventTrigger, resolveEvent } from '../utils/api';
import {
  tryGenerateGreatPerson,
  getActionEffects,
  getActionFlavorText,
  updateGreatPersonStatus,
  createTimelineEvent,
  applyGreatPersonEffects,
  processTurnlyGreatPersonEffects,
} from '../lib/greatPersonEngine';
import {
  generateCivilizationCulture,
  applyCultureBonus,
} from '../lib/storyGenerator';

interface CivilizationStore extends CivilizationState, GreatPersonState {
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
  currentTurn: number;
  lastGreatPersonTurn: number;
  culture: CivilizationCulture | null;
  showCulturePage: boolean;
  effectiveStats: CivilizationStats;

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
  checkForGreatPerson: () => void;
  makeGreatPersonChoice: (action: GreatPersonAction) => void;
  closeGreatPersonModal: () => void;
  closeGreatPersonResult: () => void;
  openCulturePage: () => void;
  closeCulturePage: () => void;
  regenerateCulture: () => void;
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

function computeEffectiveStats(stats: CivilizationStats, culture: CivilizationCulture | null): CivilizationStats {
  if (!culture) return { ...stats };
  return applyCultureBonus(stats, culture);
}

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
  activeGreatPerson: null,
  greatPersonHistory: [],
  timelineEvents: [],
  usedGreatPersonIds: [],
  showGreatPersonModal: false,
  showGreatPersonResult: false,
  greatPersonResult: null,
  currentTurn: 0,
  lastGreatPersonTurn: -10,
  culture: null,
  showCulturePage: false,
  effectiveStats: initialStats,

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

        const era = firstStage.eraColor as EraStage;
        const culture = generateCivilizationCulture(era, initialState, 0);
        const effectiveStats = computeEffectiveStats(initialState, culture);

        set({
          stages,
          currentStageId: firstStage.id,
          currentStage: firstStage,
          stats: initialState,
          effectiveStats,
          culture,
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
    const { currentStageId, stats, currentStage, history, currentTurn, activeGreatPerson, greatPersonHistory, timelineEvents, culture } = get();
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

        let newStats = response.data.newStats;
        let updatedActiveGreatPerson = activeGreatPerson;
        let updatedGreatPersonHistory = greatPersonHistory;
        let updatedTimelineEvents = timelineEvents;
        const newTurn = currentTurn + 1;

        if (activeGreatPerson && activeGreatPerson.status === 'active' && activeGreatPerson.actionTaken === 'support') {
          const turnResult = processTurnlyGreatPersonEffects(activeGreatPerson, newStats);
          newStats = turnResult.stats;

          if (turnResult.events.length > 0) {
            updatedTimelineEvents = [...timelineEvents, ...turnResult.events];
          }

          if (turnResult.shouldRetire) {
            const deceasedPerson = {
              ...activeGreatPerson,
              status: 'deceased' as const,
              deathYear: activeGreatPerson.birthYear + 50 + Math.floor(Math.random() * 30),
            };
            updatedGreatPersonHistory = [...greatPersonHistory, deceasedPerson];
            updatedActiveGreatPerson = null;
          } else {
            updatedActiveGreatPerson = {
              ...activeGreatPerson,
              activeTurns: activeGreatPerson.activeTurns + 1,
            };
          }
        }

        const effectiveStats = computeEffectiveStats(newStats, culture);

        set({
          transitionData: response.data,
          history: [...history, newHistory],
          stats: newStats,
          effectiveStats,
          isComplete: response.data.nextStage === null,
          showFlavorText: true,
          isLoading: false,
          currentTurn: newTurn,
          activeGreatPerson: updatedActiveGreatPerson,
          greatPersonHistory: updatedGreatPersonHistory,
          timelineEvents: updatedTimelineEvents,
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
        const era = response.data.currentStage.eraColor as EraStage;
        const culture = generateCivilizationCulture(era, response.data.initialStats, 0);
        const effectiveStats = computeEffectiveStats(response.data.initialStats, culture);

        set({
          currentStageId: response.data.currentStage.id,
          currentStage: response.data.currentStage,
          stats: response.data.initialStats,
          effectiveStats,
          culture,
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
          activeGreatPerson: null,
          greatPersonHistory: [],
          timelineEvents: [],
          usedGreatPersonIds: [],
          showGreatPersonModal: false,
          showGreatPersonResult: false,
          greatPersonResult: null,
          currentTurn: 0,
          lastGreatPersonTurn: -10,
          showCulturePage: false,
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
    const { currentEvent, stats, eventHistory, culture } = get();
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

        const newStats = response.data.newStats;
        const effectiveStats = computeEffectiveStats(newStats, culture);

        set({
          eventResult: response.data,
          stats: newStats,
          effectiveStats,
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

  checkForGreatPerson: () => {
    const {
      stats,
      currentStage,
      isComplete,
      showEventModal,
      showFlavorText,
      isTransitioning,
      showGreatPersonModal,
      showGreatPersonResult,
      activeGreatPerson,
      usedGreatPersonIds,
      currentTurn,
      lastGreatPersonTurn,
    } = get();

    if (
      !currentStage ||
      isComplete ||
      showEventModal ||
      showFlavorText ||
      isTransitioning ||
      showGreatPersonModal ||
      showGreatPersonResult
    ) {
      return;
    }

    const era = currentStage.eraColor as EraStage;
    const turnsSinceLast = currentTurn - lastGreatPersonTurn;
    const hasActive = activeGreatPerson !== null && activeGreatPerson.status === 'active' && activeGreatPerson.actionTaken === 'support';

    const greatPerson = tryGenerateGreatPerson(
      era,
      stats,
      usedGreatPersonIds,
      currentTurn,
      turnsSinceLast,
      hasActive
    );

    if (greatPerson) {
      const arrivalEvent = createTimelineEvent(
        greatPerson,
        'arrival',
        currentTurn,
        era,
        {}
      );

      set({
        activeGreatPerson: greatPerson,
        showGreatPersonModal: true,
        usedGreatPersonIds: [...usedGreatPersonIds, greatPerson.id],
        timelineEvents: [...get().timelineEvents, arrivalEvent],
        lastGreatPersonTurn: currentTurn,
      });
    }
  },

  makeGreatPersonChoice: (action: GreatPersonAction) => {
    const { activeGreatPerson, stats, currentStage, currentTurn, greatPersonHistory, timelineEvents, culture } = get();
    if (!activeGreatPerson || !currentStage) return;

    const era = currentStage.eraColor as EraStage;
    const effects = getActionEffects(activeGreatPerson, action);
    const flavorText = getActionFlavorText(activeGreatPerson, action);
    const newStats = applyGreatPersonEffects(stats, effects);
    const updatedGreatPerson = updateGreatPersonStatus(activeGreatPerson, action);
    const effectiveStats = computeEffectiveStats(newStats, culture);

    const actionEvent = createTimelineEvent(
      updatedGreatPerson,
      action,
      currentTurn,
      era,
      effects
    );

    const newHistory = action === 'support'
      ? greatPersonHistory
      : [...greatPersonHistory, { ...updatedGreatPerson, actionTaken: action }];

    const newActive = action === 'support' ? updatedGreatPerson : null;

    set({
      stats: newStats,
      effectiveStats,
      activeGreatPerson: newActive,
      greatPersonHistory: newHistory,
      timelineEvents: [...timelineEvents, actionEvent],
      showGreatPersonModal: false,
      showGreatPersonResult: true,
      greatPersonResult: {
        greatPerson: updatedGreatPerson,
        action,
        effects,
        flavorText,
      },
    });
  },

  closeGreatPersonModal: () => {
    set({ showGreatPersonModal: false });
  },

  closeGreatPersonResult: () => {
    set({ showGreatPersonResult: false, greatPersonResult: null });
  },

  openCulturePage: () => {
    set({ showCulturePage: true });
  },

  closeCulturePage: () => {
    set({ showCulturePage: false });
  },

  regenerateCulture: () => {
    const { currentStage, stats, currentTurn } = get();
    if (!currentStage) return;
    const era = currentStage.eraColor as EraStage;
    const newCulture = generateCivilizationCulture(era, stats, currentTurn);
    const newEffectiveStats = computeEffectiveStats(stats, newCulture);
    set({ culture: newCulture, effectiveStats: newEffectiveStats });
  },
}));
