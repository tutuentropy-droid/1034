import type {
  Belief,
  BeliefId,
  BeliefInfection,
  AICivilization,
  WorldState,
  TurnEvent,
  CivilizationTrait,
  EraStage,
} from '../types';

export const BELIEFS: Belief[] = [
  {
    id: 'consumerism',
    name: '消费主义',
    icon: '🛍️',
    color: '#FF6D00',
    description: '物质追求至上，消费驱动社会运转',
    baseInfectivity: 0.15,
    tradeMultiplier: 2.5,
    warMultiplier: 0.3,
    techMultiplier: 1.2,
    populationMultiplier: 1.0,
    eraAffinity: { scientific: 1.8, imperial: 1.2 },
    traitAffinity: { trader: 2.0 },
    effects: { agriculture: -1, technology: 2, culture: -1 },
  },
  {
    id: 'militarism',
    name: '军国主义',
    icon: '⚔️',
    color: '#D32F2F',
    description: '武力至上，强权即公理，以战争解决争端',
    baseInfectivity: 0.12,
    tradeMultiplier: 0.5,
    warMultiplier: 3.0,
    techMultiplier: 0.8,
    populationMultiplier: 0.6,
    eraAffinity: { imperial: 2.0, stoneAge: 0.8 },
    traitAffinity: { aggressive: 2.5, expansionist: 1.5 },
    effects: { military: 3, agriculture: -2, culture: -1 },
  },
  {
    id: 'fundamentalism',
    name: '原教旨主义',
    icon: '📜',
    color: '#6A1B9A',
    description: '回归原始教义，拒绝一切变革与异端思想',
    baseInfectivity: 0.10,
    tradeMultiplier: 0.3,
    warMultiplier: 1.5,
    techMultiplier: 0.2,
    populationMultiplier: 1.3,
    eraAffinity: { stoneAge: 2.0, agricultural: 1.5 },
    traitAffinity: { defensive: 1.5 },
    effects: { culture: 3, technology: -3, military: 1 },
  },
  {
    id: 'techno_utopianism',
    name: '科技乌托邦',
    icon: '🤖',
    color: '#0091EA',
    description: '科技能解决一切问题，理性主导人类未来',
    baseInfectivity: 0.08,
    tradeMultiplier: 1.0,
    warMultiplier: 0.4,
    techMultiplier: 2.8,
    populationMultiplier: 0.7,
    eraAffinity: { scientific: 2.5, imperial: 0.8 },
    traitAffinity: { cultural: 1.2 },
    effects: { technology: 4, agriculture: -1, population: -1 },
  },
  {
    id: 'isolationism',
    name: '孤立主义',
    icon: '🏯',
    color: '#4E342E',
    description: '闭关锁国，自给自足，拒绝外部接触',
    baseInfectivity: 0.06,
    tradeMultiplier: 0.1,
    warMultiplier: 0.5,
    techMultiplier: 0.3,
    populationMultiplier: 1.5,
    eraAffinity: { stoneAge: 1.8, agricultural: 1.3 },
    traitAffinity: { defensive: 2.0, peaceful: 1.0 },
    effects: { agriculture: 2, technology: -2, military: 1 },
  },
  {
    id: 'cosmopolitanism',
    name: '世界主义',
    icon: '🌍',
    color: '#00BFA5',
    description: '天下大同，开放包容，拥抱多元文化',
    baseInfectivity: 0.13,
    tradeMultiplier: 2.0,
    warMultiplier: 0.1,
    techMultiplier: 1.5,
    populationMultiplier: 1.8,
    eraAffinity: { scientific: 1.5, imperial: 1.0 },
    traitAffinity: { trader: 1.5, peaceful: 1.5 },
    effects: { culture: 2, technology: 1, military: -2 },
  },
  {
    id: 'egalitarianism',
    name: '平等主义',
    icon: '⚖️',
    color: '#558B2F',
    description: '众生平等，资源公平分配，权力共享',
    baseInfectivity: 0.11,
    tradeMultiplier: 1.2,
    warMultiplier: 0.2,
    techMultiplier: 0.8,
    populationMultiplier: 1.6,
    eraAffinity: { agricultural: 1.5, scientific: 1.2 },
    traitAffinity: { peaceful: 2.0 },
    effects: { population: 2, agriculture: 1, military: -1 },
  },
  {
    id: 'authoritarianism',
    name: '威权主义',
    icon: '👑',
    color: '#37474F',
    description: '秩序高于自由，集权统治保障文明稳定',
    baseInfectivity: 0.14,
    tradeMultiplier: 0.8,
    warMultiplier: 2.0,
    techMultiplier: 1.0,
    populationMultiplier: 0.9,
    eraAffinity: { imperial: 2.2, stoneAge: 1.0 },
    traitAffinity: { aggressive: 1.5, expansionist: 1.2 },
    effects: { military: 2, culture: -1, population: 1 },
  },
];

