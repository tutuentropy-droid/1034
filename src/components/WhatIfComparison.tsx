import React from 'react';
import { useWhatIfStore } from '../store/useWhatIfStore';
import type { WhatIfRoute, CivilizationStats } from '../types';
import {
  ArrowLeft,
  BarChart3,
  Trash2,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  GitBranch,
  Sparkles,
  Users,
  FlaskConical,
  BookOpen,
  Sword,
  Wheat,
} from 'lucide-react';

const STAT_LABELS: Record<keyof CivilizationStats, string> = {
  population: '人口',
  technology: '科技',
  culture: '文化',
  military: '军事',
  agriculture: '农业',
};

const STAT_ICONS: Record<keyof CivilizationStats, React.ReactNode> = {
  population: <Users className="w-4 h-4" />,
  technology: <FlaskConical className="w-4 h-4" />,
  culture: <BookOpen className="w-4 h-4" />,
  military: <Sword className="w-4 h-4" />,
  agriculture: <Wheat className="w-4 h-4" />,
};

const STAT_COLORS: Record<keyof CivilizationStats, string> = {
  population: 'bg-amber-500',
  technology: 'bg-blue-500',
  culture: 'bg-purple-500',
  military: 'bg-red-500',
  agriculture: 'bg-green-500',
};

const ROUTE_COLORS = [
  'from-ochre-500 to-ochre-700',
  'from-blue-500 to-indigo-700',
  'from-green-500 to-emerald-700',
  'from-purple-500 to-violet-700',
  'from-red-500 to-rose-700',
  'from-amber-500 to-orange-700',
];

function getTotalScore(stats: CivilizationStats): number {
  return Object.values(stats).reduce((sum, v) => sum + v, 0);
}

function getComparisonDirection(
  value: number,
  baselineValue: number
): 'up' | 'down' | 'same' {
  if (value > baselineValue + 3) return 'up';
  if (value < baselineValue - 3) return 'down';
  return 'same';
}

interface WhatIfComparisonProps {
  onBack: () => void;
}

