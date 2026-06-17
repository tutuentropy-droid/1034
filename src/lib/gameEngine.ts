import type {
  WorldState,
  AICivilization,
  AIAction,
  TurnEvent,
  BattleResult,
  MapTile,
  CivilizationStats,
  DiplomaticRelation,
  EraStage,
  EraThreshold,
  CivilizationRanking,
  TerritoryExpansion,
} from '../types';
import { makeAIDecision, generateCivilizationName, generateCivilizationColor } from './aiDecisionEngine';
import { generateWorldMap, findStartPositions, getExpandableTiles, getAdjacentTiles } from './worldMapGenerator';
import { getInitialBeliefs, propagateBeliefs } from './beliefEngine';

const ERA_THRESHOLDS: EraThreshold[] = [
  { era: 'stoneAge', minPopulation: 0, minTechnology: 0, minCulture: 0, name: '石器时代', description: '文明的黎明，部落在荒野中求生' },
  { era: 'agricultural', minPopulation: 20, minTechnology: 10, minCulture: 8, name: '农业时代', description: '农业革命带来定居生活和人口增长' },
  { era: 'imperial', minPopulation: 50, minTechnology: 25, minCulture: 20, name: '帝国时代', description: '强大的帝国崛起，征服与统一' },
  { era: 'scientific', minPopulation: 80, minTechnology: 45, minCulture: 35, name: '科学时代', description: '科学革命推动文明进入新纪元' },
];

const ERA_BONUSES: Record<EraStage, Partial<CivilizationStats>> = {
  stoneAge: { agriculture: 1 },
  agricultural: { agriculture: 2, population: 1 },
  imperial: { military: 2, culture: 1 },
  scientific: { technology: 3, culture: 1 },
};

const INITIAL_STATS: CivilizationStats = {
  population: 10,
  technology: 5,
  culture: 5,
  military: 5,
  agriculture: 5,
};

const TRAIT_PERSONALITY_MAP: Record<string, Partial<AICivilization['personality']>> = {
  aggressive: { aggressiveness: 0.9, friendliness: 0.2 },
  peaceful: { aggressiveness: 0.1, friendliness: 0.9 },
  trader: { greed: 0.8, friendliness: 0.7 },
  cultural: { culturalFocus: 0.9, techFocus: 0.5 },
  expansionist: { greed: 0.9, aggressiveness: 0.7 },
  defensive: { aggressiveness: 0.2, friendliness: 0.5 },
};

function generateTraits(): string[] {
  const allTraits = ['aggressive', 'peaceful', 'trader', 'cultural', 'expansionist', 'defensive'];
  const shuffled = allTraits.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2);
}

function generatePersonality(traits: string[]): AICivilization['personality'] {
  const base = {
    aggressiveness: 0.5,
    friendliness: 0.5,
    greed: 0.5,
    culturalFocus: 0.5,
    techFocus: 0.5,
  };

  for (const trait of traits) {
    const overrides = TRAIT_PERSONALITY_MAP[trait];
    if (overrides) {
      Object.assign(base, overrides);
    }
  }

  return base;
}

function determineEra(stats: CivilizationStats): EraStage {
  let currentEra: EraStage = 'stoneAge';
  for (const threshold of ERA_THRESHOLDS) {
    if (
      stats.population >= threshold.minPopulation &&
      stats.technology >= threshold.minTechnology &&
      stats.culture >= threshold.minCulture
    ) {
      currentEra = threshold.era;
    }
  }
  return currentEra;
}

function createCivilization(id: string, startTileId: string, isPlayer: boolean = false): AICivilization {
  const traits = generateTraits();
  const personality = generatePersonality(traits);

  const civ: AICivilization = {
    id,
    name: isPlayer ? '你的文明' : generateCivilizationName(),
    color: isPlayer ? '#1E88E5' : generateCivilizationColor(),
    stats: { ...INITIAL_STATS },
    territory: [startTileId],
    capitalTileId: startTileId,
    traits: traits as any[],
    relations: [],
    era: 'stoneAge',
    personality,
    actionHistory: [],
    expansionHistory: [],
    beliefs: [],
  };

  civ.beliefs = getInitialBeliefs(civ);

  return civ;
}

export function getEraThresholds(): EraThreshold[] {
  return ERA_THRESHOLDS;
}