export function getBeliefById(id: BeliefId): Belief | undefined {
  return BELIEFS.find((b) => b.id === id);
}

export function getInitialBeliefs(civ: AICivilization): BeliefInfection[] {
  const infections: BeliefInfection[] = [];

  for (const belief of BELIEFS) {
    const traitScore = civ.traits.reduce((sum, trait) => {
      return sum + (belief.traitAffinity[trait as CivilizationTrait] || 0);
    }, 0);
    const eraScore = belief.eraAffinity[civ.era as EraStage] || 0;
    const totalAffinity = traitScore + eraScore;

    if (totalAffinity >= 2.0) {
      const infectionLevel = Math.min(100, Math.floor(totalAffinity * 15 + Math.random() * 10));
      infections.push({
        beliefId: belief.id,
        infectionLevel,
        turnsInfected: 0,
        source: 'indigenous',
      });
    } else if (totalAffinity >= 1.0 && Math.random() < 0.3) {
      const infectionLevel = Math.min(100, Math.floor(totalAffinity * 8 + Math.random() * 5));
      infections.push({
        beliefId: belief.id,
        infectionLevel,
        turnsInfected: 0,
        source: 'indigenous',
      });
    }
  }

  return infections;
}

function calculateTransmissionRate(
  belief: Belief,
  source: AICivilization,
  target: AICivilization,
  worldState: WorldState
): number {
  let rate = belief.baseInfectivity;

  const sourceInfection = source.beliefs.find((b) => b.beliefId === belief.id);
  if (!sourceInfection || sourceInfection.infectionLevel < 20) return 0;

  rate *= sourceInfection.infectionLevel / 100;

  const relation = source.relations.find((r) => r.withId === target.id);

  if (relation?.tradeAgreement || relation?.status === 'trading_partner') {
    rate *= belief.tradeMultiplier;
  }

  if (relation?.status === 'at_war') {
    rate *= belief.warMultiplier;
  }

  const techRatio = Math.max(0.1, target.stats.technology / Math.max(1, source.stats.technology));
  rate *= 1 + (techRatio - 1) * belief.techMultiplier * 0.1;

  const popRatio = target.stats.population / Math.max(1, source.stats.population);
  rate *= 1 + (popRatio - 1) * belief.populationMultiplier * 0.05;

  const eraAffinity = belief.eraAffinity[target.era as EraStage] || 1.0;
  rate *= eraAffinity;

  const traitBonus = target.traits.reduce((sum, trait) => {
    return sum + (belief.traitAffinity[trait as CivilizationTrait] || 0);
  }, 0);
  rate *= 1 + traitBonus * 0.15;

  const borderContact = hasBorderContact(source, target, worldState);
  if (borderContact) {
    rate *= 1.5;
  }

  if (relation?.status === 'allied') {
    rate *= 1.8;
  }

  return Math.min(rate, 0.8);
}

function hasBorderContact(
  source: AICivilization,
  target: AICivilization,
  worldState: WorldState
): boolean {
  for (const tileId of source.territory) {
    const tile = worldState.map.tiles.find((t) => t.id === tileId);
    if (!tile) continue;
    const neighbors = worldState.map.tiles.filter(
      (t) => Math.abs(t.x - tile.x) <= 1 && Math.abs(t.y - tile.y) <= 1 && t.id !== tileId
    );
    if (neighbors.some((n) => n.ownerId === target.id)) {
      return true;
    }
  }
  return false;
}

