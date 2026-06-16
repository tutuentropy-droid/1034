import type { AICivilization, WorldMap, AIAction, AIDecision, WorldState, CivilizationStats, EraStage } from '../types';
import { getExpandableTiles, getAdjacentTiles } from './worldMapGenerator';

function calculateTotalPower(civ: AICivilization): number {
  const eraMultiplier = civ.era === 'scientific' ? 1.5 : civ.era === 'imperial' ? 1.3 : civ.era === 'agricultural' ? 1.1 : 1.0;
  return (civ.stats.military * 2 + civ.stats.population + civ.stats.technology + civ.stats.culture) * eraMultiplier;
}

function getMilitaryStrength(civ: AICivilization): number {
  const eraMultiplier = civ.era === 'scientific' ? 2.0 : civ.era === 'imperial' ? 1.5 : civ.era === 'agricultural' ? 1.2 : 1.0;
  return civ.stats.military * eraMultiplier;
}

function getWeakestNeighbor(civ: AICivilization, state: WorldState): AICivilization | null {
  const neighborIds = new Set<string>();

  for (const tileId of civ.territory) {
    const adjacent = getAdjacentTiles(state.map, tileId);
    for (const adjId of adjacent) {
      const tile = state.map.tiles.find((t) => t.id === adjId);
      if (tile && tile.ownerId && tile.ownerId !== civ.id) {
        neighborIds.add(tile.ownerId);
      }
    }
  }

  let weakest: AICivilization | null = null;
  let minPower = Infinity;

  for (const neighborId of neighborIds) {
    const neighbor = state.civilizations.find((c) => c.id === neighborId);
    if (neighbor && neighbor.territory.length > 0) {
      const power = calculateTotalPower(neighbor);
      const relation = civ.relations.find((r) => r.withId === neighborId);
      if (power < minPower && (!relation || relation.status !== 'allied')) {
        minPower = power;
        weakest = neighbor;
      }
    }
  }

  return weakest;
}

function getRichestTradingPartner(civ: AICivilization, state: WorldState): AICivilization | null {
  let best: AICivilization | null = null;
  let maxWealth = 0;

  for (const other of state.civilizations) {
    if (other.id === civ.id || other.territory.length === 0) continue;

    const relation = civ.relations.find((r) => r.withId === other.id);
    if (relation && (relation.status === 'at_war' || relation.status === 'hostile')) continue;

    const wealth = other.stats.agriculture + other.stats.technology + other.stats.population;
    const eraBonus = other.era === 'scientific' ? 1.5 : other.era === 'imperial' ? 1.2 : 1.0;
    const adjustedWealth = wealth * eraBonus;
    if (adjustedWealth > maxWealth) {
      maxWealth = adjustedWealth;
      best = other;
    }
  }

  return best;
}

function isUnderThreat(civ: AICivilization, state: WorldState): boolean {
  const atWar = civ.relations.filter((r) => r.status === 'at_war');
  if (atWar.length >= 2) return true;

  for (const relation of atWar) {
    const enemy = state.civilizations.find((c) => c.id === relation.withId);
    if (enemy && getMilitaryStrength(enemy) > getMilitaryStrength(civ) * 0.8) {
      return true;
    }
  }

  return false;
}

function getUrgentNeeds(civ: AICivilization, state: WorldState): ('military' | 'agriculture' | 'technology' | 'culture')[] {
  const needs: ('military' | 'agriculture' | 'technology' | 'culture')[] = [];

  if (isUnderThreat(civ, state) && civ.stats.military < 15) {
    needs.push('military');
  }
  if (civ.stats.agriculture < civ.stats.population * 0.3) {
    needs.push('agriculture');
  }
  if (civ.stats.technology < 10 && civ.era === 'stoneAge') {
    needs.push('technology');
  }
  if (civ.stats.population < 8) {
    needs.push('agriculture');
  }

  return needs;
}

