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
  StatsSnapshot,
  MajorDecision,
  CrazyEvent,
  CivilizationMuseumReport,
  DeathCause,
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
import { BELIEFS } from '../lib/beliefEngine';

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
  statsSnapshots: StatsSnapshot[];
  majorDecisions: MajorDecision[];
  crazyEvents: CrazyEvent[];
  museumReport: CivilizationMuseumReport | null;
  showMuseum: boolean;

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
  takeSnapshot: () => void;
  generateMuseumReport: () => CivilizationMuseumReport;
  openMuseum: () => void;
  closeMuseum: () => void;
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

function calculateImpact(effects: Partial<CivilizationStats>): number {
  return Object.values(effects).reduce((sum, v) => sum + Math.abs(v || 0), 0);
}

function analyzeDeathCause(
  finalStats: CivilizationStats,
  snapshots: StatsSnapshot[],
  eventHistory: HistoryEntry[],
  isComplete: boolean
): DeathCause | null {
  if (isComplete) return null;

  const totalScore = Object.values(finalStats).reduce((s, v) => s + v, 0);
  const causes: DeathCause[] = [];

  if (finalStats.population <= 0) {
    causes.push({
      cause: '人口灭绝',
      description: '文明人口归零，没有人能够继续传承这份文明。',
      icon: '💀',
      severity: 'critical',
      contributingStats: { population: finalStats.population },
    });
  } else if (finalStats.agriculture <= 0 && finalStats.population < 10) {
    causes.push({
      cause: '大饥荒',
      description: '农业完全崩溃，粮食短缺导致文明难以为继。',
      icon: '🌾',
      severity: 'critical',
      contributingStats: { agriculture: finalStats.agriculture, population: finalStats.population },
    });
  }

  if (finalStats.military <= 0 && snapshots.length > 3) {
    causes.push({
      cause: '军事崩溃',
      description: '军事力量完全瓦解，无力抵御外部威胁和内部动荡。',
      icon: '⚔️',
      severity: 'high',
      contributingStats: { military: finalStats.military },
    });
  }

  if (finalStats.culture <= 0 && totalScore < 50) {
    causes.push({
      cause: '文化消亡',
      description: '文明失去了精神内核，人们对自己的身份认同产生了迷茫。',
      icon: '📜',
      severity: 'medium',
      contributingStats: { culture: finalStats.culture },
    });
  }

  if (finalStats.technology <= 0 && totalScore < 50) {
    causes.push({
      cause: '技术倒退',
      description: '知识传承断裂，文明从技术高峰跌落至原始状态。',
      icon: '🔬',
      severity: 'medium',
      contributingStats: { technology: finalStats.technology },
    });
  }

  if (snapshots.length > 5) {
    const lastFive = snapshots.slice(-5);
    const declining = lastFive.every((s, i) =>
      i === 0 || s.totalScore <= lastFive[i - 1].totalScore
    );
    if (declining && lastFive[lastFive.length - 1].totalScore < lastFive[0].totalScore * 0.5) {
      causes.push({
        cause: '持续衰落',
        description: '综合国力持续下滑，文明陷入不可逆转的衰退周期。',
        icon: '📉',
        severity: 'high',
        contributingStats: {},
      });
    }
  }

  if (causes.length === 0 && !isComplete) {
    causes.push({
      cause: '历史中断',
      description: '文明历程在未完成状态下中断，未来得及书写完整篇章。',
      icon: '📖',
      severity: 'medium',
      contributingStats: {},
    });
  }

  return causes.sort((a, b) => {
    const severityOrder = { critical: 3, high: 2, medium: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  })[0] || null;
}

function generateCrazyEvents(
  eventHistory: HistoryEntry[],
  greatPersonState: GreatPersonState,
  snapshots: StatsSnapshot[]
): CrazyEvent[] {
  const events: CrazyEvent[] = [];

  if (snapshots.length >= 3) {
    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1];
      const curr = snapshots[i];
      const diff = curr.totalScore - prev.totalScore;

      if (diff <= -30) {
        events.push({
          id: `crash-${i}`,
          turn: curr.turn,
          title: '惊天大逆转',
          description: `在第 ${curr.turn} 回合，综合国力暴跌 ${Math.abs(diff)} 点，这在整个历史上都极为罕见！`,
          type: 'stats_crash',
          weirdness: 9,
          icon: '💥',
        });
      } else if (diff >= 40) {
        events.push({
          id: `surge-${i}`,
          turn: curr.turn,
          title: '黄金时代降临',
          description: `在第 ${curr.turn} 回合，文明综合国力暴涨 ${diff} 点，迎来不可思议的繁荣！`,
          type: 'stats_surge',
          weirdness: 8,
          icon: '✨',
        });
      }
    }
  }

  const assassinations = greatPersonState.timelineEvents.filter(e => e.action === 'assassinate');
  if (assassinations.length >= 2) {
    events.push({
      id: 'purge',
      turn: assassinations[assassinations.length - 1].turn,
      title: '大清洗时代',
      description: `共有 ${assassinations.length} 位伟大人物遭遇不测，这是一个充满阴谋与背叛的黑暗时代。`,
      type: 'great_person_purge',
      weirdness: 10,
      icon: '🗡️',
    });
  }

  const exiled = greatPersonState.greatPersonHistory.filter(p => p.status === 'exiled');
  if (exiled.length >= 3) {
    events.push({
      id: 'exodus',
      turn: exiled[exiled.length - 1].turnIntroduced,
      title: '智者流亡潮',
      description: `${exiled.length} 位杰出人物被流放他乡，智慧之光散落天涯。`,
      type: 'exodus',
      weirdness: 7,
      icon: '🚶',
    });
  }

  const ignored = greatPersonState.greatPersonHistory.filter(p => p.status === 'ignored');
  if (ignored.length >= 2 && eventHistory.length > 5) {
    events.push({
      id: 'ignorance',
      turn: ignored[0].turnIntroduced,
      title: '历史的擦肩而过',
      description: `${ignored.length} 位改变历史的人物被忽视，命运齿轮悄然转向未知方向。`,
      type: 'missed_opportunity',
      weirdness: 6,
      icon: '🌫️',
    });
  }

  if (eventHistory.length >= 6) {
    events.push({
      id: 'turbulent',
      turn: Math.floor(eventHistory.length / 2),
      title: '多事之秋',
      description: `整个文明历程中发生了 ${eventHistory.length} 起重大事件，见证了无数历史的转折。`,
      type: 'eventful',
      weirdness: 5,
      icon: '🌪️',
    });
  }

  const zeroStatsSnapshots = snapshots.filter(s =>
    Object.values(s.stats).some(v => v <= 0)
  );
  if (zeroStatsSnapshots.length >= 3) {
    events.push({
      id: 'neardeath',
      turn: zeroStatsSnapshots[0].turn,
      title: '九死一生',
      description: `文明曾 ${zeroStatsSnapshots.length} 次濒临崩溃，但每次都奇迹般地挺了过来。`,
      type: 'near_death_experiences',
      weirdness: 9,
      icon: '🐱',
    });
  }

  return events.sort((a, b) => b.weirdness - a.weirdness).slice(0, 5);
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
  statsSnapshots: [],
  majorDecisions: [],
  crazyEvents: [],
  museumReport: null,
  showMuseum: false,

  takeSnapshot: () => {
    const { stats, currentTurn, currentStage, statsSnapshots, effectiveStats } = get();
    const totalScore = Object.values(effectiveStats).reduce((s, v) => s + v, 0);
    const snapshot: StatsSnapshot = {
      turn: currentTurn,
      stageId: currentStage?.id,
      stageTitle: currentStage?.title,
      era: currentStage?.eraColor as EraStage,
      stats: { ...effectiveStats },
      totalScore,
      timestamp: Date.now(),
    };
    set({ statsSnapshots: [...statsSnapshots, snapshot] });
  },

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
        const totalScore = Object.values(effectiveStats).reduce((s, v) => s + v, 0);

        const initialSnapshot: StatsSnapshot = {
          turn: 0,
          stageId: firstStage.id,
          stageTitle: firstStage.title,
          era: era,
          stats: { ...effectiveStats },
          totalScore,
          timestamp: Date.now(),
        };

        set({
          stages,
          currentStageId: firstStage.id,
          currentStage: firstStage,
          stats: initialState,
          effectiveStats,
          culture,
          isLoading: false,
          statsSnapshots: [initialSnapshot],
          majorDecisions: [],
          crazyEvents: [],
          museumReport: null,
          showMuseum: false,
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
    const { currentStageId, stats, currentStage, history, currentTurn, activeGreatPerson, greatPersonHistory, timelineEvents, culture, majorDecisions } = get();
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
        const impact = calculateImpact(response.data.effects);
        const isPivotal = impact >= 15 || newTurn <= 3 || !response.data.nextStage;

        const newDecision: MajorDecision = {
          id: `choice-${Date.now()}-${Math.random()}`,
          turn: newTurn,
          era: currentStage.eraColor as EraStage,
          type: 'stage_choice',
          title: choice.title,
          description: `${currentStage.title} → ${choice.title}`,
          effects: response.data.effects,
          impactScore: impact,
          isPivotal,
        };

        const updatedDecisions = [...majorDecisions, newDecision];
        const totalScore = Object.values(effectiveStats).reduce((s, v) => s + v, 0);
        const newSnapshot: StatsSnapshot = {
          turn: newTurn,
          stageId: response.data.nextStage?.id,
          stageTitle: response.data.nextStage?.title,
          era: response.data.nextStage?.eraColor as EraStage,
          stats: { ...effectiveStats },
          totalScore,
          timestamp: Date.now(),
        };

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
          majorDecisions: updatedDecisions,
          statsSnapshots: [...get().statsSnapshots, newSnapshot],
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
        const totalScore = Object.values(effectiveStats).reduce((s, v) => s + v, 0);

        const initialSnapshot: StatsSnapshot = {
          turn: 0,
          stageId: response.data.currentStage.id,
          stageTitle: response.data.currentStage.title,
          era,
          stats: { ...effectiveStats },
          totalScore,
          timestamp: Date.now(),
        };

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
          statsSnapshots: [initialSnapshot],
          majorDecisions: [],
          crazyEvents: [],
          museumReport: null,
          showMuseum: false,
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
    const { currentEvent, stats, eventHistory, culture, majorDecisions, currentTurn, currentStage } = get();
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
        const impact = calculateImpact(response.data.effects);

        const newDecision: MajorDecision = {
          id: `event-${Date.now()}-${Math.random()}`,
          turn: currentTurn,
          era: currentStage?.eraColor as EraStage,
          type: 'event_choice',
          title: `${currentEvent.title}: ${choice.title}`,
          description: choice.description,
          effects: response.data.effects,
          impactScore: impact,
          isPivotal: impact >= 10,
        };

        const totalScore = Object.values(effectiveStats).reduce((s, v) => s + v, 0);
        const newSnapshot: StatsSnapshot = {
          turn: currentTurn,
          stageId: currentStage?.id,
          stageTitle: currentStage?.title,
          era: currentStage?.eraColor as EraStage,
          stats: { ...effectiveStats },
          totalScore,
          timestamp: Date.now(),
        };

        set({
          eventResult: response.data,
          stats: newStats,
          effectiveStats,
          showEventModal: false,
          showEventResult: true,
          eventHistory: [...eventHistory, newHistoryEntry],
          isLoading: false,
          majorDecisions: [...majorDecisions, newDecision],
          statsSnapshots: [...get().statsSnapshots, newSnapshot],
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
    const { activeGreatPerson, stats, currentStage, currentTurn, greatPersonHistory, timelineEvents, culture, majorDecisions } = get();
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
    const impact = calculateImpact(effects);

    const newDecision: MajorDecision = {
      id: `gp-${Date.now()}-${Math.random()}`,
      turn: currentTurn,
      era,
      type: 'great_person',
      title: `${updatedGreatPerson.name}: ${action === 'support' ? '支持' : action === 'exile' ? '流放' : action === 'assassinate' ? '暗杀' : '忽视'}`,
      description: `${updatedGreatPerson.title} ${updatedGreatPerson.name} - ${updatedGreatPerson.description}`,
      effects,
      impactScore: impact,
      isPivotal: impact >= 8 || action === 'assassinate',
    };

    const totalScore = Object.values(effectiveStats).reduce((s, v) => s + v, 0);
    const newSnapshot: StatsSnapshot = {
      turn: currentTurn,
      stageId: currentStage.id,
      stageTitle: currentStage.title,
      era,
      stats: { ...effectiveStats },
      totalScore,
      timestamp: Date.now(),
    };

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
      majorDecisions: [...majorDecisions, newDecision],
      statsSnapshots: [...get().statsSnapshots, newSnapshot],
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

  generateMuseumReport: (): CivilizationMuseumReport => {
    const state = get();
    const {
      civilizationName,
      currentTurn,
      currentStage,
      stats,
      effectiveStats,
      history,
      eventHistory,
      isComplete,
      statsSnapshots,
      majorDecisions,
      greatPersonHistory,
      timelineEvents,
      activeGreatPerson,
    } = state;

    const finalScore = Object.values(effectiveStats).reduce((s, v) => s + v, 0);
    const startEra = (statsSnapshots[0]?.era || 'stoneAge') as EraStage;
    const endEra = (currentStage?.eraColor || statsSnapshots[statsSnapshots.length - 1]?.era || 'stoneAge') as EraStage;

    const deathCause = analyzeDeathCause(effectiveStats, statsSnapshots, eventHistory, isComplete);

    const crazyEvents = generateCrazyEvents(eventHistory, state, statsSnapshots);

    const allGreatPeople = [
      ...greatPersonHistory,
      ...(activeGreatPerson && activeGreatPerson.status !== 'active' ? [activeGreatPerson] : []),
      ...(activeGreatPerson && activeGreatPerson.status === 'active' ? [activeGreatPerson] : []),
    ];

    const seenIds = new Set<string>();
    const uniqueGreatPeople = allGreatPeople.filter(gp => {
      if (seenIds.has(gp.id)) return false;
      seenIds.add(gp.id);
      return true;
    });

    const beliefHistory: Record<string, { peak: number; peakTurn: number; total: number }> = {};
    const dominantBeliefs = BELIEFS.slice(0, 0);

    const sortedDecisions = [...majorDecisions].sort((a, b) => b.impactScore - a.impactScore);

    const report: CivilizationMuseumReport = {
      mode: 'single',
      civilizationName,
      duration: statsSnapshots.length,
      startEra,
      endEra,
      finalStats: { ...effectiveStats },
      finalScore,
      isVictory: isComplete,
      deathCause,
      snapshots: statsSnapshots,
      majorDecisions: sortedDecisions.slice(0, 10),
      crazyEvents,
      dominantBeliefs: dominantBeliefs.map(b => ({
        beliefId: b.id,
        name: b.name,
        icon: b.icon,
        color: b.color,
        peakInfection: beliefHistory[b.id]?.peak || 0,
        peakTurn: beliefHistory[b.id]?.peakTurn || 0,
        totalInfluence: beliefHistory[b.id]?.total || 0,
        description: b.description,
      })),
      greatPeople: uniqueGreatPeople.map(gp => ({
        id: gp.id,
        name: gp.name,
        type: gp.type,
        title: gp.title,
        era: gp.era,
        status: gp.status,
        actionTaken: gp.actionTaken,
        turnIntroduced: gp.turnIntroduced,
      })),
      stageHistory: history,
      eventHistory,
      totalTurns: currentTurn,
      generationTime: Date.now(),
    };

    set({ museumReport: report, crazyEvents });
    return report;
  },

  openMuseum: () => {
    get().generateMuseumReport();
    set({ showMuseum: true });
  },

  closeMuseum: () => {
    set({ showMuseum: false });
  },
}));
