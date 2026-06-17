import React, { useState } from 'react';
import { useWhatIfStore } from '../store/useWhatIfStore';
import { WhatIfTimeline } from './WhatIfTimeline';
import { WhatIfComparison } from './WhatIfComparison';
import {
  ArrowLeft,
  Play,
  RotateCcw,
  Save,
  Clock,
  GitBranch,
  BarChart3,
  Brain,
  Wheat,
  Scroll,
  Printer,
  FlaskConical,
  Castle,
  Coins,
  Factory,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Info,
  Lock,
  Link2,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Brain: <Brain className="w-6 h-6" />,
  Wheat: <Wheat className="w-6 h-6" />,
  Scroll: <Scroll className="w-6 h-6" />,
  Printer: <Printer className="w-6 h-6" />,
  FlaskConical: <FlaskConical className="w-6 h-6" />,
  Castle: <Castle className="w-6 h-6" />,
  Coins: <Coins className="w-6 h-6" />,
  Factory: <Factory className="w-6 h-6" />,
};

const ERA_BG: Record<string, string> = {
  stoneAge: 'from-stone-600 to-stone-800',
  agricultural: 'from-green-700 to-green-900',
  imperial: 'from-purple-700 to-purple-900',
  scientific: 'from-blue-600 to-blue-800',
};

const ERA_ACCENT: Record<string, string> = {
  stoneAge: 'border-stoneAge',
  agricultural: 'border-agricultural',
  imperial: 'border-imperial',
  scientific: 'border-scientific',
};

const ERA_BADGE: Record<string, string> = {
  stoneAge: 'bg-stone-500',
  agricultural: 'bg-agricultural',
  imperial: 'bg-imperial',
  scientific: 'bg-scientific',
};

interface WhatIfSandboxProps {
  onExit: () => void;
}