function evaluateExpandTerritory(civ: AICivilization, map: WorldMap): AIDecision | null {
  const expandable = getExpandableTiles(map, civ);
  if (expandable.length === 0) return null;

  const canExpand = civ.stats.population >= 5 && civ.stats.agriculture >= 3;
  if (!canExpand) return null;

  const bestTile = expandable.reduce((best, tileId) => {
    const tile = map.tiles.find((t) => t.id === tileId)!;
    const bestTileObj = map.tiles.find((t) => t.id === best)!;
    const tileValue = (tile.resources.agriculture || 0) * 2 + (tile.resources.population || 0) * 2 + (tile.resources.technology || 0) + (tile.resources.culture || 0);
    const bestValue = (bestTileObj.resources.agriculture || 0) * 2 + (bestTileObj.resources.population || 0) * 2 + (bestTileObj.resources.technology || 0) + (bestTileObj.resources.culture || 0);
    return tileValue > bestValue ? tileId : best;
  }, expandable[0]);

  let priority = 50 + civ.personality.greed * 20;
  if (civ.traits.includes('expansionist')) priority += 30;
  if (civ.era === 'agricultural') priority += 10;
  if (civ.era === 'imperial') priority += 15;
  if (expandable.length > 5) priority += 10;

  if (civ.stats.population < 8 || civ.stats.agriculture < 5) {
    priority -= 20;
  }

  return {
    priority,
    action: {
      type: 'expand_territory',
      civilizationId: civ.id,
      tileId: bestTile,
    },
    reasoning: `扩张领土到 ${bestTile} 获得更多资源`,
  };
}

function evaluateBuildMilitary(civ: AICivilization, state: WorldState): AIDecision | null {
  if (civ.stats.agriculture < 2) return null;

  const isAtWar = civ.relations.some((r) => r.status === 'at_war');
  const hasWeakMilitary = civ.stats.military < 10;
  const isAggressive = civ.traits.includes('aggressive');
  const isImperial = civ.era === 'imperial';

  let priority = 30;
  if (isAtWar) priority += 40;
  if (hasWeakMilitary) priority += 20;
  if (isAggressive) priority += 25;
  if (isImperial) priority += 15;
  priority += civ.personality.aggressiveness * 15;

  if (isUnderThreat(civ, state)) {
    priority += 30;
  }

  const strongNeighbors = state.civilizations.filter((c) => {
    if (c.id === civ.id || c.territory.length === 0) return false;
    const relation = civ.relations.find((r) => r.withId === c.id);
    return relation?.status !== 'allied' && getMilitaryStrength(c) > getMilitaryStrength(civ) * 0.7;
  });
  if (strongNeighbors.length > 0) {
    priority += 15;
  }

  return {
    priority,
    action: {
      type: 'build_military',
      civilizationId: civ.id,
    },
    reasoning: '增强军事力量',
  };
}

function evaluateDevelopTechnology(civ: AICivilization): AIDecision | null {
  if (civ.stats.population < 3) return null;

  let priority = 25;
  priority += civ.personality.techFocus * 20;
  if (civ.traits.includes('cultural')) priority += 15;
  if (civ.era === 'agricultural') priority += 10;
  if (civ.era === 'scientific') priority += 20;

  if (civ.stats.technology < 15 && civ.era === 'stoneAge') {
    priority += 15;
  }

  return {
    priority,
    action: {
      type: 'develop_technology',
      civilizationId: civ.id,
    },
    reasoning: '发展科技提升文明实力',
  };
}

function evaluateDevelopCulture(civ: AICivilization): AIDecision | null {
  let priority = 20;
  priority += civ.personality.culturalFocus * 25;
  if (civ.traits.includes('cultural')) priority += 30;
  if (civ.era === 'imperial') priority += 15;

  if (civ.stats.culture >= 8 && civ.territory.length > 3) {
    const neighborIds = new Set<string>();
    for (const tileId of civ.territory) {
      const adjacent = getAdjacentTiles({ width: 0, height: 0, tiles: [], continents: [] }, tileId);
      neighborIds.add(adjacent[0]);
    }
    if (neighborIds.size > 0) {
      priority += 10;
    }
  }

  return {
    priority,
    action: {
      type: 'develop_culture',
      civilizationId: civ.id,
    },
    reasoning: '发展文化增强影响力',
  };
}

function evaluateDevelopAgriculture(civ: AICivilization): AIDecision | null {
  if (civ.stats.agriculture > civ.stats.population * 1.5) return null;

  let priority = 35;
  if (civ.stats.agriculture < 5) priority += 20;
  if (civ.traits.includes('peaceful')) priority += 15;
  if (civ.era === 'agricultural') priority += 20;
  if (civ.stats.population > civ.stats.agriculture * 0.8) priority += 15;

  return {
    priority,
    action: {
      type: 'develop_agriculture',
      civilizationId: civ.id,
    },
    reasoning: '发展农业养活更多人口',
  };
}