const RadarChart: React.FC<{ routes: WhatIfRoute[] }> = ({ routes }) => {
  const statKeys: (keyof CivilizationStats)[] = ['population', 'technology', 'culture', 'military', 'agriculture'];
  const size = 280;
  const center = size / 2;
  const radius = 110;

  const angles = statKeys.map((_, i) => (i * 2 * Math.PI) / statKeys.length - Math.PI / 2);

  const routeColors = ['#D97706', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F59E0B'];

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {[0.2, 0.4, 0.6, 0.8, 1].map((scale) => (
          <polygon
            key={scale}
            points={angles.map((angle, i) => {
              const x = center + radius * scale * Math.cos(angle);
              const y = center + radius * scale * Math.sin(angle);
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#D2B48C"
            strokeWidth="1"
            opacity="0.4"
          />
        ))}

        {angles.map((angle, i) => {
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return (
            <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#D2B48C" strokeWidth="1" opacity="0.3" />
          );
        })}

        {routes.map((route, routeIndex) => {
          const points = statKeys.map((key, i) => {
            const value = route.result.finalStats[key] / 100;
            const x = center + radius * value * Math.cos(angles[i]);
            const y = center + radius * value * Math.sin(angles[i]);
            return `${x},${y}`;
          }).join(' ');

          return (
            <polygon
              key={route.id}
              points={points}
              fill={routeColors[routeIndex % routeColors.length]}
              fillOpacity="0.15"
              stroke={routeColors[routeIndex % routeColors.length]}
              strokeWidth="2"
            />
          );
        })}

        {statKeys.map((key, i) => {
          const x = center + (radius + 20) * Math.cos(angles[i]);
          const y = center + (radius + 20) * Math.sin(angles[i]);
          return (
            <text
              key={key}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-ochre-600 font-medium"
              style={{ fontSize: '11px' }}
            >
              {STAT_LABELS[key]}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export const WhatIfComparison: React.FC<WhatIfComparisonProps> = ({ onBack }) => {
  const { savedRoutes, deleteRoute } = useWhatIfStore();

  if (savedRoutes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-parchment-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-ochre-500" />
          </div>
          <h2 className="font-serif text-2xl text-ochre-700 mb-3">还没有保存的路线</h2>
          <p className="text-ochre-500 mb-6">回到沙盘，改变历史节点并推演出结果后，保存路线即可在这里比较</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-ochre-500 text-white font-serif font-bold rounded-xl hover:bg-ochre-600 transition-colors"
          >
            返回沙盘
          </button>
        </div>
      </div>
    );
  }

  const baseline = savedRoutes[0];

  return (
    <div className="min-h-screen">
      <header className="relative py-6 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-indigo-900/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-parchment-200 hover:bg-parchment-300 text-ochre-700 font-serif font-bold rounded-xl border-2 border-parchment-400 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                返回沙盘
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-serif text-3xl font-black text-ochre-700 tracking-tight">
                    路线比较
                  </h1>
                  <p className="text-ochre-500 text-xs font-medium">
                    {savedRoutes.length} 条历史路线并排分析
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-16">
        {savedRoutes.length >= 2 && (
          <div className="mb-8">
            <h2 className="font-serif text-xl font-bold text-ochre-700 mb-4 text-center">文明属性雷达图</h2>
            <div className="flex justify-center p-6 bg-card-gradient rounded-2xl shadow-card border-2 border-parchment-300">
              <RadarChart routes={savedRoutes} />
            </div>
            <div className="flex justify-center gap-4 mt-3">
              {savedRoutes.map((route, i) => (
                <div key={route.id} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${['bg-amber-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-orange-500'][i % 6]}`} />
                  <span className="text-xs text-ochre-600 font-medium">{route.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="font-serif text-xl font-bold text-ochre-700 mb-4 text-center">路线详情对比</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedRoutes.map((route, routeIndex) => {
              const totalScore = getTotalScore(route.result.finalStats);
              const isBestRoute = savedRoutes.every((r) => getTotalScore(r.result.finalStats) <= totalScore);

              return (
                <div
                  key={route.id}
                  className={`
                    relative bg-card-gradient rounded-2xl border-2 overflow-hidden shadow-card
                    ${isBestRoute ? 'border-gold-400 ring-2 ring-gold-400/30' : 'border-parchment-300'}
                  `}
                >
                  {isBestRoute && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-gold-400 to-gold-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      <Trophy className="w-3 h-3 inline mr-1" />
                      最高分
                    </div>
                  )}

                  <div className={`h-2 bg-gradient-to-r ${ROUTE_COLORS[routeIndex % ROUTE_COLORS.length]}`} />

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-serif text-lg font-bold text-ochre-700">{route.name}</h3>
                        <p className="text-xs text-ochre-500">{route.result.civilizationType}</p>
                      </div>
                      <button
                        onClick={() => deleteRoute(route.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-center mb-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-200">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="font-serif font-bold text-lg text-ochre-700">{totalScore}</span>
                        <span className="text-xs text-ochre-500">总分</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {(Object.entries(route.result.finalStats) as [keyof CivilizationStats, number][]).map(([key, value]) => {
                        const baselineValue = baseline.result.finalStats[key];
                        const direction = getComparisonDirection(value, baselineValue);

                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5">
                                <span className={STAT_COLORS[key]} style={{ width: 16, height: 16, borderRadius: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 8 }}>
                                  {STAT_ICONS[key]}
                                </span>
                                <span className="text-xs text-ochre-600 font-medium">{STAT_LABELS[key]}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-sm font-bold text-ochre-700">{value}</span>
                                {direction === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                                {direction === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                                {direction === 'same' && <Minus className="w-3 h-3 text-gray-400" />}
                              </div>
                            </div>
                            <div className="h-2 bg-parchment-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${STAT_COLORS[key]} rounded-full transition-all duration-700`}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 p-3 bg-parchment-100 rounded-xl">
                      <p className="text-xs text-ochre-600/80 leading-relaxed">{route.result.civilizationDescription}</p>
                    </div>

                    {route.result.keyDifferences.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-bold text-ochre-700 mb-1.5">改变节点：</p>
                        <div className="flex flex-wrap gap-1">
                          {route.result.keyDifferences.map((d, i) => (
                            <span key={i} className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-medium rounded-full">
                              {d.replace('如果', '')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between text-xs text-ochre-500">
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3" />
                        偏离度 {route.result.divergenceScore}%
                      </span>
                      <span>{new Date(route.timestamp).toLocaleString('zh-CN')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {savedRoutes.length >= 2 && (
          <div className="p-6 bg-card-gradient rounded-2xl border-2 border-parchment-300 shadow-card">
            <h2 className="font-serif text-xl font-bold text-ochre-700 mb-4 text-center">统计分析</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-parchment-300">
                    <th className="py-3 px-4 text-left font-serif text-ochre-700">路线</th>
                    <th className="py-3 px-4 text-center font-serif text-ochre-700">文明类型</th>
                    <th className="py-3 px-4 text-center font-serif text-ochre-700">总分</th>
                    {(Object.keys(STAT_LABELS) as (keyof CivilizationStats)[]).map((key) => (
                      <th key={key} className="py-3 px-4 text-center font-serif text-ochre-700">{STAT_LABELS[key]}</th>
                    ))}
                    <th className="py-3 px-4 text-center font-serif text-ochre-700">偏离度</th>
                  </tr>
                </thead>
                <tbody>
                  {savedRoutes.map((route, i) => (
                    <tr key={route.id} className="border-b border-parchment-200 hover:bg-parchment-100/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-ochre-700">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${['bg-amber-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-orange-500'][i % 6]}`} />
                          {route.name}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-ochre-600">{route.result.civilizationType}</td>
                      <td className="py-3 px-4 text-center font-bold text-ochre-700">{getTotalScore(route.result.finalStats)}</td>
                      {(Object.keys(STAT_LABELS) as (keyof CivilizationStats)[]).map((key) => {
                        const value = route.result.finalStats[key];
                        const baselineValue = baseline.result.finalStats[key];
                        const direction = getComparisonDirection(value, baselineValue);
                        return (
                          <td key={key} className="py-3 px-4 text-center">
                            <span className={`font-medium ${direction === 'up' ? 'text-green-600' : direction === 'down' ? 'text-red-600' : 'text-ochre-700'}`}>
                              {value}
                              {direction === 'up' && ' ↑'}
                              {direction === 'down' && ' ↓'}
                            </span>
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-center text-amber-600 font-medium">{route.result.divergenceScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
