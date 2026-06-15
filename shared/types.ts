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

export type EventCategory = 'plague' | 'religion' | 'trade' | 'currency' | 'empire' | 'war' | 'disaster' | 'innovation';

export interface EventCondition {
  type: 'stat_above' | 'stat_below' | 'stat_between' | 'era_is' | 'era_not' | 'random_chance';
  stat?: keyof CivilizationStats;
  value?: number;
  min?: number;
  max?: number;
  era?: EraType | string;
  chance?: number;
}

export interface EventChoice {
  id: string;
  title: string;
  description: string;
  effects: Partial<CivilizationStats>;
  flavorText: string;
  requirements?: EventCondition[];
}

export interface HistoricalEvent {
  id: string;
  category: EventCategory;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  icon: string;
  era: string[];
  conditions: EventCondition[];
  baseProbability: number;
  choices: EventChoice[];
}

export interface EventResult {
  event: HistoricalEvent;
  choice: EventChoice;
  newStats: CivilizationStats;
  effects: Partial<CivilizationStats>;
}

export interface EventTriggerResponse {
  success: boolean;
  data?: {
    event: HistoricalEvent;
    probability: number;
  };
  error?: string;
}

export interface EventResolveResponse {
  success: boolean;
  data?: EventResult;
  error?: string;
}
