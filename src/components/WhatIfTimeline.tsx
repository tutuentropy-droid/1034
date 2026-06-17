import React from 'react';
import { useWhatIfStore } from '../store/useWhatIfStore';
import {
  ArrowLeft,
  GitBranch,
  Clock,
  Sparkles,
  ChevronRight,
  Flame,
  Leaf,
  Crown,
  FlaskConical,
} from 'lucide-react';

const ERA_ICONS: Record<string, React.ReactNode> = {
  stoneAge: <Flame className="w-5 h-5" />,
  agricultural: <Leaf className="w-5 h-5" />,
  imperial: <Crown className="w-5 h-5" />,
  scientific: <FlaskConical className="w-5 h-5" />,
};

const ERA_COLORS: Record<string, { bg: string; text: string; border: string; dot: string; line: string }> = {
  stoneAge: { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-400', dot: 'bg-stoneAge', line: 'from-stone-400' },
  agricultural: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-agricultural', dot: 'bg-agricultural', line: 'from-green-500' },
  imperial: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-imperial', dot: 'bg-imperial', line: 'from-purple-500' },
  scientific: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-scientific', dot: 'bg-scientific', line: 'from-blue-500' },
};

interface WhatIfTimelineProps {
  onBack: () => void;
}

export const WhatIfTimeline: React.FC<WhatIfTimelineProps> = ({ onBack }) => {
  const { nodes, alteredNodeIds, simulationResult } = useWhatIfStore();

  const timelineEntries = nodes.map((node) => {
    const isAltered = alteredNodeIds.has(node.id);
    return { node, isAltered };
  });

  const alteredCount = alteredNodeIds.size;

  return (
    <div className="min-h-screen">
      <header className="relative py-6 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-amber-900/5 to-transparent" />
        <div className="relative max-w-5xl mx-auto">
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
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-serif text-3xl font-black text-ochre-700 tracking-tight">
                    {alteredCount > 0 ? '另类历史时间线' : '真实历史时间线'}
                  </h1>
                  <p className="text-ochre-500 text-xs font-medium">
                    {alteredCount > 0
                      ? `已改变 ${alteredCount} 个关键节点 · 偏离度 ${simulationResult?.divergenceScore || 0}%`
                      : '点击沙盘中的节点来改变历史'}
                  </p>
                </div>
              </div>
            </div>

            {simulationResult && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-200">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="font-serif font-bold text-amber-800">{simulationResult.civilizationType}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-16">
        {alteredCount > 0 && (
          <div className="mb-8 p-5 bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl border-2 border-red-200 shadow-lg">
            <div className="flex items-start gap-3">
              <GitBranch className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-serif text-lg font-bold text-red-800 mb-2">历史分叉点</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from(alteredNodeIds).map((nodeId) => {
                    const node = nodes.find((n) => n.id === nodeId);
                    if (!node) return null;
                    return (
                      <span key={nodeId} className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full border border-red-200">
                        {node.alteration.title.replace('如果', '')}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-stoneAge via-agricultural via-imperial to-scientific rounded-full opacity-30" />

          <div className="space-y-6">
            {timelineEntries.map((entry, index) => {
              const { node, isAltered } = entry;
              const colors = ERA_COLORS[node.eraColor] || ERA_COLORS.stoneAge;

              return (
                <div key={node.id} className="relative pl-20 animate-timelineReveal" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className={`absolute left-5 top-4 w-7 h-7 rounded-full border-3 border-white shadow-lg flex items-center justify-center ${colors.dot}`}>
                    {isAltered ? (
                      <GitBranch className="w-3 h-3 text-white" />
                    ) : (
                      <span className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>

                  {isAltered && (
                    <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-red-300 border-l-2 border-dashed border-red-300" />
                  )}

                  <div className={`
                    rounded-2xl border-2 overflow-hidden shadow-lg
                    transition-all duration-500
                    ${isAltered
                      ? 'border-red-300 bg-gradient-to-br from-red-50 to-amber-50 shadow-red-100'
                      : `${colors.border} ${colors.bg} shadow-sm`
                    }
                  `}>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${colors.dot} flex items-center justify-center text-white`}>
                            {ERA_ICONS[node.eraColor]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className={`font-serif text-xl font-bold ${isAltered ? 'text-red-800' : colors.text}`}>
                                {isAltered ? node.alteration.title : node.title}
                              </h3>
                              {isAltered && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">改变</span>
                              )}
                            </div>
                            <p className="text-xs text-ochre-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {node.yearLabel} · {node.era}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className={`text-sm leading-relaxed ${isAltered ? 'text-red-700/80' : 'text-ochre-600/80'}`}>
                        {isAltered ? node.alteration.description : node.description}
                      </p>

                      {isAltered && (
                        <div className="mt-4 p-4 bg-white/70 rounded-xl border border-red-200">
                          <div className="flex items-start gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-amber-700 mb-1">变化逻辑</p>
                              <p className="text-xs text-ochre-600/80 leading-relaxed">{node.alteration.logic}</p>
                            </div>
                          </div>
                          <div className="pl-6 space-y-1.5">
                            {node.alteration.consequences.map((c, i) => (
                              <div key={i} className="flex items-start gap-1.5">
                                <ChevronRight className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-ochre-600/70">{c}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!isAltered && (
                        <div className="mt-3 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-xs text-green-700">
                            <span className="font-bold">✓ 历史如实发生</span> — {node.description.slice(0, 60)}...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative pl-20 mt-8">
            <div className={`absolute left-5 top-2 w-7 h-7 rounded-full border-3 border-white shadow-lg flex items-center justify-center ${simulationResult ? 'bg-amber-500' : 'bg-parchment-300'}`}>
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <div className={`rounded-2xl border-2 p-5 ${simulationResult ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50' : 'border-parchment-300 bg-parchment-100'}`}>
              {simulationResult ? (
                <div>
                  <h3 className="font-serif text-2xl font-bold text-ochre-700 mb-2">{simulationResult.civilizationType}</h3>
                  <p className="text-ochre-600/80 text-sm leading-relaxed">{simulationResult.civilizationDescription}</p>
                  <div className="mt-3 grid grid-cols-5 gap-3">
                    {(Object.entries(simulationResult.finalStats) as [string, number][]).map(([key, value]) => {
                      const labels: Record<string, string> = { population: '人口', technology: '科技', culture: '文化', military: '军事', agriculture: '农业' };
                      return (
                        <div key={key} className="text-center">
                          <p className="text-xs text-ochre-500">{labels[key]}</p>
                          <p className="text-lg font-serif font-bold text-ochre-700">{value}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-ochre-500 text-center">回到沙盘改变历史节点，然后点击"推演"查看结果</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes timelineReveal {
          0% { opacity: 0; transform: translateX(-20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-timelineReveal {
          opacity: 0;
          animation: timelineReveal 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