export function propagateBeliefs(worldState: WorldState): TurnEvent[] {
  const events: TurnEvent[] = [];
  const aliveCivs = worldState.civilizations.filter((c) => c.territory.length > 0);

  for (const targetCiv of aliveCivs) {
    for (const belief of BELIEFS) {
      const existingInfection = targetCiv.beliefs.find((b) => b.beliefId === belief.id);

      if (existingInfection) {
        existingInfection.turnsInfected += 1;

        if (existingInfection.infectionLevel >= 80) {
          existingInfection.infectionLevel = Math.min(
            100,
            existingInfection.infectionLevel + Math.floor(Math.random() * 3)
          );
        } else if (existingInfection.infectionLevel >= 40) {
          existingInfection.infectionLevel = Math.min(
            100,
            existingInfection.infectionLevel + Math.floor(Math.random() * 5 + 1)
          );
        } else {
          existingInfection.infectionLevel = Math.max(
            0,
            existingInfection.infectionLevel + Math.floor(Math.random() * 7 - 2)
          );
        }

        if (existingInfection.infectionLevel <= 0) {
          targetCiv.beliefs = targetCiv.beliefs.filter((b) => b.beliefId !== belief.id);
        }

        if (existingInfection.infectionLevel >= 30) {
          applyBeliefEffects(targetCiv, belief, existingInfection.infectionLevel);
        }
      }

      for (const sourceCiv of aliveCivs) {
        if (sourceCiv.id === targetCiv.id) continue;

        const sourceInfection = sourceCiv.beliefs.find((b) => b.beliefId === belief.id);
        if (!sourceInfection || sourceInfection.infectionLevel < 20) continue;

        const transmissionRate = calculateTransmissionRate(belief, sourceCiv, targetCiv, worldState);
        if (transmissionRate <= 0) continue;

        if (existingInfection) {
          const boost = Math.floor(transmissionRate * 15);
          existingInfection.infectionLevel = Math.min(100, existingInfection.infectionLevel + boost);

          if (boost > 3) {
            const sourceName = sourceCiv.name;
            const targetName = targetCiv.name;
            events.push({
              id: `belief-spread-${Date.now()}-${Math.random()}`,
              turn: worldState.turn,
              type: 'culture_spread',
              actorId: sourceCiv.id,
              targetId: targetCiv.id,
              description: `${belief.icon} ${belief.name}从${sourceName}扩散至${targetName}（感染度+${boost}）`,
              effects: [],
            });
          }
        } else {
          if (Math.random() < transmissionRate) {
            const initialLevel = Math.floor(transmissionRate * 30 + Math.random() * 10 + 5);
            let source: BeliefInfection['source'] = 'proximity';

            const relation = sourceCiv.relations.find((r) => r.withId === targetCiv.id);
            if (relation?.status === 'trading_partner' || relation?.tradeAgreement) {
              source = 'trade';
            } else if (relation?.status === 'at_war') {
              source = 'war';
            } else if (hasBorderContact(sourceCiv, targetCiv, worldState)) {
              source = 'proximity';
            } else {
              source = 'culture';
            }

            targetCiv.beliefs.push({
              beliefId: belief.id,
              infectionLevel: initialLevel,
              turnsInfected: 0,
              source,
            });

            events.push({
              id: `belief-infect-${Date.now()}-${Math.random()}`,
              turn: worldState.turn,
              type: 'culture_spread',
              actorId: sourceCiv.id,
              targetId: targetCiv.id,
              description: `${belief.icon} ${belief.name}感染了${targetCiv.name}！传播来源：${source === 'trade' ? '贸易' : source === 'war' ? '战争' : source === 'proximity' ? '边境接触' : '文化渗透'}`,
              effects: [],
            });
          }
        }
      }
    }
  }

  return events;
}

