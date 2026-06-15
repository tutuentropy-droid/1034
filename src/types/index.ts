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
};

export type CivilizationStats = TCivilizationStats;

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
