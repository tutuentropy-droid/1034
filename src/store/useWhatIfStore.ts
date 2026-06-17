import { create } from 'zustand';
import type {
  WhatIfNode,
  WhatIfTimelineEntry,
  WhatIfSimulationResult,
  WhatIfRoute,
  CivilizationStats,
} from '../types';
import { whatIfNodes } from '../data/whatIfNodes';

const BASE_STATS: CivilizationStats = {
  population: 50,
  technology: 50,
  culture: 50,
  military: 50,
  agriculture: 50,
};

const ERA_ORDER = ['认知革命', '农业革命', '帝国时代', '科学革命'];

interface WhatIfStore {
  nodes: WhatIfNode[];
  alteredNodeIds: Set<string>;
  simulationResult: WhatIfSimulationResult | null;
  savedRoutes: WhatIfRoute[];
  currentView: 'sandbox' | 'timeline' | 'comparison';
  isSimulating: boolean;
  selectedNodeId: string | null;

  toggleNode: (nodeId: string) => void;
  resetAll: () => void;
  simulate: () => void;
  saveCurrentRoute: () => void;
  deleteRoute: (routeId: string) => void;
  setCurrentView: (view: 'sandbox' | 'timeline' | 'comparison') => void;
  setSelectedNodeId: (nodeId: string | null) => void;
}

function calculateStats(alteredNodeIds: Set<string>): CivilizationStats {
  const stats = { ...BASE_STATS };

  for (const node of whatIfNodes) {
    const isAltered = alteredNodeIds.has(node.id);
    const effects = isAltered ? node.effects.off : node.effects.on;

    for (const [key, value] of Object.entries(effects)) {
      const k = key as keyof CivilizationStats;
      stats[k] = Math.max(0, Math.min(100, (stats[k] || 0) + (value || 0)));
    }
  }

  return stats;
}

function generateTimeline(alteredNodeIds: Set<string>): WhatIfTimelineEntry[] {
  const timeline: WhatIfTimelineEntry[] = [];

  for (const node of whatIfNodes) {
    const isAltered = alteredNodeIds.has(node.id);
    const effects = isAltered ? node.effects.off : node.effects.on;

    timeline.push({
      nodeId: node.id,
      altered: isAltered,
      era: node.era,
      yearLabel: node.yearLabel,
      title: isAltered ? node.alteration.title : node.title,
      alteredTitle: node.alteration.title,
      description: isAltered ? node.alteration.description : node.description,
      alteredDescription: node.alteration.description,
      logic: node.alteration.logic,
      effects,
    });
  }

  return timeline;
}

function getCivilizationType(stats: CivilizationStats): { type: string; description: string } {
  if (Object.values(stats).every((v) => v < 10)) {
    return {
      type: '原始部落',
      description: '文明几乎没有起步。人类仍以小规模群体在自然中艰难求生，与石器时代无异。',
    };
  }

  const totalScore = Object.values(stats).reduce((sum: number, v) => sum + v, 0);
  if (totalScore < 80) {
    return {
      type: '散落部落联盟',
      description: '人类形成了松散的部落联盟，偶尔合作但始终无法建立持久的大型组织。文明如萤火般明灭不定。',
    };
  }
  if (totalScore < 150) {
    return {
      type: '早期农耕文明',
      description: '人类已学会种植和畜牧，小规模的城镇开始出现。但科技发展缓慢，社会结构简单。',
    };
  }
  if (totalScore < 220) {
    return {
      type: '封建王国',
      description: '王国和城邦遍布大陆。文字和法律开始规范社会，但权力分散，技术进步有限。',
    };
  }
  if (totalScore < 300) {
    return {
      type: '古典帝国',
      description: '强大的帝国统一了广袤领土。法律、货币和贸易网络将不同民族联系在一起，文化艺术繁荣发展。',
    };
  }
  if (totalScore < 380) {
    return {
      type: '近代文明',
      description: '印刷术传播知识，科学方法揭示真理。工业的力量正在改变世界的面貌，全球化初见端倪。',
    };
  }

  const maxStat = Object.entries(stats).reduce(
    (max, [key, value]) => (value > max.value ? { key, value } : max),
    { key: 'technology', value: 0 }
  );

  const advancedTypes: Record<string, { type: string; description: string }> = {
    technology: {
      type: '科技霸权文明',
      description: '科技是文明的核心驱动力。人工智能、量子计算、基因编辑——技术深刻重塑了人类的存在方式。但在追求效率的同时，人文关怀是否被遗忘？',
    },
    population: {
      type: '人口巨兽文明',
      description: '庞大的人口是文明的基石。数十亿人的劳动力推动着经济巨轮，但资源消耗和环境压力也达到了前所未有的水平。',
    },
    culture: {
      type: '文化灯塔文明',
      description: '文化艺术是文明最高贵的追求。哲学、文学、音乐、绘画——精神世界的丰富远超物质。但软实力能否抵御硬威胁？',
    },
    military: {
      type: '军事强权文明',
      description: '军事力量是文明生存的保障。强大的国防和全球投射能力确保了安全和秩序，但军费的重负是否拖累了其他领域？',
    },
    agriculture: {
      type: '生态文明',
      description: '与自然和谐共生是文明的最高智慧。可持续发展、有机农业、循环经济——这种文明选择了质量和平衡，而非盲目增长。',
    },
  };

  return advancedTypes[maxStat.key] || advancedTypes.technology;
}