export function getEraInfo(era: EraStage): EraThreshold | undefined {
  return ERA_THRESHOLDS.find((t) => t.era === era);
}

export function initializeWorld(playerName: string = '你的文明'): WorldState {
  const map = generateWorldMap(16, 10);
  const aiCount = 4;
  const totalCivs = aiCount + 1;

  const startPositions = findStartPositions(map, totalCivs);

  const civilizations: AICivilization[] = [];

  const playerCiv = createCivilization('player', startPositions[0], true);
  playerCiv.name = playerName;
  civilizations.push(playerCiv);

  for (let i = 0; i < aiCount; i++) {
    const aiCiv = createCivilization(`ai-${i}`, startPositions[i + 1]);
    civilizations.push(aiCiv);
  }

  for (const civ of civilizations) {
    const startTile = map.tiles.find((t) => t.id === civ.capitalTileId);
    if (startTile) {
      startTile.ownerId = civ.id;
      startTile.isCapital = true;
      startTile.population = 5;
    }
  }

  for (const civ of civilizations) {
    civ.relations = civilizations
      .filter((c) => c.id !== civ.id)
      .map((c) => ({
        withId: c.id,
        status: 'neutral',
        opinion: 50,
        tradeAgreement: false,
        lastInteraction: 0,
      }));
  }

  return {
    turn: 1,
    civilizations,
    playerCivilizationId: 'player',
    map,
    turnEvents: [],
    gameOver: false,
    winnerId: null,
    rankings: calculateRankings(civilizations),
    recentExpansions: [],
  };
}

function updateTileOwnership(map: WorldState['map'], tileId: string, newOwnerId: string | null): void {
  const tile = map.tiles.find((t) => t.id === tileId);
  if (tile) {
    tile.ownerId = newOwnerId;
    if (newOwnerId) {
      tile.population = Math.max(1, Math.floor(tile.population * 0.7));
    }
  }
}

function addStats(stats: CivilizationStats, add: Partial<CivilizationStats>): CivilizationStats {
  return {
    population: Math.max(0, stats.population + (add.population || 0)),
    technology: Math.max(0, stats.technology + (add.technology || 0)),
    culture: Math.max(0, stats.culture + (add.culture || 0)),
    military: Math.max(0, stats.military + (add.military || 0)),
    agriculture: Math.max(0, stats.agriculture + (add.agriculture || 0)),
  };
}

function calculateTileProduction(civ: AICivilization, map: WorldState['map']): Partial<CivilizationStats> {
  const production: Partial<CivilizationStats> = {
    population: 0,
    technology: 0,
    culture: 0,
    military: 0,
    agriculture: 0,
  };

  for (const tileId of civ.territory) {
    const tile = map.tiles.find((t) => t.id === tileId);
    if (!tile) continue;

    if (tile.resources.agriculture) production.agriculture! += Math.floor(tile.resources.agriculture * 0.3);
    if (tile.resources.technology) production.technology! += Math.floor(tile.resources.technology * 0.2);
    if (tile.resources.culture) production.culture! += Math.floor(tile.resources.culture * 0.2);
    if (tile.resources.military) production.military! += Math.floor(tile.resources.military * 0.15);
    if (tile.resources.population) production.population! += Math.floor(tile.resources.population * 0.15);

    if (tile.terrain === 'river') {
      production.agriculture! += 1;
      production.population! += 1;
    }
    if (tile.terrain === 'coast') {
      production.technology! += 1;
    }
  }

  return production;
}

