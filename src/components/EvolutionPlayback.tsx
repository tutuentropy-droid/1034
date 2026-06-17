import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { StatsSnapshot, CivilizationStats } from '../types';
import { STAT_LABELS } from '../types';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  FastForward,
  Clock,
  Users,
  FlaskConical,
  BookOpen,
  Sword,
  Wheat,
  TrendingUp,
  Layers,
} from 'lucide-react';

const STAT_ICONS: Record<keyof CivilizationStats, React.ReactNode> = {
  population: <Users className="w-4 h-4" />,
  technology: <FlaskConical className="w-4 h-4" />,
  culture: <BookOpen className="w-4 h-4" />,
  military: <Sword className="w-4 h-4" />,
  agriculture: <Wheat className="w-4 h-4" />,
};

const STAT_COLORS: Record<keyof CivilizationStats, string> = {
  population: 'from-emerald-500 to-green-600',
  technology: 'from-blue-500 to-indigo-600',
  culture: 'from-violet-500 to-purple-600',
  military: 'from-red-500 to-rose-600',
  agriculture: 'from-amber-500 to-orange-600',
};

const ERA_BG: Record<string, { bg: string; border: string; text: string }> = {
  stoneAge: {
    bg: 'from-gray-100 to-stone-200',
    border: 'border-gray-400',
    text: 'text-gray-700',
  },
  agricultural: {
    bg: 'from-green-50 to-lime-100',
    border: 'border-green-500',
    text: 'text-green-700',
  },
  imperial: {
    bg: 'from-purple-50 to-violet-100',
    border: 'border-purple-500',
    text: 'text-purple-700',
  },
  scientific: {
    bg: 'from-blue-50 to-cyan-100',
    border: 'border-blue-500',
    text: 'text-blue-700',
  },
};

const ERA_LABELS: Record<string, string> = {
  stoneAge: '石器时代',
  agricultural: '农业时代',
  imperial: '帝国时代',
  scientific: '科学时代',
};

interface EvolutionPlaybackProps {
  snapshots: StatsSnapshot[];
  autoPlay?: boolean;
  speed?: number;
}

