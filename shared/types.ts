export interface CivilizationStats {
  population: number;
  technology: number;
  culture: number;
  military: number;
  agriculture: number;
}

export interface Choice {
  id: string;
  title: string;
  description: string;
  effects: Partial<CivilizationStats>;
  nextStageId: string;
  flavorText: string;
}

export interface Stage {
  id: string;
  era: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  eraColor: string;
  encyclopedia: string;
  choices: Choice[];
  startingStats: Partial<CivilizationStats>;
}

export interface HistoryEntry {
  stageId: string;
  choiceId: string;
  timestamp: number;
  stageTitle: string;
  choiceTitle: string;
}

export interface CivilizationState {
  currentStageId: string;
  stats: CivilizationStats;
  history: HistoryEntry[];
  isComplete: boolean;
  civilizationName: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ChoiceResult {
  nextStage: Stage | null;
  newStats: CivilizationStats;
  flavorText: string;
  effects: Partial<CivilizationStats>;
}

export interface ResetResult {
  currentStage: Stage;
  initialStats: CivilizationStats;
}

export type EraType = 'cognitive' | 'agricultural' | 'imperial' | 'scientific';
