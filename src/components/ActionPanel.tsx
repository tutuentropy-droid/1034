import type { AIAction, WorldState, EraStage } from '../types';
import { useWorldStore } from '../store/useWorldStore';
import { getPlayerActions, getEraThresholds } from '../lib/gameEngine';
import {
  MapPin,
  Sword,
  FlaskConical,
  BookOpen,
  Wheat,
  Handshake,
  Swords,
  Sparkles,
  Shield,
  TrendingUp,
  Lightbulb,
  Crown,
} from 'lucide-react';

interface ActionPanelProps {
  worldState: WorldState;
}

const ERA_ACTION_BONUS: Record<EraStage, Record<string, string>> = {
  stoneAge: {
    develop_agriculture: '石器时代基础发展',
    build_military: '部落战士训练',
    expand_territory: '部落迁徙',
  },
  agricultural: {
    develop_agriculture: '农业时代产量+60%',
    develop_technology: '农业技术革新',
    trade: '农业贸易兴盛',
  },
  imperial: {
    build_military: '帝国军队+30%',
    develop_culture: '帝国文化+50%',
    declare_war: '帝国征服战争',
    spread_culture: '帝国文化扩张',
  },
  scientific: {
    build_military: '现代军事+50%',
    develop_technology: '科技+80%',
    trade: '全球化贸易+3级',
    develop_culture: '科学文化+30%',
  },
};

const ACTION_LABELS: Record<string, { label: string; icon: any; description: string; color: string; category: string }> = {
  expand_territory: {
    label: '扩张领土',
    icon: MapPin,
    description: '占领相邻的无主领地',
    color: 'from-emerald-500 to-green-600',
    category: 'development',
  },
  build_military: {
    label: '建设军队',
    icon: Sword,
    description: '增强军事力量',
    color: 'from-red-500 to-red-600',
    category: 'military',
  },
  develop_technology: {
    label: '发展科技',
    icon: FlaskConical,
    description: '提升科技水平',
    color: 'from-blue-500 to-blue-600',
    category: 'development',
  },
  develop_culture: {
    label: '发展文化',
    icon: BookOpen,
    description: '增强文化影响力',
    color: 'from-purple-500 to-purple-600',
    category: 'development',
  },
  develop_agriculture: {
    label: '发展农业',
    icon: Wheat,
    description: '增加粮食和人口',
    color: 'from-amber-500 to-amber-600',
    category: 'development',
  },
  trade: {
    label: '建立贸易',
    icon: TrendingUp,
    description: '与其他文明开展贸易',
    color: 'from-yellow-500 to-amber-500',
    category: 'diplomacy',
  },
  declare_war: {
    label: '宣战',
    icon: Swords,
    description: '向相邻文明发动战争',
    color: 'from-orange-500 to-red-500',
    category: 'military',
  },
  propose_alliance: {
    label: '提议结盟',
    icon: Handshake,
    description: '与其他文明建立同盟',
    color: 'from-green-500 to-emerald-500',
    category: 'diplomacy',
  },
  spread_culture: {
    label: '文化传播',
    icon: Sparkles,
    description: '向邻国传播文化，和平转化领土',
    color: 'from-pink-500 to-purple-500',
    category: 'diplomacy',
  },
  defense: {
    label: '防御休整',
    icon: Shield,
    description: '加强防御并恢复实力',
    color: 'from-slate-500 to-slate-600',
    category: 'military',
  },
};

const ACTION_COSTS: Record<string, string> = {
  expand_territory: '消耗: 人口-3, 农业-2',
  build_military: '消耗: 农业-2, 人口-1',
  develop_technology: '消耗: 人口-1',
  develop_culture: '无消耗',
  develop_agriculture: '无消耗',
  trade: '无消耗',
  declare_war: '需要: 军事≥8',
  propose_alliance: '无消耗',
  spread_culture: '消耗: 文化-3, 需要: 文化≥10',
  defense: '无消耗',
};

const ACTION_GAINS: Record<string, string> = {
  expand_territory: '获得: 新领土',
  build_military: '获得: 军事+4',
  develop_technology: '获得: 科技+3',
  develop_culture: '获得: 文化+4',
  develop_agriculture: '获得: 农业+5, 人口+2',
  trade: '获得: 科技+1, 文化+1, 农业+1 (双方)',
  declare_war: '战斗获胜可夺取领土',
  propose_alliance: '成功则与对方结盟',
  spread_culture: '有机会和平转化邻国领土',
  defense: '获得: 军事+1, 农业+1',
};

const CATEGORY_ORDER = ['development', 'diplomacy', 'military'];
const CATEGORY_LABELS: Record<string, { label: string; icon: any }> = {
  development: { label: '发展', icon: Lightbulb },
  diplomacy: { label: '外交', icon: Handshake },
  military: { label: '军事', icon: Swords },
};