const NodeCard: React.FC<{
  nodeId: string;
}> = ({ nodeId }) => {
  const { nodes, alteredNodeIds, toggleNode, selectedNodeId, setSelectedNodeId, canToggleNode, isChainedAltered } = useWhatIfStore();
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return null;

  const isAltered = alteredNodeIds.has(nodeId);
  const isSelected = selectedNodeId === nodeId;
  const { canAlter, reason } = canToggleNode(nodeId);
  const chained = isChainedAltered(nodeId);
  const isLocked = !isAltered && !canAlter;

  return (
    <div
      className={`
        relative group transition-all duration-500
        ${isAltered && !chained ? 'scale-[1.02]' : ''}
        ${isLocked ? 'opacity-60' : 'cursor-pointer'}
        ${isSelected ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-transparent' : ''}
      `}
      onClick={() => {
        if (!isLocked) {
          setSelectedNodeId(isSelected ? null : nodeId);
        }
      }}
    >
      <div
        className={`
          relative overflow-hidden rounded-2xl border-2
          transition-all duration-500
          ${isAltered
            ? chained
              ? `border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-xl shadow-amber-100/50`
              : `${ERA_ACCENT[node.eraColor]} bg-gradient-to-br from-red-50 to-orange-50 shadow-2xl shadow-red-200/50`
            : isLocked
              ? 'border-parchment-300 bg-parchment-100/50 shadow-sm'
              : `border-parchment-300 bg-card-gradient shadow-card hover:shadow-2xl`
          }
        `}
      >
        {isAltered && (
          <div className="absolute top-3 right-3 z-10">
            <div className={`flex items-center gap-1 px-3 py-1 text-white text-xs font-bold rounded-full ${chained ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`}>
              {chained ? <Link2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              {chained ? '连锁改变' : '已改变'}
            </div>
          </div>
        )}

        {isLocked && (
          <div className="absolute top-3 right-3 z-10">
            <div className="flex items-center gap-1 px-3 py-1 bg-parchment-400 text-white text-xs font-bold rounded-full">
              <Lock className="w-3 h-3" />
              未解锁
            </div>
          </div>
        )}

        <div className="relative h-36 overflow-hidden">
          <img
            src={node.imageUrl}
            alt={node.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${isLocked ? 'grayscale' : ''} ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${ERA_BG[node.eraColor]} ${isLocked ? 'opacity-30' : 'opacity-60'}`} />
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl ${isLocked ? 'bg-parchment-400' : ERA_BADGE[node.eraColor]} flex items-center justify-center text-white shadow-lg`}>
              {ICON_MAP[node.icon]}
            </div>
            <div>
              <p className="text-white/80 text-xs font-medium">{node.yearLabel}</p>
              <h3 className={`font-serif font-bold text-lg ${isLocked ? 'text-white/70' : 'text-white'}`}>{node.title}</h3>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${isLocked ? 'bg-parchment-300 text-parchment-500' : ERA_BADGE[node.eraColor]} text-white`}>
            {node.era}
          </div>
          <p className={`text-sm leading-relaxed line-clamp-2 ${isLocked ? 'text-ochre-400' : 'text-ochre-600/80'}`}>{node.subtitle}</p>

          <div className="mt-3 flex items-center justify-between">
            <span className={`text-xs font-bold ${chained ? 'text-amber-600' : isAltered ? 'text-red-600' : isLocked ? 'text-ochre-400' : 'text-green-700'}`}>
              {chained ? '🔗 多米诺效应' : isAltered ? '⚡ 已偏离历史' : isLocked ? '🔒 需解锁前置' : '✓ 遵循历史'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(nodeId);
              }}
              disabled={!canAlter}
              className={`
                px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300
                ${isAltered
                  ? chained
                    ? 'bg-amber-100 text-amber-700 cursor-not-allowed border border-amber-200'
                    : 'bg-parchment-200 text-ochre-700 hover:bg-parchment-300 border border-parchment-400'
                  : isLocked
                    ? 'bg-parchment-200 text-parchment-400 cursor-not-allowed border border-parchment-300'
                    : `bg-gradient-to-r ${ERA_BG[node.eraColor]} text-white hover:opacity-90 shadow-md`
                }
              `}
            >
              {isAltered ? (chained ? '连锁触发' : '恢复历史') : isLocked ? '🔒 未解锁' : '改变历史'}
            </button>
          </div>
        </div>
      </div>

      {isSelected && (
        <div className="mt-3 bg-white/95 backdrop-blur-sm rounded-xl border-2 border-amber-300 p-4 shadow-lg animate-slideDown">
          <div className="flex items-start gap-2 mb-3">
            <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif font-bold text-ochre-700 text-sm mb-1">
                {isAltered ? node.alteration.title : node.description.slice(0, 40) + '...'}
              </h4>
              <p className="text-ochre-600/80 text-xs leading-relaxed">
                {isAltered ? node.alteration.description : node.description}
              </p>
            </div>
          </div>

          {chained && (
            <div className="mb-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-700 font-medium flex items-center gap-1">
                <Link2 className="w-3 h-3" />
                {reason}
              </p>
            </div>
          )}

          {isLocked && (
            <div className="mb-3 p-2 bg-parchment-100 rounded-lg border border-parchment-300">
              <p className="text-xs text-ochre-500 font-medium flex items-center gap-1">
                <Lock className="w-3 h-3" />
                {reason}
              </p>
            </div>
          )}

          {isAltered && !chained && (
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-700">变化逻辑</p>
                  <p className="text-xs text-ochre-600/80 leading-relaxed">{node.alteration.logic}</p>
                </div>
              </div>
              <div className="pl-6 space-y-1">
                {node.alteration.consequences.slice(0, 3).map((c, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <ChevronRight className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-ochre-600/70">{c}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SimulationResultPanel: React.FC = () => {
  const { simulationResult, isSimulating, savedRoutes, saveCurrentRoute } = useWhatIfStore();

  if (isSimulating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-parchment-300 border-t-amber-500 rounded-full animate-spin" />
          <GitBranch className="w-8 h-8 text-amber-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h3 className="font-serif text-2xl text-ochre-700 mt-6">推演中...</h3>
        <p className="text-ochre-500 mt-2">多米诺骨牌正在倒下，历史正在分叉...</p>
      </div>
    );
  }

  if (!simulationResult) return null;

  const { finalStats, civilizationType, civilizationDescription, divergenceScore, keyDifferences } = simulationResult;

  return (
    <div className="animate-fadeInUp">
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-300 p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl shadow-lg mb-3">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-serif text-3xl font-bold text-ochre-700">{civilizationType}</h3>
          <p className="text-ochre-600/80 mt-2 max-w-2xl mx-auto leading-relaxed">{civilizationDescription}</p>
        </div>

        <div className="grid grid-cols-5 gap-3 mb-6">
          {(Object.entries(finalStats) as [string, number][]).map(([key, value]) => {
            const labels: Record<string, string> = {
              population: '人口',
              technology: '科技',
              culture: '文化',
              military: '军事',
              agriculture: '农业',
            };
            const colors: Record<string, string> = {
              population: 'bg-amber-500',
              technology: 'bg-blue-500',
              culture: 'bg-purple-500',
              military: 'bg-red-500',
              agriculture: 'bg-green-500',
            };
            return (
              <div key={key} className="text-center">
                <div className="relative h-2 bg-parchment-200 rounded-full mb-2 overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full ${colors[key]} rounded-full transition-all duration-1000`}
                    style={{ width: `${value}%` }}
                  />
                </div>
                <p className="text-xs text-ochre-600 font-medium">{labels[key]}</p>
                <p className="text-lg font-serif font-bold text-ochre-700">{value}</p>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between bg-white/60 rounded-xl p-4 mb-4">
          <div>
            <p className="text-sm text-ochre-600 font-medium">历史偏离度</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-32 h-3 bg-parchment-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-red-500 rounded-full transition-all duration-1000"
                  style={{ width: `${divergenceScore}%` }}
                />
              </div>
              <span className="text-sm font-bold text-ochre-700">{divergenceScore}%</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-ochre-600 font-medium">改变的关键节点</p>
            <p className="text-lg font-serif font-bold text-ochre-700">{keyDifferences.length} 个</p>
          </div>
        </div>

        {keyDifferences.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-bold text-ochre-700 mb-2">关键分歧点：</p>
            <div className="flex flex-wrap gap-2">
              {keyDifferences.map((d, i) => (
                <span key={i} className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full border border-red-200">
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={saveCurrentRoute}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl hover:from-amber-600 hover:to-amber-700 shadow-md transition-all duration-300"
          >
            <Save className="w-4 h-4" />
            保存此路线
          </button>
          {savedRoutes.length >= 2 && (
            <button
              onClick={() => useWhatIfStore.getState().setCurrentView('comparison')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-md transition-all duration-300"
            >
              <BarChart3 className="w-4 h-4" />
              比较路线 ({savedRoutes.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const WhatIfSandbox: React.FC<WhatIfSandboxProps> = ({ onExit }) => {
  const { nodesSorted, alteredNodeIds, manualAlteredIds, simulate, resetAll, currentView, setCurrentView, isSimulating, simulationResult, savedRoutes } = useWhatIfStore();
  const [filterEra, setFilterEra] = useState<string>('all');

  const alteredCount = alteredNodeIds.size;
  const manualCount = manualAlteredIds.size;
  const chainedCount = alteredCount - manualCount;
  const eras = ['all', '认知革命', '农业革命', '帝国时代', '科学革命'];
  const filteredNodes = filterEra === 'all' ? nodesSorted : nodesSorted.filter((n) => n.era === filterEra);

  if (currentView === 'timeline') {
    return <WhatIfTimeline onBack={() => setCurrentView('sandbox')} />;
  }

  if (currentView === 'comparison') {
    return <WhatIfComparison onBack={() => setCurrentView('sandbox')} />;
  }

  return (
    <div className="min-h-screen">
      <header className="relative py-6 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 via-amber-900/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onExit}
                className="flex items-center gap-2 px-4 py-2 bg-parchment-200 hover:bg-parchment-300 text-ochre-700 font-serif font-bold rounded-xl border-2 border-parchment-400 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                返回
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-lg">
                  <GitBranch className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-serif text-3xl font-black text-ochre-700 tracking-tight">
                    如果历史重来
                  </h1>
                  <p className="text-ochre-500 text-xs font-medium flex items-center gap-2">
                    <span className="w-6 h-px bg-ochre-400" />
                    历史沙盘推演实验室
                    <span className="w-6 h-px bg-ochre-400" />
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {savedRoutes.length > 0 && (
                <button
                  onClick={() => setCurrentView('comparison')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-serif font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <BarChart3 className="w-4 h-4" />
                  路线比较 ({savedRoutes.length})
                </button>
              )}
              <button
                onClick={() => setCurrentView('timeline')}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-serif font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Clock className="w-4 h-4" />
                时间线
              </button>
              <button
                onClick={resetAll}
                disabled={alteredCount === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-parchment-200 hover:bg-parchment-300 text-ochre-700 font-serif font-bold rounded-xl border-2 border-parchment-400 transition-all duration-300 disabled:opacity-40"
              >
                <RotateCcw className="w-4 h-4" />
                重置
              </button>
            </div>
          </div>

          <div className="mt-4 p-4 bg-amber-50/60 rounded-xl border border-amber-200 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800/90 text-sm leading-relaxed font-sans">
                <strong>沙盘模式：</strong>点击关键历史节点，改变历史走向！每推翻一块多米诺骨牌，
                整条时间线都会连锁反应。改变完后点击"推演"按钮，看看你的另类文明会变成什么样。
                你还可以保存不同路线，在比较页面并排分析。
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {eras.map((era) => (
              <button
                key={era}
                onClick={() => setFilterEra(era)}
                className={`
                  px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300
                  ${filterEra === era
                    ? 'bg-ochre-500 text-white shadow-md'
                    : 'bg-parchment-200 text-ochre-600 hover:bg-parchment-300'
                  }
                `}
              >
                {era === 'all' ? '全部时代' : era}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-ochre-600">
                共改变 <strong className="text-red-600">{alteredCount}</strong> / {nodesSorted.length} 个节点
              </span>
              {chainedCount > 0 && (
                <span className="flex items-center gap-1 text-amber-600">
                  <Link2 className="w-3 h-3" />
                  其中 {chainedCount} 个为连锁效应
                </span>
              )}
            </div>
            <button
              onClick={simulate}
              disabled={isSimulating}
              className={`
                flex items-center gap-2 px-6 py-3 font-serif font-bold text-lg rounded-xl
                shadow-button transition-all duration-300
                ${alteredCount > 0
                  ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white hover:from-red-600 hover:to-amber-600 hover:-translate-y-0.5 hover:shadow-button-hover'
                  : 'bg-gradient-to-r from-ochre-400 to-ochre-500 text-white hover:from-ochre-500 hover:to-ochre-600'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <Play className="w-5 h-5" />
              推演历史
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {filteredNodes.map((node) => (
            <NodeCard key={node.id} nodeId={node.id} />
          ))}
        </div>

        {(simulationResult || isSimulating) && <SimulationResultPanel />}
      </main>

      <style>{`
        @keyframes slideDown {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