function applyBeliefEffects(civ: AICivilization, belief: Belief, infectionLevel: number): void {
  const scaleFactor = infectionLevel / 200;
  if (belief.effects.technology) {
    civ.stats.technology = Math.max(0, civ.stats.technology + Math.floor(belief.effects.technology * scaleFactor));
  }
  if (belief.effects.military) {
    civ.stats.military = Math.max(0, civ.stats.military + Math.floor(belief.effects.military * scaleFactor));
  }
  if (belief.effects.culture) {
    civ.stats.culture = Math.max(0, civ.stats.culture + Math.floor(belief.effects.culture * scaleFactor));
  }
  if (belief.effects.agriculture) {
    civ.stats.agriculture = Math.max(0, civ.stats.agriculture + Math.floor(belief.effects.agriculture * scaleFactor));
  }
  if (belief.effects.population) {
    civ.stats.population = Math.max(0, civ.stats.population + Math.floor(belief.effects.population * scaleFactor));
  }
}

export function getBeliefNetworkData(worldState: WorldState): {
  nodes: {
    id: string;
    name: string;
    color: string;
    beliefs: { beliefId: BeliefId; infectionLevel: number }[];
    x: number;
    y: number;
  }[];
  edges: {
    source: string;
    target: string;
    type: 'trade' | 'war' | 'alliance' | 'neutral' | 'belief_flow';
    beliefFlows: { beliefId: BeliefId; strength: number }[];
  }[];
} {
  const aliveCivs = worldState.civilizations.filter((c) => c.territory.length > 0);
  const cx = 300;
  const cy = 300;
  const radius = 200;

  const nodes = aliveCivs.map((civ, i) => {
    const angle = (2 * Math.PI * i) / aliveCivs.length - Math.PI / 2;
    return {
      id: civ.id,
      name: civ.name,
      color: civ.color,
      beliefs: civ.beliefs.map((b) => ({
        beliefId: b.beliefId,
        infectionLevel: b.infectionLevel,
      })),
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  const edges: {
    source: string;
    target: string;
    type: 'trade' | 'war' | 'alliance' | 'neutral' | 'belief_flow';
    beliefFlows: { beliefId: BeliefId; strength: number }[];
  }[] = [];

  for (const civ of aliveCivs) {
    for (const relation of civ.relations) {
      const other = aliveCivs.find((c) => c.id === relation.withId);
      if (!other) continue;

      const existing = edges.find(
        (e) =>
          (e.source === civ.id && e.target === relation.withId) ||
          (e.source === relation.withId && e.target === civ.id)
      );
      if (existing) continue;

      let type: 'trade' | 'war' | 'alliance' | 'neutral' | 'belief_flow' = 'neutral';
      if (relation.status === 'trading_partner') type = 'trade';
      else if (relation.status === 'at_war') type = 'war';
      else if (relation.status === 'allied') type = 'alliance';

      const beliefFlows: { beliefId: BeliefId; strength: number }[] = [];
      for (const sourceBelief of civ.beliefs) {
        if (sourceBelief.infectionLevel >= 20) {
          const targetBelief = other.beliefs.find((b) => b.beliefId === sourceBelief.beliefId);
          const targetLevel = targetBelief ? targetBelief.infectionLevel : 0;
          const flow = Math.max(0, sourceBelief.infectionLevel - targetLevel) / 100;
          if (flow > 0.05) {
            beliefFlows.push({ beliefId: sourceBelief.beliefId, strength: flow });
          }
        }
      }

      edges.push({ source: civ.id, target: relation.withId, type, beliefFlows });
    }
  }

  return { nodes, edges };
}

export function getDominantBeliefs(worldState: WorldState): { beliefId: BeliefId; totalInfection: number; civCount: number }[] {
  const aliveCivs = worldState.civilizations.filter((c) => c.territory.length > 0);
  const beliefStats: Record<string, { totalInfection: number; civCount: number }> = {};

  for (const belief of BELIEFS) {
    beliefStats[belief.id] = { totalInfection: 0, civCount: 0 };
  }

  for (const civ of aliveCivs) {
    for (const infection of civ.beliefs) {
      if (infection.infectionLevel >= 10) {
        beliefStats[infection.beliefId].totalInfection += infection.infectionLevel;
        beliefStats[infection.beliefId].civCount += 1;
      }
    }
  }

  return Object.entries(beliefStats)
    .map(([beliefId, stats]) => ({
      beliefId: beliefId as BeliefId,
      totalInfection: stats.totalInfection,
      civCount: stats.civCount,
    }))
    .filter((b) => b.civCount > 0)
    .sort((a, b) => b.totalInfection - a.totalInfection);
}
