import { useEffect, useState } from 'react';
import { useWorldStore } from '../store/useWorldStore';
import { WorldMapView } from './WorldMapView';
import { CivilizationInfoPanel } from './CivilizationInfoPanel';
import { ActionPanel } from './ActionPanel';
import { TurnEventsPanel } from './TurnEventsPanel';
import { BeliefNetworkGraph } from './BeliefNetworkGraph';
import type { EraStage, CivilizationRanking, AICivilization } from '../types';
import { Globe, RotateCcw, ArrowLeft, Trophy, Crown, Medal, Swords, TrendingUp, FlaskConical, MapPin, Users, Brain, Building2 } from 'lucide-react';

const ERA_INFO: Record<EraStage, { name: string; color: string }> = {
  stoneAge: { name: '石器时代', color: '#757575' },
  agricultural: { name: '农业时代', color: '#558B2F' },
  imperial: { name: '帝国时代', color: '#4A148C' },
  scientific: { name: '科学时代', color: '#0D47A1' },
};

const RANK_STYLES: Record<number, { bg: string; text: string; icon: any }> = {
  1: { bg: 'bg-amber-100 border-amber-300', text: 'text-amber-700', icon: Crown },
  2: { bg: 'bg-slate-100 border-slate-300', text: 'text-slate-600', icon: Medal },
  3: { bg: 'bg-orange-100 border-orange-300', text: 'text-orange-700', icon: Medal },
};

interface MultiCivGameProps {
  onExit: () => void;
}