const EvolutionPlayback: React.FC<EvolutionPlaybackProps> = ({
  snapshots,
  autoPlay = false,
  speed = 1,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [playbackSpeed, setPlaybackSpeed] = useState(speed);
  const intervalRef = useRef<number | null>(null);

  const allStats: (keyof CivilizationStats)[] = [
    'population',
    'technology',
    'culture',
    'military',
    'agriculture',
  ];

  const stopPlayback = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const startPlayback = useCallback(() => {
    if (snapshots.length < 2) return;
    setIsPlaying(true);
  }, [snapshots.length]);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  }, [isPlaying, stopPlayback, startPlayback]);

  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= snapshots.length - 1) {
          stopPlayback();
          return prev;
        }
        return prev + 1;
      });
    }, 1200 / playbackSpeed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, playbackSpeed, snapshots.length, stopPlayback]);

  const goToStart = () => {
    setCurrentIndex(0);
    stopPlayback();
  };

  const goToEnd = () => {
    setCurrentIndex(snapshots.length - 1);
    stopPlayback();
  };

  const stepBack = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    stopPlayback();
  };

  const stepForward = () => {
    setCurrentIndex((prev) => Math.min(snapshots.length - 1, prev + 1));
    stopPlayback();
  };

  const cycleSpeed = () => {
    setPlaybackSpeed((prev) => {
      if (prev === 1) return 2;
      if (prev === 2) return 4;
      if (prev === 4) return 0.5;
      return 1;
    });
  };

  if (snapshots.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-slate-50 rounded-2xl border border-slate-200">
        <p className="text-slate-500 text-sm">无回放数据</p>
      </div>
    );
  }

  const currentSnapshot = snapshots[currentIndex];
  const maxSnapshot = snapshots[snapshots.length - 1];
  const era = currentSnapshot.era || 'stoneAge';
  const eraStyle = ERA_BG[era] || ERA_BG.stoneAge;

  const progressPercent =
    snapshots.length <= 1 ? 100 : (currentIndex / (snapshots.length - 1)) * 100;

  return (
    <div className="w-full">
      <div
        className={`relative overflow-hidden rounded-2xl border-2 ${eraStyle.border} bg-gradient-to-br ${eraStyle.bg} p-5 mb-4 transition-all duration-700`}
      >
        <div className="absolute top-0 right-0 opacity-5">
          <Layers className="w-40 h-40 -mr-8 -mt-8" />
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1.5 rounded-lg bg-white/80 backdrop-blur border border-white/60 ${eraStyle.text} font-bold text-sm shadow-sm`}
              >
                {ERA_LABELS[era] || '未知时代'}
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
                <Clock className="w-4 h-4" />
                <span>
                  回合 <span className="font-bold text-slate-900">{currentSnapshot.turn}</span> /{' '}
                  {maxSnapshot.turn}
                </span>
              </div>
            </div>
            {currentSnapshot.stageTitle && (
              <div className="text-right max-w-[50%]">
                <p className="text-xs text-slate-500">当前阶段</p>
                <p className={`text-sm font-bold ${eraStyle.text} truncate`}>
                  {currentSnapshot.stageTitle}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
            {allStats.map((key) => {
              const currentVal = currentSnapshot.stats[key];
              const maxVal = Math.max(...snapshots.map((s) => s.stats[key]), 1);
              const percent = Math.min(100, (currentVal / maxVal) * 100);

              return (
                <div key={key} className="relative">
                  <div className="bg-white/70 backdrop-blur rounded-xl p-3 border border-white/80 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className={`text-slate-500`}>{STAT_ICONS[key]}</span>
                      <span className="text-xs font-medium text-slate-600">
                        {STAT_LABELS[key]}
                      </span>
                    </div>
                    <div
                      className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${STAT_COLORS[key]} mb-2 tabular-nums`}
                      style={{
                        opacity: 0.6 + (percent / 100) * 0.4,
                        transform: `scale(${0.9 + (percent / 100) * 0.1})`,
                        transformOrigin: 'left center',
                        transition: 'all 0.5s ease-out',
                      }}
                    >
                      {currentVal}
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${STAT_COLORS[key]} transition-all duration-500 ease-out`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <span className="text-sm text-slate-300">综合国力</span>
              </div>
              <div className="text-right">
                <span
                  className="text-3xl font-black tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500"
                  style={{
                    transform: `scale(${0.9 + (currentSnapshot.totalScore / Math.max(...snapshots.map(s => s.totalScore), 1)) * 0.1})`,
                    display: 'inline-block',
                    transition: 'transform 0.5s ease-out',
                  }}
                >
                  {currentSnapshot.totalScore}
                </span>
                <span className="block text-xs text-slate-400">
                  峰值 {Math.max(...snapshots.map((s) => s.totalScore))}
                </span>
              </div>
            </div>
            <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 transition-all duration-500 ease-out relative"
                style={{
                  width: `${(currentSnapshot.totalScore / Math.max(...snapshots.map((s) => s.totalScore), 1)) * 100}%`,
                }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="mb-4">
          <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
            {snapshots.map((snap, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  stopPlayback();
                }}
                className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 z-10 ${
                  idx === currentIndex
                    ? 'bg-slate-900 border-slate-900 scale-150 shadow-lg'
                    : 'bg-white border-slate-300 hover:border-slate-500 hover:scale-125'
                }`}
                style={{ left: `${snapshots.length <= 1 ? 50 : (idx / (snapshots.length - 1)) * 100}%`, marginLeft: '-7px' }}
                title={`回合 ${snap.turn}: ${snap.stageTitle || '未知'}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <button
            onClick={goToStart}
            disabled={currentIndex === 0}
            className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="回到开始"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={stepBack}
            disabled={currentIndex === 0}
            className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="后退一步"
          >
            <Play className="w-5 h-5 rotate-180" />
          </button>

          <button
            onClick={togglePlayback}
            className={`p-4 rounded-2xl transition-all shadow-lg ${
              isPlaying
                ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white hover:shadow-rose-300/50 hover:scale-105'
                : 'bg-gradient-to-br from-slate-800 to-slate-900 text-white hover:shadow-slate-300/50 hover:scale-105'
            }`}
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>

          <button
            onClick={stepForward}
            disabled={currentIndex === snapshots.length - 1}
            className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="前进一步"
          >
            <Play className="w-5 h-5" />
          </button>

          <button
            onClick={goToEnd}
            disabled={currentIndex === snapshots.length - 1}
            className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="跳到结束"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          <div className="w-px h-8 bg-slate-200 mx-2" />

          <button
            onClick={cycleSpeed}
            className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1.5 min-w-[72px] justify-center"
            title="调整播放速度"
          >
            <FastForward className="w-4 h-4" />
            <span className="text-sm font-bold tabular-nums">{playbackSpeed}x</span>
          </button>
        </div>

        <div className="mt-3 text-center text-xs text-slate-500">
          共 {snapshots.length} 个历史节点 · 拖动进度点或点击可跳转
        </div>
      </div>
    </div>
  );
};

export default EvolutionPlayback;