function evaluateTrade(civ: AICivilization, state: WorldState): AIDecision | null {
  if (!civ.traits.includes('trader') && civ.personality.friendliness < 0.4) return null;

  const partner = getRichestTradingPartner(civ, state);
  if (!partner) return null;

  const relation = civ.relations.find((r) => r.withId === partner.id);
  if (relation?.status === 'trading_partner') return null;
  if (relation?.status === 'at_war') return null;

  let priority = 30 + civ.personality.friendliness * 20 + (civ.traits.includes('trader') ? 25 : 0);

  if (civ.era === 'agricultural') priority += 10;
  if (civ.era === 'scientific') priority += 15;
  if (partner.era === 'scientific' && civ.era !== 'scientific') priority += 20;

  if (civ.stats.agriculture < 10) priority += 10;

  return {
    priority,
    action: {
      type: 'trade',
      civilizationId: civ.id,
      targetId: partner.id,
    },
    reasoning: `与 ${partner.name} 建立贸易关系`,
  };
}

function evaluateDeclareWar(civ: AICivilization, state: WorldState): AIDecision | null {
  if (!civ.traits.includes('aggressive') && civ.personality.aggressiveness < 0.5) return null;
  if (civ.stats.military < 8) return null;

  const warCount = civ.relations.filter((r) => r.status === 'at_war').length;
  if (warCount >= 2) return null;

  const target = getWeakestNeighbor(civ, state);
  if (!target) return null;

  const myPower = calculateTotalPower(civ);
  const targetPower = calculateTotalPower(target);
  const powerAdvantage = myPower / (targetPower + 1);

  if (powerAdvantage < 1.3) return null;

  const targetMilitary = getMilitaryStrength(target);
  if (targetMilitary > getMilitaryStrength(civ) * 0.8 && !civ.traits.includes('aggressive')) {
    return null;
  }

  let priority = 40 + civ.personality.aggressiveness * 30;
  if (civ.traits.includes('expansionist')) priority += 20;
  if (civ.era === 'imperial') priority += 20;
  if (civ.era === 'scientific') priority += 15;

  const relation = civ.relations.find((r) => r.withId === target.id);
  if (relation?.status === 'hostile') priority += 25;
  if (relation?.status === 'trading_partner') priority -= 30;

  if (isUnderThreat(civ, state)) {
    priority -= 40;
  }

  const defenderAllies = target.relations.filter((r) => r.status === 'allied');
  if (defenderAllies.length > 0) {
    priority -= defenderAllies.length * 15;
  }

  return {
    priority: Math.max(0, priority),
    action: {
      type: 'declare_war',
      civilizationId: civ.id,
      targetId: target.id,
    },
    reasoning: `向 ${target.name} 宣战，夺取领土`,
  };
}

function evaluateProposeAlliance(civ: AICivilization, state: WorldState): AIDecision | null {
  if (!civ.traits.includes('peaceful') && civ.personality.friendliness < 0.6) return null;

  const isAtWar = civ.relations.some((r) => r.status === 'at_war');

  const potentialAllies = state.civilizations.filter((c) => {
    if (c.id === civ.id || c.territory.length === 0) return false;
    const relation = civ.relations.find((r) => r.withId === c.id);
    return !relation || (relation.status !== 'at_war' && relation.status !== 'hostile' && relation.status !== 'allied');
  });

  if (potentialAllies.length === 0) return null;

  const strongest = potentialAllies.reduce((a, b) =>
    calculateTotalPower(a) > calculateTotalPower(b) ? a : b
  );

  let priority = 45 + civ.personality.friendliness * 15;

  if (isAtWar) priority += 30;
  if (isUnderThreat(civ, state)) priority += 25;
  if (civ.era === 'imperial' && !isAtWar) priority -= 20;

  const strongEnemies = civ.relations.filter((r) => {
    if (r.status !== 'at_war') return false;
    const enemy = state.civilizations.find((c) => c.id === r.withId);
    return enemy && calculateTotalPower(enemy) > calculateTotalPower(civ) * 0.7;
  });
  if (strongEnemies.length > 0) {
    priority += 20;
  }

  return {
    priority,
    action: {
      type: 'propose_alliance',
      civilizationId: civ.id,
      targetId: strongest.id,
    },
    reasoning: `与 ${strongest.name} 结盟共同抗敌`,
  };
}