function getKeyDifferences(alteredNodeIds: Set<string>): string[] {
  const differences: string[] = [];

  for (const nodeId of alteredNodeIds) {
    const node = whatIfNodes.find((n) => n.id === nodeId);
    if (node) {
      differences.push(node.alteration.title);
    }
  }

  return differences;
}

function calculateDivergenceScore(alteredNodeIds: Set<string>): number {
  return Math.min(100, alteredNodeIds.size * 15 + alteredNodeIds.size * alteredNodeIds.size * 3);
}

export const useWhatIfStore = create<WhatIfStore>((set, get) => ({
  nodes: whatIfNodes,
  alteredNodeIds: new Set<string>(),
  simulationResult: null,
  savedRoutes: [],
  currentView: 'sandbox',
  isSimulating: false,
  selectedNodeId: null,

  toggleNode: (nodeId: string) => {
    const { alteredNodeIds, nodes } = get();
    const newAltered = new Set(alteredNodeIds);
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    if (newAltered.has(nodeId)) {
      newAltered.delete(nodeId);
    } else {
      newAltered.add(nodeId);
      for (const conflictId of node.conflicts) {
        if (newAltered.has(conflictId)) {
          newAltered.delete(conflictId);
        }
      }
    }

    set({ alteredNodeIds: newAltered, simulationResult: null });
  },

  resetAll: () => {
    set({
      alteredNodeIds: new Set(),
      simulationResult: null,
      selectedNodeId: null,
    });
  },

  simulate: () => {
    const { alteredNodeIds } = get();
    set({ isSimulating: true });

    setTimeout(() => {
      const stats = calculateStats(alteredNodeIds);
      const timeline = generateTimeline(alteredNodeIds);
      const civType = getCivilizationType(stats);
      const keyDifferences = getKeyDifferences(alteredNodeIds);
      const divergenceScore = calculateDivergenceScore(alteredNodeIds);

      const result: WhatIfSimulationResult = {
        timeline,
        finalStats: stats,
        civilizationType: civType.type,
        civilizationDescription: civType.description,
        divergenceScore,
        keyDifferences,
      };

      set({ simulationResult: result, isSimulating: false });
    }, 1200);
  },

  saveCurrentRoute: () => {
    const { simulationResult, alteredNodeIds, savedRoutes } = get();
    if (!simulationResult) return;

    const alteredNodes = whatIfNodes.filter((n) => alteredNodeIds.has(n.id));
    const name = alteredNodes.length === 0
      ? '真实历史'
      : alteredNodes.map((n) => n.alteration.title.replace('如果', '')).join(' + ');

    const newRoute: WhatIfRoute = {
      id: `route-${Date.now()}`,
      name,
      timestamp: Date.now(),
      alteredNodes: Array.from(alteredNodeIds),
      result: simulationResult,
    };

    set({ savedRoutes: [...savedRoutes, newRoute] });
  },

  deleteRoute: (routeId: string) => {
    const { savedRoutes } = get();
    set({ savedRoutes: savedRoutes.filter((r) => r.id !== routeId) });
  },

  setCurrentView: (view) => {
    set({ currentView: view });
  },

  setSelectedNodeId: (nodeId) => {
    set({ selectedNodeId: nodeId });
  },
}));