function calculateRankings(civilizations: AICivilization[]): CivilizationRanking[] {
  const alive = civilizations.filter((c) => c.territory.length > 0);

  const ranked = alive
    .map((civ) => {
      const territoryScore = civ.territory.length * 10;
      const militaryScore = civ.stats.military * 3;
      const cultureScore = civ.stats.culture * 2;
      const technologyScore = civ.stats.technology * 2;
      const totalScore = territoryScore + militaryScore + cultureScore + technologyScore;

      return {
        civilizationId: civ.id,
        totalScore,
        territoryScore,
        militaryScore,
        cultureScore,
        technologyScore,
        rank: 0,
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  ranked.forEach((r, i) => {
    r.rank = i + 1;
  });

  return ranked;
}

function executeExpandTerritory(state: WorldState, action: AIAction): TurnEvent | null {
  const civ = state.civilizations.find((c) => c.id === action.civilizationId);
  if (!civ || !action.tileId) return null;

  const tile = state.map.tiles.find((t) => t.id === action.tileId);
  if (!tile || tile.ownerId || tile.terrain === 'mountain') return null;

  const expandable = getExpandableTiles(state.map, civ);
  if (!expandable.includes(action.tileId)) return null;

  if (civ.stats.population < 5 || civ.stats.agriculture < 3) return null;

  let fromTileId = civ.capitalTileId;
  const adjacent = getAdjacentTiles(state.map, action.tileId);
  for (const adjId of adjacent) {
    if (civ.territory.includes(adjId)) {
      fromTileId = adjId;
      break;
    }
  }

  civ.stats.population -= 3;
  civ.stats.agriculture -= 2;

  tile.ownerId = civ.id;
  tile.population = 3;
  civ.territory.push(action.tileId);

  const expansion: TerritoryExpansion = {
    civilizationId: civ.id,
    tileId: action.tileId,
    turn: state.turn,
    fromTileId,
  };
  civ.expansionHistory.push(expansion);
  state.recentExpansions.push(expansion);

  return {
    id: `event-${Date.now()}-${Math.random()}`,
    turn: state.turn,
    type: 'expand_territory',
    actorId: civ.id,
    description: `${civ.name} 扩张领土到 (${tile.x}, ${tile.y})`,
    effects: [
      {
        civilizationId: civ.id,
        stats: { population: -3, agriculture: -2 },
        territoryGained: [action.tileId],
      },
    ],
  };
}

function executeBuildMilitary(state: WorldState, action: AIAction): TurnEvent | null {
  const civ = state.civilizations.find((c) => c.id === action.civilizationId);
  if (!civ || civ.stats.agriculture < 2) return null;

  const eraMultiplier = civ.era === 'scientific' ? 1.5 : civ.era === 'imperial' ? 1.3 : civ.era === 'agricultural' ? 1.1 : 1;
  const militaryGain = Math.floor(4 * eraMultiplier);

  civ.stats.military += militaryGain;
  civ.stats.agriculture -= 2;
  civ.stats.population -= 1;

  return {
    id: `event-${Date.now()}-${Math.random()}`,
    turn: state.turn,
    type: 'build_military',
    actorId: civ.id,
    description: `${civ.name} 加强军事力量（${ERA_THRESHOLDS.find(t => t.era === civ.era)?.name || '石器时代'}）`,
    effects: [
      {
        civilizationId: civ.id,
        stats: { military: militaryGain, agriculture: -2, population: -1 },
      },
    ],
  };
}

function executeDevelopTechnology(state: WorldState, action: AIAction): TurnEvent | null {
  const civ = state.civilizations.find((c) => c.id === action.civilizationId);
  if (!civ || civ.stats.population < 3) return null;

  const eraMultiplier = civ.era === 'scientific' ? 1.8 : civ.era === 'imperial' ? 1.3 : civ.era === 'agricultural' ? 1.1 : 1;
  const techGain = Math.floor(3 * eraMultiplier);

  civ.stats.technology += techGain;
  civ.stats.population -= 1;

  return {
    id: `event-${Date.now()}-${Math.random()}`,
    turn: state.turn,
    type: 'develop_technology',
    actorId: civ.id,
    description: `${civ.name} 取得科技突破`,
    effects: [
      {
        civilizationId: civ.id,
        stats: { technology: techGain, population: -1 },
      },
    ],
  };
}

function executeDevelopCulture(state: WorldState, action: AIAction): TurnEvent | null {
  const civ = state.civilizations.find((c) => c.id === action.civilizationId);
  if (!civ) return null;

  const eraMultiplier = civ.era === 'imperial' ? 1.5 : civ.era === 'scientific' ? 1.3 : 1;
  const cultureGain = Math.floor(4 * eraMultiplier);

  civ.stats.culture += cultureGain;

  return {
    id: `event-${Date.now()}-${Math.random()}`,
    turn: state.turn,
    type: 'develop_culture',
    actorId: civ.id,
    description: `${civ.name} 文化繁荣发展`,
    effects: [
      {
        civilizationId: civ.id,
        stats: { culture: cultureGain },
      },
    ],
  };
}

function executeDevelopAgriculture(state: WorldState, action: AIAction): TurnEvent | null {
  const civ = state.civilizations.find((c) => c.id === action.civilizationId);
  if (!civ) return null;

  const eraMultiplier = civ.era === 'agricultural' ? 1.6 : civ.era === 'scientific' ? 1.3 : 1;
  const agriGain = Math.floor(5 * eraMultiplier);
  const popGain = Math.floor(2 * eraMultiplier);

  civ.stats.agriculture += agriGain;
  civ.stats.population += popGain;

  return {
    id: `event-${Date.now()}-${Math.random()}`,
    turn: state.turn,
    type: 'develop_agriculture',
    actorId: civ.id,
    description: `${civ.name} 农业丰收`,
    effects: [
      {
        civilizationId: civ.id,
        stats: { agriculture: agriGain, population: popGain },
      },
    ],
  };
}

function executeTrade(state: WorldState, action: AIAction): TurnEvent | null {
  const civ = state.civilizations.find((c) => c.id === action.civilizationId);
  const target = state.civilizations.find((c) => c.id === action.targetId);
  if (!civ || !target) return null;

  const civRelation = civ.relations.find((r) => r.withId === target.id);
  const targetRelation = target.relations.find((r) => r.withId === civ.id);

  if (civRelation?.status === 'at_war' || targetRelation?.status === 'at_war') return null;

  if (civRelation) {
    civRelation.status = 'trading_partner';
    civRelation.tradeAgreement = true;
    civRelation.opinion = Math.min(100, civRelation.opinion + 15);
    civRelation.lastInteraction = state.turn;
  }

  if (targetRelation) {
    targetRelation.status = 'trading_partner';
    targetRelation.tradeAgreement = true;
    targetRelation.opinion = Math.min(100, targetRelation.opinion + 15);
    targetRelation.lastInteraction = state.turn;
  }

  const tradeLevel = Math.min(civ.era === 'scientific' ? 3 : civ.era === 'imperial' ? 2 : 1, target.era === 'scientific' ? 3 : target.era === 'imperial' ? 2 : 1);

  const civTech = tradeLevel;
  const civCulture = tradeLevel;
  const civAgri = tradeLevel;

  civ.stats.technology += civTech;
  civ.stats.culture += civCulture;
  civ.stats.agriculture += civAgri;

  target.stats.technology += civTech;
  target.stats.culture += civCulture;
  target.stats.agriculture += civAgri;

  return {
    id: `event-${Date.now()}-${Math.random()}`,
    turn: state.turn,
    type: 'trade',
    actorId: civ.id,
    targetId: target.id,
    description: `${civ.name} 与 ${target.name} 建立贸易关系（${tradeLevel}级贸易）`,
    effects: [
      {
        civilizationId: civ.id,
        stats: { technology: civTech, culture: civCulture, agriculture: civAgri },
      },
      {
        civilizationId: target.id,
        stats: { technology: civTech, culture: civCulture, agriculture: civAgri },
      },
    ],
  };
}

function executeBattle(state: WorldState, attacker: AICivilization, defender: AICivilization): BattleResult {
  const attackerEraBonus = attacker.era === 'scientific' ? 2.0 : attacker.era === 'imperial' ? 1.5 : attacker.era === 'agricultural' ? 1.2 : 1.0;
  const defenderEraBonus = defender.era === 'scientific' ? 1.5 : defender.era === 'imperial' ? 1.2 : defender.era === 'agricultural' ? 1.1 : 1.0;

  const attackerPower = (attacker.stats.military * 1.5 + attacker.stats.technology * 0.5) * attackerEraBonus + Math.random() * 10;
  const defenderPower = (defender.stats.military * 1.2 + defender.stats.technology * 0.3) * defenderEraBonus + Math.random() * 8;

  const attackerLosses = Math.floor(Math.min(attacker.stats.military * 0.3, defenderPower * 0.2));
  const defenderLosses = Math.floor(Math.min(defender.stats.military * 0.5, attackerPower * 0.3));

  attacker.stats.military = Math.max(0, attacker.stats.military - attackerLosses);
  defender.stats.military = Math.max(0, defender.stats.military - defenderLosses);

  const attackerWins = attackerPower > defenderPower;
  const winner = attackerWins ? attacker.id : defender.id;

  const capturedTiles: string[] = [];

  if (attackerWins) {
    const defenderBorderTiles = defender.territory.filter((tileId) => {
      const adjacent = getAdjacentTiles(state.map, tileId);
      return adjacent.some((adjId) => {
        const adjTile = state.map.tiles.find((t) => t.id === adjId);
        return adjTile && adjTile.ownerId === attacker.id;
      });
    });

    const maxCapture = Math.min(
      Math.floor(defenderBorderTiles.length * 0.5) + 1,
      Math.max(1, Math.floor(attackerPower / 15))
    );

    const tilesToCapture = Math.min(maxCapture, defenderBorderTiles.length);

    const shuffled = defenderBorderTiles.sort(() => Math.random() - 0.5);
    for (let i = 0; i < tilesToCapture && i < shuffled.length; i++) {
      if (shuffled[i] === defender.capitalTileId) continue;
      const tileId = shuffled[i];
      updateTileOwnership(state.map, tileId, attacker.id);
      attacker.territory.push(tileId);
      defender.territory = defender.territory.filter((t) => t !== tileId);
      capturedTiles.push(tileId);
    }
  }

  return {
    attackerId: attacker.id,
    defenderId: defender.id,
    attackerLosses,
    defenderLosses,
    winner,
    capturedTiles,
  };
}

function executeDeclareWar(state: WorldState, action: AIAction): TurnEvent | null {
  const attacker = state.civilizations.find((c) => c.id === action.civilizationId);
  const defender = state.civilizations.find((c) => c.id === action.targetId);
  if (!attacker || !defender) return null;

  const attackerRelation = attacker.relations.find((r) => r.withId === defender.id);
  const defenderRelation = defender.relations.find((r) => r.withId === attacker.id);

  if (attackerRelation) {
    attackerRelation.status = 'at_war';
    attackerRelation.opinion = 0;
    attackerRelation.tradeAgreement = false;
    attackerRelation.lastInteraction = state.turn;
  }

  if (defenderRelation) {
    defenderRelation.status = 'at_war';
    defenderRelation.opinion = 0;
    defenderRelation.tradeAgreement = false;
    defenderRelation.lastInteraction = state.turn;
  }

  for (const allyOfDefender of state.civilizations) {
    if (allyOfDefender.id === defender.id || allyOfDefender.id === attacker.id) continue;
    const allyRelation = defender.relations.find((r) => r.withId === allyOfDefender.id);
    if (allyRelation?.status === 'allied') {
      const attackerAllyRelation = attacker.relations.find((r) => r.withId === allyOfDefender.id);
      if (attackerAllyRelation && attackerAllyRelation.status !== 'at_war') {
        attackerAllyRelation.status = 'hostile';
        attackerAllyRelation.opinion = Math.max(0, attackerAllyRelation.opinion - 30);
      }
    }
  }

  const battleResult = executeBattle(state, attacker, defender);

  return {
    id: `event-${Date.now()}-${Math.random()}`,
    turn: state.turn,
    type: 'battle',
    actorId: attacker.id,
    targetId: defender.id,
    description: `${attacker.name} 向 ${defender.name} 宣战！${battleResult.winner === attacker.id ? `${attacker.name} 获胜，夺取了 ${battleResult.capturedTiles.length} 块领土` : `${defender.name} 成功防守`}`,
    effects: [
      {
        civilizationId: attacker.id,
        stats: { military: -battleResult.attackerLosses },
        territoryGained: battleResult.winner === attacker.id ? battleResult.capturedTiles : [],
      },
      {
        civilizationId: defender.id,
        stats: { military: -battleResult.defenderLosses },
        territoryLost: battleResult.winner === attacker.id ? battleResult.capturedTiles : [],
      },
    ],
  };
}

function executeProposeAlliance(state: WorldState, action: AIAction): TurnEvent | null {
  const civ = state.civilizations.find((c) => c.id === action.civilizationId);
  const target = state.civilizations.find((c) => c.id === action.targetId);
  if (!civ || !target) return null;

  const civRelation = civ.relations.find((r) => r.withId === target.id);
  const targetRelation = target.relations.find((r) => r.withId === civ.id);

  const targetWantsAlliance =
    target.personality.friendliness > 0.4 &&
    (target.relations.some((r) => r.status === 'at_war') || target.stats.military < 10) &&
    (civRelation?.opinion || 50) > 30;

  if (targetWantsAlliance && civRelation && targetRelation) {
    civRelation.status = 'allied';
    civRelation.opinion = 100;
    civRelation.lastInteraction = state.turn;

    targetRelation.status = 'allied';
    targetRelation.opinion = 100;
    targetRelation.lastInteraction = state.turn;

    return {
      id: `event-${Date.now()}-${Math.random()}`,
      turn: state.turn,
      type: 'diplomacy',
      actorId: civ.id,
      targetId: target.id,
      description: `${civ.name} 与 ${target.name} 缔结同盟！`,
      effects: [
        { civilizationId: civ.id, stats: { culture: 1 } },
        { civilizationId: target.id, stats: { culture: 1 } },
      ],
    };
  }

  return {
    id: `event-${Date.now()}-${Math.random()}`,
    turn: state.turn,
    type: 'diplomacy',
    actorId: civ.id,
    targetId: target.id,
    description: `${civ.name} 向 ${target.name} 提议结盟，但被拒绝`,
    effects: [],
  };
}

function executeSpreadCulture(state: WorldState, action: AIAction): TurnEvent | null {
  const civ = state.civilizations.find((c) => c.id === action.civilizationId);
  const target = state.civilizations.find((c) => c.id === action.targetId);
  if (!civ || !target || civ.stats.culture < 10) return null;

  const cultureDiff = civ.stats.culture - target.stats.culture;
  if (cultureDiff < 5) return null;

  civ.stats.culture -= 3;

  const convertedTiles: string[] = [];
  const targetBorderTiles = target.territory.filter((tileId) => {
    const adjacent = getAdjacentTiles(state.map, tileId);
    return adjacent.some((adjId) => {
      const adjTile = state.map.tiles.find((t) => t.id === adjId);
      return adjTile && adjTile.ownerId === civ.id;
    });
  });

  const convertChance = Math.min(0.5, cultureDiff / 50);
  for (const tileId of targetBorderTiles) {
    if (tileId === target.capitalTileId) continue;
    if (Math.random() < convertChance) {
      updateTileOwnership(state.map, tileId, civ.id);
      civ.territory.push(tileId);
      target.territory = target.territory.filter((t) => t !== tileId);
      convertedTiles.push(tileId);
    }
  }

  const targetRelation = target.relations.find((r) => r.withId === civ.id);
  if (targetRelation && convertedTiles.length > 0) {
    targetRelation.opinion = Math.max(0, targetRelation.opinion - 20);
  }

  return {
    id: `event-${Date.now()}-${Math.random()}`,
    turn: state.turn,
    type: 'culture_spread',
    actorId: civ.id,
    targetId: target.id,
    description: `${civ.name} 向 ${target.name} 传播文化${convertedTiles.length > 0 ? `，和平转化了 ${convertedTiles.length} 块领土` : ''}`,
    effects: [
      {
        civilizationId: civ.id,
        stats: { culture: -3 },
        territoryGained: convertedTiles,
      },
      {
        civilizationId: target.id,
        territoryLost: convertedTiles,
        stats: {},
      },
    ],
  };
}

function executeDefense(state: WorldState, action: AIAction): TurnEvent | null {
  const civ = state.civilizations.find((c) => c.id === action.civilizationId);
  if (!civ) return null;

  const eraBonus = ERA_BONUSES[civ.era] || {};

  civ.stats.military += 1;
  civ.stats.agriculture += 1;

  if (eraBonus.military) civ.stats.military += Math.floor(eraBonus.military * 0.5);
  if (eraBonus.agriculture) civ.stats.agriculture += Math.floor(eraBonus.agriculture * 0.5);

  for (const relation of civ.relations) {
    if (relation.status === 'neutral') {
      relation.opinion = Math.min(100, relation.opinion + 2);
    }
  }

  return {
    id: `event-${Date.now()}-${Math.random()}`,
    turn: state.turn,
    type: 'defense',
    actorId: civ.id,
    description: `${civ.name} 加强防御并休养生息`,
    effects: [
      {
        civilizationId: civ.id,
        stats: { military: 1, agriculture: 1 },
      },
    ],
  };
}

function applyTurnlyGrowth(state: WorldState): void {
  const eraProgressionEvents: TurnEvent[] = [];

  for (const civ of state.civilizations) {
    if (civ.territory.length === 0) continue;

    const previousEra = civ.era;

    const tileCount = civ.territory.length;
    const tileProduction = calculateTileProduction(civ, state.map);

    const agricultureBonus = Math.floor(civ.stats.agriculture / 5);
    civ.stats.population += Math.max(1, agricultureBonus + Math.floor(tileCount / 3));

    const techBonus = Math.floor(civ.stats.technology / 10);
    const cultureBonus = Math.floor(civ.stats.culture / 10);

    if (techBonus > 0) civ.stats.technology += techBonus;
    if (cultureBonus > 0) civ.stats.culture += cultureBonus;

    civ.stats.population += tileProduction.population || 0;
    civ.stats.technology += tileProduction.technology || 0;
    civ.stats.culture += tileProduction.culture || 0;
    civ.stats.military += tileProduction.military || 0;
    civ.stats.agriculture += tileProduction.agriculture || 0;

    const eraBonus = ERA_BONUSES[civ.era] || {};
    if (eraBonus.population) civ.stats.population += eraBonus.population;
    if (eraBonus.technology) civ.stats.technology += eraBonus.technology;
    if (eraBonus.culture) civ.stats.culture += eraBonus.culture;
    if (eraBonus.military) civ.stats.military += eraBonus.military;
    if (eraBonus.agriculture) civ.stats.agriculture += eraBonus.agriculture;

    for (const relation of civ.relations) {
      if (relation.status === 'trading_partner') {
        civ.stats.agriculture += 1;
        civ.stats.technology += 1;
      }
      if (relation.status === 'allied') {
        civ.stats.culture += 1;
        civ.stats.military += 1;
      }
      if (relation.status === 'at_war') {
        civ.stats.agriculture = Math.max(0, civ.stats.agriculture - 1);
      }
      if (relation.status === 'neutral') {
        const turnsSinceInteraction = state.turn - relation.lastInteraction;
        if (turnsSinceInteraction > 5) {
          relation.opinion = Math.max(30, relation.opinion - 1);
        }
      }
    }

    const newEra = determineEra(civ.stats);
    if (newEra !== previousEra) {
      civ.era = newEra;
      const eraInfo = ERA_THRESHOLDS.find((t) => t.era === newEra);
      if (eraInfo) {
        eraProgressionEvents.push({
          id: `event-era-${Date.now()}-${Math.random()}`,
          turn: state.turn,
          type: 'diplomacy',
          actorId: civ.id,
          description: `${civ.name} 进入了${eraInfo.name}！${eraInfo.description}`,
          effects: [],
        });
      }
    }
  }

  state.turnEvents = [...state.turnEvents, ...eraProgressionEvents];
}

function checkGameOver(state: WorldState): void {
  const aliveCivs = state.civilizations.filter((c) => c.territory.length > 0);

  if (aliveCivs.length === 1) {
    state.gameOver = true;
    state.winnerId = aliveCivs[0].id;
    return;
  }

  const playerCiv = state.civilizations.find((c) => c.id === state.playerCivilizationId);
  if (playerCiv && playerCiv.territory.length === 0) {
    state.gameOver = true;
    const strongest = aliveCivs.reduce((a, b) =>
      a.territory.length > b.territory.length ? a : b
    );
    state.winnerId = strongest.id;
  }

  if (state.turn >= 100) {
    state.gameOver = true;
    const strongest = aliveCivs.reduce((a, b) =>
      a.territory.length > b.territory.length ? a : b
    );
    state.winnerId = strongest.id;
  }

  const dominantCiv = aliveCivs.find((c) => {
    const totalTiles = state.map.tiles.filter((t) => t.ownerId).length;
    return totalTiles > 0 && c.territory.length / totalTiles > 0.7;
  });
  if (dominantCiv && state.turn >= 20) {
    state.gameOver = true;
    state.winnerId = dominantCiv.id;
  }
}

export function processTurn(state: WorldState, playerAction?: AIAction): WorldState {
  const newState: WorldState = JSON.parse(JSON.stringify(state));
  newState.recentExpansions = [];
  const turnEvents: TurnEvent[] = [];

  const activeCivs = newState.civilizations.filter((c) => c.territory.length > 0);

  const actionOrder = [...activeCivs].sort((a, b) => {
    if (a.id === newState.playerCivilizationId) return -1;
    if (b.id === newState.playerCivilizationId) return 1;
    return b.stats.military - a.stats.military;
  });

  for (const civ of actionOrder) {
    let action: AIAction;

    if (civ.id === newState.playerCivilizationId && playerAction) {
      action = playerAction;
    } else if (civ.id !== newState.playerCivilizationId) {
      action = makeAIDecision(civ, newState);
    } else {
      continue;
    }

    civ.actionHistory.push({
      turn: newState.turn,
      action: action.type,
      targetId: action.targetId,
    });

    let event: TurnEvent | null = null;

    switch (action.type) {
      case 'expand_territory':
        event = executeExpandTerritory(newState, action);
        break;
      case 'build_military':
        event = executeBuildMilitary(newState, action);
        break;
      case 'develop_technology':
        event = executeDevelopTechnology(newState, action);
        break;
      case 'develop_culture':
        event = executeDevelopCulture(newState, action);
        break;
      case 'develop_agriculture':
        event = executeDevelopAgriculture(newState, action);
        break;
      case 'trade':
        event = executeTrade(newState, action);
        break;
      case 'declare_war':
        event = executeDeclareWar(newState, action);
        break;
      case 'propose_alliance':
        event = executeProposeAlliance(newState, action);
        break;
      case 'spread_culture':
        event = executeSpreadCulture(newState, action);
        break;
      case 'defense':
        event = executeDefense(newState, action);
        break;
    }

    if (event) {
      turnEvents.push(event);
    }
  }

  applyTurnlyGrowth(newState);
  const beliefEvents = propagateBeliefs(newState);
  newState.turnEvents = [...newState.turnEvents, ...beliefEvents];
  checkGameOver(newState);

  newState.rankings = calculateRankings(newState.civilizations);
  newState.turn += 1;
  newState.turnEvents = [...newState.turnEvents, ...turnEvents];

  return newState;
}

export function getPlayerActions(state: WorldState): AIAction[] {
  const player = state.civilizations.find((c) => c.id === state.playerCivilizationId);
  if (!player) return [];

  const actions: AIAction[] = [];

  actions.push({ type: 'develop_agriculture', civilizationId: player.id });
  actions.push({ type: 'build_military', civilizationId: player.id });
  actions.push({ type: 'develop_technology', civilizationId: player.id });
  actions.push({ type: 'develop_culture', civilizationId: player.id });

  const expandable = getExpandableTiles(state.map, player);
  if (expandable.length > 0 && player.stats.population >= 5 && player.stats.agriculture >= 3) {
    const bestTiles = expandable
      .map((tileId) => {
        const tile = state.map.tiles.find((t) => t.id === tileId)!;
        const value = (tile.resources.agriculture || 0) * 2 + (tile.resources.population || 0) * 2 + (tile.resources.technology || 0) + (tile.resources.culture || 0);
        return { tileId, value };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    for (const { tileId } of bestTiles) {
      actions.push({ type: 'expand_territory', civilizationId: player.id, tileId });
    }
  }

  const neighbors = new Set<string>();
  for (const tileId of player.territory) {
    const adjacent = getAdjacentTiles(state.map, tileId);
    for (const adjId of adjacent) {
      const tile = state.map.tiles.find((t) => t.id === adjId);
      if (tile && tile.ownerId && tile.ownerId !== player.id) {
        neighbors.add(tile.ownerId);
      }
    }
  }

  for (const neighborId of neighbors) {
    const neighbor = state.civilizations.find((c) => c.id === neighborId);
    if (!neighbor || neighbor.territory.length === 0) continue;

    const relation = player.relations.find((r) => r.withId === neighborId);
    if (relation?.status !== 'at_war' && player.stats.military >= 8) {
      actions.push({ type: 'declare_war', civilizationId: player.id, targetId: neighborId });
    }
    if (relation?.status !== 'trading_partner' && relation?.status !== 'at_war') {
      actions.push({ type: 'trade', civilizationId: player.id, targetId: neighborId });
    }
    if (player.stats.culture >= 10) {
      actions.push({ type: 'spread_culture', civilizationId: player.id, targetId: neighborId });
    }
  }

  const potentialAllies = state.civilizations.filter((c) => {
    if (c.id === player.id || c.territory.length === 0) return false;
    const relation = player.relations.find((r) => r.withId === c.id);
    return relation?.status !== 'at_war' && relation?.status !== 'allied';
  });

  for (const ally of potentialAllies.slice(0, 3)) {
    actions.push({ type: 'propose_alliance', civilizationId: player.id, targetId: ally.id });
  }

  actions.push({ type: 'defense', civilizationId: player.id });

  return actions;
}
