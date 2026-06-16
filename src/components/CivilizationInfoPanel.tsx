import type { AICivilization, DiplomaticStatus, CivilizationTrait, EraStage, EraThreshold } from '../types';
import { useWorldStore } from '../store/useWorldStore';
import { getEraThresholds } from '../lib/gameEngine';
import { Users, FlaskConical, BookOpen, Sword, Wheat, Crown, Handshake, Swords, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';

interface CivilizationInfoPanelProps {
  civilization: AICivilization;
  isPlayer: boolean;
}

const TRAIT_LABELS: Record<CivilizationTrait, { label: string; icon: string; description: string }> = {
  aggressive: { label: '好战', icon: '⚔️', description: '倾向于发动战争扩张领土' },
  peaceful: { label: '和平', icon: '🕊️', description: '偏好外交和发展' },
  trader: { label: '重商', icon: '💰', description: '积极寻求贸易机会' },
  cultural: { label: '文化', icon: '🎭', description: '专注于文化发展和传播' },
  expansionist: { label: '扩张', icon: '🗺️', description: '快速扩张领土' },
  defensive: { label: '防守', icon: '🛡️', description: '注重防御和稳定性' },
};

const STATUS_LABELS: Record<DiplomaticStatus, { label: string; color: string; icon: any }> = {
  neutral: { label: '中立', color: 'text-slate-600', icon: Minus },
  allied: { label: '同盟', color: 'text-green-600', icon: Handshake },
  at_war: { label: '交战', color: 'text-red-600', icon: Swords },
  trading_partner: { label: '贸易', color: 'text-amber-600', icon: TrendingUp },
  hostile: { label: '敌对', color: 'text-orange-600', icon: TrendingDown },
};

const ERA_INFO: Record<EraStage, { name: string; color: string; bgColor: string; description: string }> = {
  stoneAge: { name: '石器时代', color: '#757575', bgColor: 'bg-gray-100', description: '文明的黎明' },
  agricultural: { name: '农业时代', color: '#558B2F', bgColor: 'bg-green-100', description: '农业革命' },
  imperial: { name: '帝国时代', color: '#4A148C', bgColor: 'bg-purple-100', description: '帝国崛起' },
  scientific: { name: '科学时代', color: '#0D47A1', bgColor: 'bg-blue-100', description: '科学革命' },
};

export function CivilizationInfoPanel({ civilization, isPlayer }: CivilizationInfoPanelProps) {
  const { worldState } = useWorldStore();
  const playerCiv = worldState?.civilizations.find((c) => c.id === worldState.playerCivilizationId);

  const relationWithPlayer = playerCiv?.relations.find((r) => r.withId === civilization.id);
  const playerRelation = civilization.relations.find((r) => r.withId === worldState?.playerCivilizationId);

  const getOpinionColor = (opinion: number) => {
    if (opinion >= 70) return 'text-green-600';
    if (opinion >= 40) return 'text-slate-600';
    return 'text-red-600';
  };

  const getOpinionLabel = (opinion: number) => {
    if (opinion >= 80) return '亲密';
    if (opinion >= 60) return '友好';
    if (opinion >= 40) return '中立';
    if (opinion >= 20) return '不满';
    return '敌对';
  };

  const eraInfo = ERA_INFO[civilization.era];
  const eraThresholds = getEraThresholds();
  const currentEraIndex = eraThresholds.findIndex(t => t.era === civilization.era);
  const nextEra = eraThresholds[currentEraIndex + 1];

  const eraProgress = nextEra
    ? {
        population: Math.min(100, Math.floor((civilization.stats.population / nextEra.minPopulation) * 100)),
        technology: Math.min(100, Math.floor((civilization.stats.technology / nextEra.minTechnology) * 100)),
        culture: Math.min(100, Math.floor((civilization.stats.culture / nextEra.minCulture) * 100)),
      }
    : { population: 100, technology: 100, culture: 100 };

  const recentActions = civilization.actionHistory.slice(-5).reverse();

  const ranking = worldState?.rankings.find(r => r.civilizationId === civilization.id);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-start gap-4 mb-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
          style={{ backgroundColor: civilization.color + '30', border: `3px solid ${civilization.color}` }}
        >
          <Crown className="w-8 h-8" style={{ color: civilization.color }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-slate-800">
              {civilization.name}
            </h3>
            {isPlayer && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                你的文明
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-slate-500">
              领土: {civilization.territory.length} 块
            </span>
            {ranking && (
              <span className="text-sm text-slate-500">
                · 排名: <span className="font-bold text-amber-600">#{ranking.rank}</span>
              </span>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            {civilization.traits.map((trait) => (
              <span
                key={trait}
                className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full flex items-center gap-1"
                title={TRAIT_LABELS[trait]?.description}
              >
                {TRAIT_LABELS[trait]?.icon} {TRAIT_LABELS[trait]?.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={`p-3 rounded-xl border mb-5 ${eraInfo.bgColor}`} style={{ borderColor: eraInfo.color + '40' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: eraInfo.color }}
            />
            <span className="font-bold text-slate-800">{eraInfo.name}</span>
          </div>
          <span className="text-xs text-slate-500">{eraInfo.description}</span>
        </div>
        {nextEra && (
          <div className="mt-2">
            <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
              <ChevronRight className="w-3 h-3" />
              下一时代: {ERA_INFO[nextEra.era]?.name}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="text-amber-600">人口</span>
                  <span className="text-slate-500">{civilization.stats.population}/{nextEra.minPopulation}</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${eraProgress.population}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="text-blue-600">科技</span>
                  <span className="text-slate-500">{civilization.stats.technology}/{nextEra.minTechnology}</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${eraProgress.technology}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="text-purple-600">文化</span>
                  <span className="text-slate-500">{civilization.stats.culture}/{nextEra.minCulture}</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${eraProgress.culture}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2 mb-5">
        <div className="bg-amber-50 rounded-xl p-2.5 text-center">
          <Users className="w-4 h-4 mx-auto text-amber-600 mb-0.5" />
          <div className="text-lg font-bold text-amber-700">{civilization.stats.population}</div>
          <div className="text-xs text-amber-600">人口</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-2.5 text-center">
          <FlaskConical className="w-4 h-4 mx-auto text-blue-600 mb-0.5" />
          <div className="text-lg font-bold text-blue-700">{civilization.stats.technology}</div>
          <div className="text-xs text-blue-600">科技</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-2.5 text-center">
          <BookOpen className="w-4 h-4 mx-auto text-purple-600 mb-0.5" />
          <div className="text-lg font-bold text-purple-700">{civilization.stats.culture}</div>
          <div className="text-xs text-purple-600">文化</div>
        </div>
        <div className="bg-red-50 rounded-xl p-2.5 text-center">
          <Sword className="w-4 h-4 mx-auto text-red-600 mb-0.5" />
          <div className="text-lg font-bold text-red-700">{civilization.stats.military}</div>
          <div className="text-xs text-red-600">军事</div>
        </div>
        <div className="bg-green-50 rounded-xl p-2.5 text-center">
          <Wheat className="w-4 h-4 mx-auto text-green-600 mb-0.5" />
          <div className="text-lg font-bold text-green-700">{civilization.stats.agriculture}</div>
          <div className="text-xs text-green-600">农业</div>
        </div>
      </div>

      {!isPlayer && playerRelation && worldState && (
        <div className="mb-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-3">外交关系</h4>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {(() => {
                const statusInfo = STATUS_LABELS[playerRelation.status];
                const Icon = statusInfo.icon;
                return (
                  <>
                    <Icon className={`w-5 h-5 ${statusInfo.color}`} />
                    <span className={`font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                  </>
                );
              })()}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">好感度:</span>
              <span className={`font-bold ${getOpinionColor(playerRelation.opinion)}`}>
                {playerRelation.opinion} ({getOpinionLabel(playerRelation.opinion)})
              </span>
            </div>
          </div>
          <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${playerRelation.opinion}%`,
                backgroundColor: playerRelation.opinion >= 50 ? '#22C55E' : '#EF4444',
              }}
            />
          </div>
        </div>
      )}

      {civilization.relations.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-800 mb-3">与其他文明关系</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {civilization.relations
              .filter((r) => {
                const other = worldState?.civilizations.find((c) => c.id === r.withId);
                return other && other.territory.length > 0;
              })
              .map((relation) => {
                const other = worldState?.civilizations.find((c) => c.id === relation.withId);
                if (!other) return null;
                const statusInfo = STATUS_LABELS[relation.status];
                const Icon = statusInfo.icon;
                return (
                  <div
                    key={relation.withId}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: other.color }}
                      />
                      <span className="text-sm font-medium text-slate-700">{other.name}</span>
                      <span
                        className="px-1 py-0.5 rounded text-white text-xs"
                        style={{ backgroundColor: ERA_INFO[other.era]?.color, fontSize: '9px' }}
                      >
                        {ERA_INFO[other.era]?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-1 text-xs ${statusInfo.color}`}>
                        <Icon className="w-3 h-3" />
                        {statusInfo.label}
                      </div>
                      <span className={`text-xs font-medium ${getOpinionColor(relation.opinion)}`}>
                        {relation.opinion}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {isPlayer && recentActions.length > 0 && (
        <div className="mt-5 pt-5 border-t border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-3">近期行动</h4>
          <div className="space-y-1">
            {recentActions.map((action, i) => (
              <div key={i} className="text-sm text-slate-600 flex items-center gap-2">
                <span className="text-slate-400">第{action.turn}回合:</span>
                <span className="font-medium text-slate-700">{action.action}</span>
                {action.targetId && (() => {
                  const target = worldState?.civilizations.find(c => c.id === action.targetId);
                  return target ? (
                    <span className="text-xs" style={{ color: target.color }}>
                      → {target.name}
                    </span>
                  ) : null;
                })()}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
