import type {
  GreatPerson,
  GreatPersonAction,
  GreatPersonTimelineEvent,
  EraStage,
  CivilizationStats,
  GreatPersonGenerationConfig,
} from '../../shared/types';
import { generateGreatPerson } from '../data/greatPeopleDatabase';

const DEFAULT_GENERATION_CONFIG: GreatPersonGenerationConfig = {
  baseProbability: 0.25,
  eraMultipliers: {
    stoneAge: 0.3,
    agricultural: 0.8,
    imperial: 1.2,
    scientific: 1.5,
  },
  statRequirements: {
    thinker: { culture: 10 },
    conqueror: { military: 10 },
    scientist: { technology: 10 },
    religious_leader: { culture: 10, population: 15 },
  },
  cooldownTurns: 2,
  maxActiveGreatPeople: 1,
};

export function calculateGreatPersonProbability(
  era: EraStage,
  stats: CivilizationStats,
  turnsSinceLastGreatPerson: number,
  hasActiveGreatPerson: boolean,
  config: GreatPersonGenerationConfig = DEFAULT_GENERATION_CONFIG
): number {
  if (hasActiveGreatPerson) return 0;
  if (turnsSinceLastGreatPerson < config.cooldownTurns) return 0;

  let probability = config.baseProbability;

  const eraMultiplier = config.eraMultipliers[era] || 1;
  probability *= eraMultiplier;

  const cooldownBonus = Math.min(1, (turnsSinceLastGreatPerson - config.cooldownTurns) / 10);
  probability += cooldownBonus * 0.1;

  return Math.min(0.6, probability);
}

export function checkStatRequirements(
  greatPerson: GreatPerson,
  stats: CivilizationStats,
  config: GreatPersonGenerationConfig = DEFAULT_GENERATION_CONFIG
): boolean {
  const requirements = config.statRequirements[greatPerson.type];
  if (!requirements) return true;

  for (const [stat, minValue] of Object.entries(requirements)) {
    if (stats[stat as keyof CivilizationStats] < (minValue || 0)) {
      return false;
    }
  }

  return true;
}

export function tryGenerateGreatPerson(
  era: EraStage,
  stats: CivilizationStats,
  usedIds: string[],
  turn: number,
  turnsSinceLastGreatPerson: number,
  hasActiveGreatPerson: boolean,
  config: GreatPersonGenerationConfig = DEFAULT_GENERATION_CONFIG
): GreatPerson | null {
  const probability = calculateGreatPersonProbability(
    era,
    stats,
    turnsSinceLastGreatPerson,
    hasActiveGreatPerson,
    config
  );

  if (Math.random() > probability) return null;

  let attempts = 0;
  while (attempts < 10) {
    const greatPerson = generateGreatPerson(era, usedIds, turn);
    if (greatPerson && checkStatRequirements(greatPerson, stats, config)) {
      return greatPerson;
    }
    attempts++;
  }

  return null;
}

export function applyGreatPersonEffects(
  stats: CivilizationStats,
  effects: Partial<CivilizationStats>
): CivilizationStats {
  const newStats: CivilizationStats = { ...stats };
  const keys: Array<keyof CivilizationStats> = ['population', 'technology', 'culture', 'military', 'agriculture'];

  for (const key of keys) {
    if (effects[key] !== undefined) {
      newStats[key] = Math.max(0, newStats[key] + (effects[key] || 0));
    }
  }

  return newStats;
}

export function getActionEffects(
  greatPerson: GreatPerson,
  action: GreatPersonAction
): Partial<CivilizationStats> {
  switch (action) {
    case 'support':
      return greatPerson.effects.supported;
    case 'ignore':
      return greatPerson.effects.ignored;
    case 'exile':
      return greatPerson.effects.exiled;
    case 'assassinate':
      return greatPerson.effects.assassinated;
    default:
      return {};
  }
}

export function getActionFlavorText(
  greatPerson: GreatPerson,
  action: GreatPersonAction
): string {
  switch (action) {
    case 'support':
      return greatPerson.flavorText.support;
    case 'ignore':
      return greatPerson.flavorText.ignore;
    case 'exile':
      return greatPerson.flavorText.exile;
    case 'assassinate':
      return greatPerson.flavorText.assassinate;
    default:
      return '';
  }
}