function evaluateSpreadCulture(civ: AICivilization, state: WorldState): AIDecision | null {
  if (civ.stats.culture < 10) return null;
  if (civ.personality.culturalFocus < 0.4 && !civ.traits.includes('cultural')) return null;

  const neighborIds = new Set<string>();
  for (const tileId of civ.territory) {
    const adjacent = getAdjacentTiles(state.map, tileId);
    for (const adjId of adjacent) {
      const tile = state.map.tiles.find((t) => t.id === adjId);
      if (tile && tile.ownerId && tile.ownerId !== civ.id) {
        neighborIds.add(tile.ownerId);
      }
    }
  }

  let target: AICivilization | null = null;
  let minCulture = Infinity;

  for (const neighborId of neighborIds) {
    const neighbor = state.civilizations.find((c) => c.id === neighborId);
    if (neighbor && neighbor.stats.culture < minCulture && neighbor.territory.length > 0) {
      const relation = civ.relations.find((r) => r.withId === neighbor.id);
      if (relation?.status !== 'at_war') {
        minCulture = neighbor.stats.culture;
        target = neighbor;
      }
    }
  }

  if (!target) return null;

  let priority = 25 + civ.personality.culturalFocus * 20 + (civ.traits.includes('cultural') ? 25 : 0);

  if (civ.era === 'imperial') priority += 15;
  if (civ.era === 'scientific') priority += 10;

  const cultureDiff = civ.stats.culture - target.stats.culture;
  if (cultureDiff > 15) priority += 10;

  return {
    priority,
    action: {
      type: 'spread_culture',
      civilizationId: civ.id,
      targetId: target.id,
    },
    reasoning: `向 ${target.name} 传播文化影响力`,
  };
}

function evaluateDefense(civ: AICivilization, state: WorldState): AIDecision | null {
  let priority = 15;

  if (isUnderThreat(civ, state)) {
    priority += 20;
  }
  if (civ.relations.some((r) => r.status === 'at_war') && civ.stats.military < 15) {
    priority += 15;
  }
  if (civ.stats.agriculture < 5) {
    priority += 10;
  }
  if (civ.traits.includes('defensive')) {
    priority += 15;
  }

  return {
    priority,
    action: {
      type: 'defense',
      civilizationId: civ.id,
    },
    reasoning: '休养生息恢复国力',
  };
}

export function makeAIDecision(civ: AICivilization, state: WorldState): AIAction {
  const evaluations: AIDecision[] = [];

  const urgentNeeds = getUrgentNeeds(civ, state);

  const expand = evaluateExpandTerritory(civ, state.map);
  if (expand) evaluations.push(expand);

  const military = evaluateBuildMilitary(civ, state);
  if (military) evaluations.push(military);

  const tech = evaluateDevelopTechnology(civ);
  if (tech) evaluations.push(tech);

  const culture = evaluateDevelopCulture(civ);
  if (culture) evaluations.push(culture);

  const agriculture = evaluateDevelopAgriculture(civ);
  if (agriculture) evaluations.push(agriculture);

  const trade = evaluateTrade(civ, state);
  if (trade) evaluations.push(trade);

  const war = evaluateDeclareWar(civ, state);
  if (war) evaluations.push(war);

  const alliance = evaluateProposeAlliance(civ, state);
  if (alliance) evaluations.push(alliance);

  const spreadCulture = evaluateSpreadCulture(civ, state);
  if (spreadCulture) evaluations.push(spreadCulture);

  const defense = evaluateDefense(civ, state);
  if (defense) evaluations.push(defense);

  if (evaluations.length === 0) {
    return {
      type: 'defense',
      civilizationId: civ.id,
    };
  }

  for (const evaluation of evaluations) {
    if (urgentNeeds.includes('military') && evaluation.action.type === 'build_military') {
      evaluation.priority += 25;
    }
    if (urgentNeeds.includes('agriculture') && (evaluation.action.type === 'develop_agriculture')) {
      evaluation.priority += 25;
    }
  }

  evaluations.sort((a, b) => b.priority - a.priority);

  const topChoices = evaluations.slice(0, Math.min(4, evaluations.length));
  const totalPriority = topChoices.reduce((sum, e) => sum + e.priority, 0);
  let random = Math.random() * totalPriority;

  for (const choice of topChoices) {
    random -= choice.priority;
    if (random <= 0) {
      return choice.action;
    }
  }

  return evaluations[0].action;
}

export function generateCivilizationName(): string {
  const prefixes = ['古', '新', '大', '神', '圣', '永', '天', '地', '日', '月'];
  const middles = ['罗马', '希腊', '埃及', '波斯', '华夏', '印度', '玛雅', '印加', '阿兹特克', '巴比伦'];
  const suffixes = ['帝国', '王国', '共和国', '联邦', '王朝', '部落', '联盟', '合众国'];

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const middle = middles[Math.floor(Math.random() * middles.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  return `${prefix}${middle}${suffix}`;
}

export function generateCivilizationColor(): string {
  const colors = [
    '#E53935', '#D81B60', '#8E24AA', '#5E35B1',
    '#3949AB', '#1E88E5', '#039BE5', '#00ACC1',
    '#00897B', '#43A047', '#7CB342', '#C0CA33',
    '#FDD835', '#FFB300', '#FB8C00', '#F4511E',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
