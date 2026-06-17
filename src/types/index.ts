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
  Tag,
  TagCategory,
  KnowledgeNode,
  QuizQuestion,
  QuizSubmission,
  QuizResult,
  UserFavorite,
  KnowledgeGraph,
  GraphNode,
  GraphEdge,
  EncyclopediaListResponse,
  EncyclopediaNodeResponse,
  TagsResponse,
  QuizResponse,
  QuizSubmitResponse,
  FavoritesResponse,
  GraphResponse,
  CivilizationTrait,
  DiplomaticStatus,
  TileTerrain,
  ActionType,
  MapTile,
  DiplomaticRelation,
  AICivilization,
  PlayerCivilization,
  WorldMap,
  AIAction,
  TurnEvent,
  WorldState,
  AIDecision,
  BattleResult,
  TradeAgreement,
  CultureSpreadResult,
  WorldStateResponse,
  AIDecisionResponse,
  BattleResultResponse,
  EraStage,
  EraThreshold,
  CivilizationRanking,
  TerritoryExpansion,
  WhatIfNode,
  WhatIfTimelineEntry,
  WhatIfSimulationResult,
  WhatIfRoute,
  BeliefId,
  Belief,
  BeliefInfection,
  GreatPersonType,
  GreatPersonPersonality,
  GreatPersonBias,
  GreatPersonStatus,
  GreatPersonAction,
  GreatPerson,
  GreatPersonTimelineEvent,
  GreatPersonState,
  GreatPersonGenerationConfig,
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
  Tag,
  TagCategory,
  KnowledgeNode,
  QuizQuestion,
  QuizSubmission,
  QuizResult,
  UserFavorite,
  KnowledgeGraph,
  GraphNode,
  GraphEdge,
  EncyclopediaListResponse,
  EncyclopediaNodeResponse,
  TagsResponse,
  QuizResponse,
  QuizSubmitResponse,
  FavoritesResponse,
  GraphResponse,
  CivilizationTrait,
  DiplomaticStatus,
  TileTerrain,
  ActionType,
  MapTile,
  DiplomaticRelation,
  AICivilization,
  PlayerCivilization,
  WorldMap,
  AIAction,
  TurnEvent,
  WorldState,
  AIDecision,
  BattleResult,
  TradeAgreement,
  CultureSpreadResult,
  WorldStateResponse,
  AIDecisionResponse,
  BattleResultResponse,
  EraStage,
  EraThreshold,
  CivilizationRanking,
  TerritoryExpansion,
};

export type CivilizationStats = TCivilizationStats;

export type {
  WhatIfNode,
  WhatIfTimelineEntry,
  WhatIfSimulationResult,
  WhatIfRoute,
};

export type {
  BeliefId,
  Belief,
  BeliefInfection,
  GreatPersonType,
  GreatPersonPersonality,
  GreatPersonBias,
  GreatPersonStatus,
  GreatPersonAction,
  GreatPerson,
  GreatPersonTimelineEvent,
  GreatPersonState,
  GreatPersonGenerationConfig,
};

export const GREAT_PERSON_TYPE_LABELS: Record<GreatPersonType, string> = {
  thinker: '思想家',
  conqueror: '征服者',
  scientist: '科学家',
  religious_leader: '宗教领袖',
};

export const GREAT_PERSON_TYPE_COLORS: Record<GreatPersonType, string> = {
  thinker: 'from-indigo-500',
  conqueror: 'from-red-500',
  scientist: 'from-cyan-500',
  religious_leader: 'from-purple-500',
};

export const GREAT_PERSON_TYPE_BG: Record<GreatPersonType, string> = {
  thinker: 'bg-indigo-500',
  conqueror: 'bg-red-500',
  scientist: 'bg-cyan-500',
  religious_leader: 'bg-purple-500',
};

export const GREAT_PERSON_PERSONALITY_LABELS: Record<GreatPersonPersonality, string> = {
  visionary: '远见卓识',
  paranoid: '偏执多疑',
  charismatic: '魅力四射',
  ruthless: '冷酷无情',
  idealistic: '理想主义',
  cynical: '愤世嫉俗',
  diligent: '勤勉刻苦',
  reckless: '鲁莽冲动',
  introverted: '内向深沉',
  eloquent: '雄辩滔滔',
};

export const GREAT_PERSON_BIAS_LABELS: Record<GreatPersonBias, string> = {
  pro_technology: '崇尚科技',
  anti_technology: '排斥科技',
  pro_military: '崇尚武力',
  anti_military: '反对战争',
  pro_culture: '推崇文化',
  anti_culture: '轻视文化',
  pro_agriculture: '重视农业',
  anti_agriculture: '轻视农业',
  pro_centralization: '主张集权',
  pro_freedom: '追求自由',
  pro_tradition: '尊重传统',
  pro_innovation: '鼓励创新',
  elitist: '精英主义',
  populist: '民粹主义',
};

export const GREAT_PERSON_ACTION_LABELS: Record<GreatPersonAction, string> = {
  support: '支持',
  exile: '流放',
  assassinate: '暗杀',
  ignore: '忽视',
};

export const GREAT_PERSON_STATUS_LABELS: Record<GreatPersonStatus, string> = {
  active: '活跃',
  exiled: '已流放',
  assassinated: '已遇刺',
  ignored: '被忽视',
  deceased: '已逝世',
};

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