export function updateGreatPersonStatus(
  greatPerson: GreatPerson,
  action: GreatPersonAction
): GreatPerson {
  const updated = { ...greatPerson };

  switch (action) {
    case 'support':
      updated.status = 'active';
      updated.actionTaken = 'support';
      break;
    case 'ignore':
      updated.status = 'ignored';
      updated.actionTaken = 'ignore';
      break;
    case 'exile':
      updated.status = 'exiled';
      updated.actionTaken = 'exile';
      break;
    case 'assassinate':
      updated.status = 'assassinated';
      updated.actionTaken = 'assassinate';
      updated.deathYear = greatPerson.birthYear + 40 + Math.floor(Math.random() * 20);
      break;
  }

  return updated;
}

export function createTimelineEvent(
  greatPerson: GreatPerson,
  action: GreatPersonAction | 'arrival' | 'death',
  turn: number,
  era: EraStage,
  effects: Partial<CivilizationStats>
): GreatPersonTimelineEvent {
  let description = '';

  switch (action) {
    case 'arrival':
      description = `${greatPerson.name} 登上历史舞台，成为${greatPerson.title}。`;
      break;
    case 'support':
      description = `你支持了${greatPerson.name}，他/她的影响力开始在文明中传播。`;
      break;
    case 'exile':
      description = `你下令流放${greatPerson.name}，他/她带着追随者离开了你的土地。`;
      break;
    case 'assassinate':
      description = `${greatPerson.name} 被暗杀，这一事件震惊了整个文明。`;
      break;
    case 'ignore':
      description = `你忽视了${greatPerson.name}，他/她在历史中逐渐被遗忘。`;
      break;
    case 'death':
      description = `${greatPerson.name} 去世，留下了深远的影响。`;
      break;
  }

  return {
    id: `gp-event-${greatPerson.id}-${action}-${Date.now()}`,
    greatPersonId: greatPerson.id,
    greatPersonName: greatPerson.name,
    greatPersonType: greatPerson.type,
    turn,
    era,
    action,
    description,
    effects,
  };
}

export function processTurnlyGreatPersonEffects(
  activeGreatPerson: GreatPerson | null,
  stats: CivilizationStats
): { stats: CivilizationStats; events: GreatPersonTimelineEvent[]; shouldRetire: boolean } {
  let newStats = stats;
  const events: GreatPersonTimelineEvent[] = [];
  let shouldRetire = false;

  if (activeGreatPerson && activeGreatPerson.status === 'active' && activeGreatPerson.actionTaken === 'support') {
    const updatedGreatPerson = { ...activeGreatPerson, activeTurns: activeGreatPerson.activeTurns + 1 };

    if (updatedGreatPerson.activeTurns >= updatedGreatPerson.maxTurns) {
      shouldRetire = true;
      const deathEvent = createTimelineEvent(
        updatedGreatPerson,
        'death',
        Date.now(),
        activeGreatPerson.era[0],
        {}
      );
      events.push(deathEvent);
    }
  }

  return { stats: newStats, events, shouldRetire };
}

export function getActionRiskLevel(action: GreatPersonAction): 'low' | 'medium' | 'high' {
  switch (action) {
    case 'ignore':
      return 'low';
    case 'support':
      return 'medium';
    case 'exile':
      return 'medium';
    case 'assassinate':
      return 'high';
    default:
      return 'low';
  }
}

export function getActionDescription(action: GreatPersonAction): string {
  switch (action) {
    case 'support':
      return '支持这位伟人，采纳他/她的主张。这将带来显著的正面效果，但也可能有副作用。';
    case 'exile':
      return '将这位伟人流放，避免他/她的影响。这会消除负面效果，但也会失去潜在的好处。';
    case 'assassinate':
      return '暗杀这位伟人，彻底终结他/她的影响。风险极高，但可能带来意想不到的好处（如殉道效应）。';
    case 'ignore':
      return '忽视这位伟人，让他/她自然发展。影响最小，但也不会有大的收获。';
    default:
      return '';
  }
}