function Leaderboard({ worldState }: { worldState: ReturnType<typeof useWorldStore.getState>['worldState'] }) {
  if (!worldState) return null;

  const sortedRankings = [...worldState.rankings].sort((a, b) => a.rank - b.rank);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
        <Trophy className="w-5 h-5 text-amber-500" />
        文明排行榜
      </h3>
      <div className="space-y-2">
        {sortedRankings.map((ranking) => {
          const civ = worldState.civilizations.find((c) => c.id === ranking.civilizationId);
          if (!civ) return null;

          const style = RANK_STYLES[ranking.rank] || { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-600', icon: null };
          const RankIcon = style.icon;
          const isPlayer = civ.id === worldState.playerCivilizationId;

          return (
            <div
              key={ranking.civilizationId}
              className={`p-2.5 rounded-lg border ${style.bg} ${isPlayer ? 'ring-2 ring-blue-400' : ''}`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-lg font-black ${style.text}`}>
                  {RankIcon ? <RankIcon className="w-4 h-4" /> : `#${ranking.rank}`}
                </span>
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: civ.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className={`text-sm font-bold truncate ${isPlayer ? 'text-blue-700' : 'text-slate-800'}`}>
                      {civ.name}
                    </span>
                    <span
                      className="px-1 py-0 rounded text-white flex-shrink-0"
                      style={{ backgroundColor: ERA_INFO[civ.era]?.color, fontSize: '9px', lineHeight: '14px' }}
                    >
                      {ERA_INFO[civ.era]?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{civ.territory.length}</span>
                    <span className="flex items-center gap-0.5"><Swords className="w-3 h-3" />{civ.stats.military}</span>
                    <span className="flex items-center gap-0.5"><FlaskConical className="w-3 h-3" />{civ.stats.technology}</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-700">{ranking.totalScore}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MultiCivGame({ onExit }: MultiCivGameProps) {
  const { worldState, selectedCivilization, initMultiCivGame, resetMultiCivGame, isLoading } = useWorldStore();
  const [showBeliefNetwork, setShowBeliefNetwork] = useState(false);

  useEffect(() => {
    if (!worldState) {
      initMultiCivGame();
    }
  }, [worldState, initMultiCivGame]);

  if (!worldState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-700">正在生成世界...</h2>
          <p className="text-slate-500 mt-2">请稍候，各文明正在崛起</p>
        </div>
      </div>
    );
  }

  const playerCiv = worldState.civilizations.find((c) => c.id === worldState.playerCivilizationId);
  const isWinner = worldState.gameOver && worldState.winnerId === worldState.playerCivilizationId;
  const playerRanking = worldState.rankings.find(r => r.civilizationId === worldState.playerCivilizationId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onExit}
                className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">返回</span>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-800">多文明竞争模式</h1>
                  <p className="text-xs text-slate-500">
                    第 <span className="font-bold text-blue-600">{worldState.turn}</span> 回合 ·
                    {playerCiv && (
                      <span className="ml-1">
                        <span className="font-bold" style={{ color: playerCiv.color }}>{playerCiv.name}</span>
                        <span
                          className="ml-1 px-1 py-0 rounded text-white"
                          style={{ backgroundColor: ERA_INFO[playerCiv.era]?.color, fontSize: '9px' }}
                        >
                          {ERA_INFO[playerCiv.era]?.name}
                        </span>
                        {playerRanking && (
                          <span className="ml-1 text-amber-600">#{playerRanking.rank}</span>
                        )}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBeliefNetwork(!showBeliefNetwork)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl font-bold transition-all ${
                  showBeliefNetwork
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">信念网络</span>
              </button>
              {playerCiv && (
                <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-slate-50 rounded-xl">
                  <div className="text-center">
                    <div className="text-sm font-bold text-amber-600">{playerCiv.territory.length}</div>
                    <div className="text-xs text-slate-500">领土</div>
                  </div>
                  <div className="w-px h-6 bg-slate-200" />
                  <div className="text-center">
                    <div className="text-sm font-bold text-blue-600">{playerCiv.stats.population}</div>
                    <div className="text-xs text-slate-500">人口</div>
                  </div>
                  <div className="w-px h-6 bg-slate-200" />
                  <div className="text-center">
                    <div className="text-sm font-bold text-red-600">{playerCiv.stats.military}</div>
                    <div className="text-xs text-slate-500">军事</div>
                  </div>
                  <div className="w-px h-6 bg-slate-200" />
                  <div className="text-center">
                    <div className="text-sm font-bold text-emerald-600">
                      {worldState.civilizations.filter(c => c.territory.length > 0).length}
                    </div>
                    <div className="text-xs text-slate-500">存活</div>
                  </div>
                </div>
              )}
              <button
                onClick={resetMultiCivGame}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-white text-sm rounded-xl hover:bg-slate-700 transition-all disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">重新开始</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {worldState.gameOver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="text-7xl mb-4">{isWinner ? '🏆' : '💀'}</div>
            <h2 className={`text-3xl font-bold mb-3 ${isWinner ? 'text-amber-500' : 'text-red-500'}`}>
              {isWinner ? '恭喜！你赢了！' : '游戏结束'}
            </h2>
            <p className="text-slate-600 mb-6">
              {isWinner
                ? `经过 ${worldState.turn} 回合的发展，你的文明统一了世界！`
                : `你的文明在第 ${worldState.turn} 回合灭亡了。`}
            </p>
            {playerCiv && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 rounded-xl p-3">
                  <Crown className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                  <div className="text-xl font-bold text-slate-800">{playerCiv.territory.length}</div>
                  <div className="text-xs text-slate-500">最终领土</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <Globe className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                  <div className="text-xl font-bold text-slate-800">{worldState.turn}</div>
                  <div className="text-xs text-slate-500">存活回合</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <Trophy className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
                  <div className="text-xl font-bold text-slate-800">
                    {worldState.civilizations.length - worldState.civilizations.filter(c => c.territory.length > 0).length}
                  </div>
                  <div className="text-xs text-slate-500">击败文明</div>
                </div>
              </div>
            )}
            <div className="space-y-2 mb-4">
              <button
                onClick={() => alert('多文明模式的博物馆功能即将上线，敬请期待！')}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-700 to-yellow-800 text-white font-bold rounded-xl hover:from-amber-800 hover:to-yellow-900 transition-all"
              >
                <Building2 className="w-5 h-5" />
                进入文明博物馆
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetMultiCivGame}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all"
              >
                再来一局
              </button>
              <button
                onClick={onExit}
                className="flex-1 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-all"
              >
                退出游戏
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 space-y-4">
            <WorldMapView worldState={worldState} />
            {showBeliefNetwork && <BeliefNetworkGraph worldState={worldState} />}
            <TurnEventsPanel worldState={worldState} />
          </div>

          <div className="space-y-4">
            <Leaderboard worldState={worldState} />

            {selectedCivilization ? (
              <CivilizationInfoPanel
                civilization={selectedCivilization}
                isPlayer={selectedCivilization.id === worldState.playerCivilizationId}
              />
            ) : playerCiv ? (
              <CivilizationInfoPanel civilization={playerCiv} isPlayer={true} />
            ) : null}

            <ActionPanel worldState={worldState} />
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-slate-500 text-xs border-t border-slate-200 mt-6">
        <p>多文明竞争模式 · 回合制策略游戏</p>
        <p className="mt-0.5">贸易、战争、联盟、文化传播 — 每回合AI根据规则自动决策</p>
      </footer>
    </div>
  );
}
