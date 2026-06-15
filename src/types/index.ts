import type {
  CivilizationStats as TCivilizationStats,
  Choice,
  Stage,
  HistoryEntry,
  CivilizationState,
  ApiResponse,
  ChoiceResult,
  ResetResult,
  EraType,
  EventCategory,
  EventCondition,
  EventChoice,
  HistoricalEvent,
  EventResult,
  EventTriggerResponse,
  EventResolveResponse,
} from '../../shared/types';

export type {
  Choice,
  Stage,
  HistoryEntry,
  CivilizationState,
  ApiResponse,
  ChoiceResult,
  ResetResult,
  EraType,
  EventCategory,
  EventCondition,
  EventChoice,
  HistoricalEvent,
  EventResult,
  EventTriggerResponse,
  EventResolveResponse,
};

export type CivilizationStats = TCivilizationStats;

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  plague: '瘟疫',
  religion: '宗教',
  trade: '贸易',
  currency: '货币',
  empire: '帝国',
  war: '战争',
  disaster: '灾难',
  innovation: '革新',
};

export const EVENT_CATEGORY_COLORS: Record<EventCategory, string> = {
  plague: 'from-red-500',
  religion: 'from-purple-500',
  trade: 'from-amber-500',
  currency: 'from-yellow-500',
  empire: 'from-indigo-500',
  war: 'from-orange-600',
  disaster: 'from-gray-600',
  innovation: 'from-cyan-500',
};

export const EVENT_CATEGORY_BG: Record<EventCategory, string> = {
  plague: 'bg-red-500',
  religion: 'bg-purple-500',
  trade: 'bg-amber-500',
  currency: 'bg-yellow-500',
  empire: 'bg-indigo-500',
  war: 'bg-orange-600',
  disaster: 'bg-gray-600',
  innovation: 'bg-cyan-500',
};

export interface StatChange {
  key: keyof CivilizationStats;
  value: number;
  isPositive: boolean;
}

export const STAT_LABELS: Record<keyof CivilizationStats, string> = {
  population: '人口',
  technology: '科技',
  culture: '文化',
  military: '军事',
  agriculture: '农业',
};

export const STAT_ICONS: Record<keyof CivilizationStats, string> = {
  population: 'Users',
  technology: 'FlaskConical',
  culture: 'BookOpen',
  military: 'Sword',
  agriculture: 'Wheat',
};

export const ERA_COLORS: Record<string, string> = {
  stoneAge: 'bg-stoneAge',
  agricultural: 'bg-agricultural',
  imperial: 'bg-imperial',
  scientific: 'bg-scientific',
};

export const ERA_TEXT_COLORS: Record<string, string> = {
  stoneAge: 'text-stoneAge',
  agricultural: 'text-agricultural',
  imperial: 'text-imperial',
  scientific: 'text-scientific',
};

export const ERA_BORDER_COLORS: Record<string, string> = {
  stoneAge: 'border-stoneAge',
  agricultural: 'border-agricultural',
  imperial: 'border-imperial',
  scientific: 'border-scientific',
};
