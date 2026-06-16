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

export type TagCategory = 'cognitive' | 'agriculture' | 'cooperation' | 'religion' | 'capitalism' | 'empire' | 'science' | 'myth';

export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
  color: string;
  description: string;
}

export interface KnowledgeNode {
  id: string;
  title: string;
  subtitle: string;
  era: string;
  eraColor: string;
  summary: string;
  content: string;
  keyInsights: string[];
  imageUrl: string;
  tags: string[];
  relatedNodes: string[];
  quizIds: string[];
}

export interface QuizQuestion {
  id: string;
  knowledgeNodeId: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizSubmission {
  questionId: string;
  selectedAnswerIndex: number;
}

export interface QuizResult {
  questionId: string;
  isCorrect: boolean;
  correctAnswerIndex: number;
  explanation: string;
}

export interface UserFavorite {
  knowledgeNodeId: string;
  timestamp: number;
}

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  size: number;
  era: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface EncyclopediaListResponse extends ApiResponse<KnowledgeNode[]> {}
export interface EncyclopediaNodeResponse extends ApiResponse<KnowledgeNode> {}
export interface TagsResponse extends ApiResponse<Tag[]> {}
export interface QuizResponse extends ApiResponse<QuizQuestion[]> {}
export interface QuizSubmitResponse extends ApiResponse<QuizResult[]> {}
export interface FavoritesResponse extends ApiResponse<UserFavorite[]> {}
export interface GraphResponse extends ApiResponse<KnowledgeGraph> {}

export type CivilizationTrait = 'aggressive' | 'peaceful' | 'trader' | 'cultural' | 'expansionist' | 'defensive';
export type DiplomaticStatus = 'neutral' | 'allied' | 'at_war' | 'trading_partner' | 'hostile';
export type TileTerrain = 'plains' | 'forest' | 'mountain' | 'desert' | 'coast' | 'river' | 'tundra';
export type ActionType = 'expand_territory' | 'build_military' | 'develop_technology' | 'develop_culture' | 'develop_agriculture' | 'trade' | 'declare_war' | 'propose_alliance' | 'spread_culture' | 'defense';

export interface MapTile {
  id: string;
  x: number;
  y: number;
  terrain: TileTerrain;
  ownerId: string | null;
  population: number;
  resources: Partial<CivilizationStats>;
  isCapital: boolean;
}

export interface DiplomaticRelation {
  withId: string;
  status: DiplomaticStatus;
  opinion: number;
  tradeAgreement: boolean;
  lastInteraction: number;
}

export type EraStage = 'stoneAge' | 'agricultural' | 'imperial' | 'scientific';

export interface EraThreshold {
  era: EraStage;
  minPopulation: number;
  minTechnology: number;
  minCulture: number;
  name: string;
  description: string;
}

export interface CivilizationRanking {
  civilizationId: string;
  totalScore: number;
  territoryScore: number;
  militaryScore: number;
  cultureScore: number;
  technologyScore: number;
  rank: number;
}

export interface TerritoryExpansion {
  civilizationId: string;
  tileId: string;
  turn: number;
  fromTileId: string;
}

export interface AICivilization {
  id: string;
  name: string;
  color: string;
  stats: CivilizationStats;
  territory: string[];
  capitalTileId: string;
  traits: CivilizationTrait[];
  relations: DiplomaticRelation[];
  era: EraStage;
  personality: {
    aggressiveness: number;
    friendliness: number;
    greed: number;
    culturalFocus: number;
    techFocus: number;
  };
  actionHistory: { turn: number; action: string; targetId?: string }[];
  expansionHistory: TerritoryExpansion[];
}

export interface PlayerCivilization extends AICivilization {
  isPlayer: true;
}

export interface WorldMap {
  width: number;
  height: number;
  tiles: MapTile[];
  continents: { id: string; name: string; tileIds: string[] }[];
}

export interface AIAction {
  type: ActionType;
  civilizationId: string;
  targetId?: string;
  tileId?: string;
}

export interface TurnEvent {
  id: string;
  turn: number;
  type: ActionType | 'diplomacy' | 'battle' | 'culture_spread';
  actorId: string;
  targetId?: string;
  description: string;
  effects: { civilizationId: string; stats: Partial<CivilizationStats>; territoryGained?: string[]; territoryLost?: string[] }[];
}

export interface WorldState {
  turn: number;
  civilizations: AICivilization[];
  playerCivilizationId: string;
  map: WorldMap;
  turnEvents: TurnEvent[];
  gameOver: boolean;
  winnerId: string | null;
  rankings: CivilizationRanking[];
  recentExpansions: TerritoryExpansion[];
}

export interface AIDecision {
  priority: number;
  action: AIAction;
  reasoning: string;
}

export interface BattleResult {
  attackerId: string;
  defenderId: string;
  attackerLosses: number;
  defenderLosses: number;
  winner: string;
  capturedTiles: string[];
}

export interface TradeAgreement {
  id: string;
  civ1Id: string;
  civ2Id: string;
  civ1Offers: Partial<CivilizationStats>;
  civ2Offers: Partial<CivilizationStats>;
  duration: number;
  turnsRemaining: number;
}

export interface CultureSpreadResult {
  fromId: string;
  toId: string;
  influence: number;
  convertedTiles: string[];
}

export interface WorldStateResponse extends ApiResponse<WorldState> {}
export interface AIDecisionResponse extends ApiResponse<AIAction> {}
export interface BattleResultResponse extends ApiResponse<BattleResult> {}