export function ActionPanel({ worldState }: ActionPanelProps) {
  const { executePlayerAction, isLoading } = useWorldStore();
  const playerCiv = worldState.civilizations.find((c) => c.id === worldState.playerCivilizationId);

  const availableActions = getPlayerActions(worldState);

  const getTargetName = (action: AIAction): string => {
    if (!action.targetId) return '';
    const target = worldState.civilizations.find((c) => c.id === action.targetId);
    return target ? ` → ${target.name}` : '';
  };

  const getTileInfo = (action: AIAction): string => {
    if (!action.tileId) return '';
    const tile = worldState.map.tiles.find((t) => t.id === action.tileId);
    return tile ? ` (${tile.x}, ${tile.y})` : '';
  };

  const groupedByCategory = availableActions.reduce((acc, action) => {
    const info = ACTION_LABELS[action.type];
    if (!info) return acc;
    const category = info.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(action);
    return acc;
  }, {} as Record<string, AIAction[]>);

  const groupedByType: Record<string, AIAction[]> = {};
  for (const [category, actions] of Object.entries(groupedByCategory)) {
    for (const action of actions) {
      const type = action.type;
      if (!groupedByType[type]) groupedByType[type] = [];
      groupedByType[type].push(action);
    }
  }

  const handleAction = (action: AIAction) => {
    if (isLoading || worldState.gameOver) return;
    executePlayerAction(action);
  };

  if (!playerCiv) return null;

  if (worldState.gameOver) {
    const isWinner = worldState.winnerId === worldState.playerCivilizationId;
    const winner = worldState.civilizations.find((c) => c.id === worldState.winnerId);

    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">{isWinner ? '🏆' : '💀'}</div>
          <h2 className={`text-3xl font-bold mb-2 ${isWinner ? 'text-amber-600' : 'text-red-600'}`}>
            {isWinner ? '恭喜！你的文明赢得了胜利！' : '你的文明已经灭亡...'}
          </h2>
          <p className="text-slate-600 mb-4">
            {isWinner
              ? `经过 ${worldState.turn} 回合的发展，你的文明成为了世界霸主！`
              : `${winner?.name} 成为了世界的主宰。`}
          </p>
          <p className="text-sm text-slate-500">
            最终领土: {playerCiv.territory.length} 块 · 第 {worldState.turn} 回合结束
          </p>
        </div>
      </div>
    );
  }

  const eraBonusInfo = ERA_ACTION_BONUS[playerCiv.era] || {};

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Crown className="w-6 h-6 text-amber-500" />
          选择本回合行动
        </h3>
        <div className="text-sm text-slate-600">
          剩余行动: <span className="font-bold text-blue-600">1</span> 次
        </div>
      </div>

      {playerCiv && (
        <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-blue-800">
              {playerCiv.era === 'stoneAge' ? '石器时代' : playerCiv.era === 'agricultural' ? '农业时代' : playerCiv.era === 'imperial' ? '帝国时代' : '科学时代'}
            </span>
            <span className="text-blue-600">加成生效中</span>
          </div>
        </div>
      )}

      <div className="space-y-5">
        {CATEGORY_ORDER.map((category) => {
          const actionsOfType = groupedByCategory[category];
          if (!actionsOfType || actionsOfType.length === 0) return null;

          const catInfo = CATEGORY_LABELS[category];
          const CatIcon = catInfo.icon;

          const typesInCategory = [...new Set(actionsOfType.map(a => a.type))];

          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <CatIcon className="w-4 h-4 text-slate-500" />
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">{catInfo.label}</h4>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <div className="grid gap-2">
                {typesInCategory.map((type) => {
                  const actionInfo = ACTION_LABELS[type];
                  if (!actionInfo) return null;
                  const Icon = actionInfo.icon;
                  const actions = groupedByType[type] || [];
                  const eraBonus = eraBonusInfo[type];

                  if (actions.length === 1 && !actions[0].targetId && !actions[0].tileId) {
                    const action = actions[0];
                    return (
                      <button
                        key={type}
                        onClick={() => handleAction(action)}
                        disabled={isLoading}
                        className={`
                          group relative overflow-hidden p-3 rounded-xl border-2 border-slate-200
                          hover:border-transparent transition-all duration-300
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${actionInfo.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                        <div className="relative flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${actionInfo.color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-slate-800 text-sm">
                              {actionInfo.label}
                              {eraBonus && (
                                <span className="ml-2 text-xs font-normal text-blue-500">⚡{eraBonus}</span>
                              )}
                            </div>
                            <div className="flex gap-3 text-xs mt-0.5">
                              <span className="text-red-600">{ACTION_COSTS[type]}</span>
                              <span className="text-green-600">{ACTION_GAINS[type]}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  }

                  return (
                    <div key={type} className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${actionInfo.color} flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        {actionInfo.label}
                        {eraBonus && (
                          <span className="text-xs font-normal text-blue-500">⚡{eraBonus}</span>
                        )}
                      </div>
                      <div className="grid gap-1.5 ml-8">
                        {actions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAction(action)}
                            disabled={isLoading}
                            className="
                              p-2.5 rounded-lg border border-slate-200 text-left
                              hover:bg-slate-50 hover:border-slate-300
                              transition-all duration-200
                              disabled:opacity-50 disabled:cursor-not-allowed
                            "
                          >
                            <div className="font-medium text-slate-800 text-sm">
                              {actionInfo.label}{getTargetName(action)}{getTileInfo(action)}
                            </div>
                            <div className="flex gap-3 mt-0.5 text-xs">
                              <span className="text-red-600">{ACTION_COSTS[type]}</span>
                              <span className="text-green-600">{ACTION_GAINS[type]}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 p-3 bg-amber-50 rounded-xl border border-amber-200">
        <p className="text-amber-800 text-xs leading-relaxed">
          💡 <strong>提示：</strong>时代越高，行动效果越强。农业时代农业+60%，帝国时代军事+30%/文化+50%，科学时代科技+80%。
          注意平衡发展，人口和农业是扩张基础，军事保护领土，科技提升实力，文化可和平转化邻国。
        </p>
      </div>
    </div>
  );
}
