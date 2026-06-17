import React, { useState, useMemo } from 'react';
import type { StatsSnapshot, CivilizationStats } from '../types';
import { STAT_LABELS, ERA_BORDER_COLORS } from '../types';
import { Users, FlaskConical, BookOpen, Sword, Wheat, TrendingUp, Info } from 'lucide-react';

const STAT_ICONS: Record<keyof CivilizationStats, React.ReactNode> = {
  population: <Users className="w-3.5 h-3.5" />,
  technology: <FlaskConical className="w-3.5 h-3.5" />,
  culture: <BookOpen className="w-3.5 h-3.5" />,
  military: <Sword className="w-3.5 h-3.5" />,
  agriculture: <Wheat className="w-3.5 h-3.5" />,
};

const STAT_COLORS: Record<keyof CivilizationStats, string> = {
  population: '#059669',
  technology: '#2563EB',
  culture: '#7C3AED',
  military: '#DC2626',
  agriculture: '#D97706',
};

const ERA_LABELS: Record<string, { name: string; color: string }> = {
  stoneAge: { name: '石器', color: '#757575' },
  agricultural: { name: '农业', color: '#558B2F' },
  imperial: { name: '帝国', color: '#4A148C' },
  scientific: { name: '科学', color: '#0D47A1' },
};

interface RiseFallChartProps {
  snapshots: StatsSnapshot[];
  height?: number;
  showArea?: boolean;
  interactive?: boolean;
}

const RiseFallChart: React.FC<RiseFallChartProps> = ({
  snapshots,
  height = 280,
  showArea = true,
  interactive = true,
}) => {
  const [activeStat, setActiveStat] = useState<keyof CivilizationStats | 'total' | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    if (snapshots.length === 0) return null;

    const allStats: (keyof CivilizationStats)[] = ['population', 'technology', 'culture', 'military', 'agriculture'];
    const padding = { top: 30, right: 20, bottom: 50, left: 40 };
    const width = 100;

    let maxValue = 0;
    for (const snap of snapshots) {
      for (const stat of allStats) {
        maxValue = Math.max(maxValue, snap.stats[stat]);
      }
      maxValue = Math.max(maxValue, snap.totalScore);
    }
    maxValue = Math.ceil(maxValue / 10) * 10 + 10;

    const xScale = (i: number) =>
      snapshots.length <= 1 ? 50 : padding.left + ((width - padding.left - padding.right) * i) / (snapshots.length - 1);
    const yScale = (v: number) => padding.top + (height - padding.top - padding.bottom) * (1 - v / maxValue);

    const generatePath = (key: keyof CivilizationStats | 'total') => {
      return snapshots
        .map((snap, i) => {
          const x = xScale(i);
          const val = key === 'total' ? snap.totalScore : snap.stats[key];
          const y = yScale(val);
          return `${i === 0 ? 'M' : 'L'}${x},${y}`;
        })
        .join(' ');
    };

    const generateAreaPath = (key: keyof CivilizationStats | 'total') => {
      const linePath = generatePath(key);
      const lastX = xScale(snapshots.length - 1);
      const firstX = xScale(0);
      const baseY = height - padding.bottom;
      return `${linePath} L${lastX},${baseY} L${firstX},${baseY} Z`;
    };

    return {
      allStats,
      padding,
      width,
      maxValue,
      xScale,
      yScale,
      generatePath,
      generateAreaPath,
    };
  }, [snapshots, height]);

  if (!chartData || snapshots.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 rounded-2xl border border-slate-200">
        <div className="text-center text-slate-500">
          <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">暂无数据可展示</p>
        </div>
      </div>
    );
  }

  const { allStats, padding, maxValue, xScale, yScale } = chartData;

  const eraRegions = useMemo(() => {
    const regions: { start: number; end: number; era: string; color: string; label: string }[] = [];
    let currentEra = snapshots[0].era;
    let startIdx = 0;

    for (let i = 1; i <= snapshots.length; i++) {
      if (i === snapshots.length || snapshots[i].era !== currentEra) {
        const eraInfo = ERA_LABELS[currentEra || 'stoneAge'] || ERA_LABELS.stoneAge;
        regions.push({
          start: startIdx,
          end: i - 1,
          era: currentEra || 'stoneAge',
          color: eraInfo.color,
          label: eraInfo.name,
        });
        if (i < snapshots.length) {
          currentEra = snapshots[i].era;
          startIdx = i;
        }
      }
    }
    return regions;
  }, [snapshots]);

  const peakSnapshot = useMemo(() => {
    return snapshots.reduce((peak, snap) => (snap.totalScore > peak.totalScore ? snap : peak), snapshots[0]);
  }, [snapshots]);

  const hoveredSnapshot = hoveredIndex !== null ? snapshots[hoveredIndex] : null;

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button
          onClick={() => setActiveStat(activeStat === 'total' ? null : 'total')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeStat === 'total'
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          综合国力
        </button>
        {allStats.map((key) => (
          <button
            key={key}
            onClick={() => setActiveStat(activeStat === key ? null : key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeStat === key
                ? 'text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            style={activeStat === key ? { backgroundColor: STAT_COLORS[key] } : {}}
          >
            {STAT_ICONS[key]}
            {STAT_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="relative bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200 overflow-hidden p-2">
        {hoveredSnapshot && (
          <div className="absolute top-2 right-2 z-20 bg-white/95 backdrop-blur rounded-xl shadow-xl border border-slate-200 p-3 min-w-[180px]">
            <div className="text-xs font-bold text-slate-800 mb-2">
              回合 {hoveredSnapshot.turn}
              {hoveredSnapshot.stageTitle && (
                <span className="block text-slate-500 font-normal mt-0.5">
                  {hoveredSnapshot.stageTitle}
                </span>
              )}
            </div>
            <div className="space-y-1">
              {allStats.map((key) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-slate-600">
                    <span style={{ color: STAT_COLORS[key] }}>{STAT_ICONS[key]}</span>
                    {STAT_LABELS[key]}
                  </span>
                  <span className="font-bold text-slate-800 tabular-nums">
                    {hoveredSnapshot.stats[key]}
                  </span>
                </div>
              ))}
              <div className="pt-1 mt-1 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  综合
                </span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {hoveredSnapshot.totalScore}
                </span>
              </div>
            </div>
          </div>
        )}

        <svg viewBox={`0 0 100 ${height}`} className="w-full" preserveAspectRatio="none">
          <defs>
            {(['total', ...allStats] as const).map((key) => (
              <linearGradient
                key={key}
                id={`grad-${key}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  stopColor={key === 'total' ? '#1E293B' : STAT_COLORS[key]}
                  stopOpacity="0.25"
                />
                <stop
                  offset="100%"
                  stopColor={key === 'total' ? '#1E293B' : STAT_COLORS[key]}
                  stopOpacity="0"
                />
              </linearGradient>
            ))}
          </defs>

          {eraRegions.map((region, idx) => {
            const x1 = xScale(region.start) - (idx === 0 ? padding.left : 0);
            const x2 =
              xScale(region.end) +
              (idx === eraRegions.length - 1 ? padding.right : 0);
            return (
              <g key={`era-${idx}`}>
                <rect
                  x={x1}
                  y={padding.top}
                  width={Math.max(x2 - x1, 0.1)}
                  height={height - padding.top - padding.bottom}
                  fill={region.color}
                  opacity="0.06"
                />
                {idx < eraRegions.length - 1 && (
                  <line
                    x1={x2}
                    y1={padding.top}
                    x2={x2}
                    y2={height - padding.bottom}
                    stroke={region.color}
                    strokeWidth="0.15"
                    strokeDasharray="1,1"
                    opacity="0.4"
                  />
                )}
                <text
                  x={(x1 + x2) / 2}
                  y={height - 6}
                  textAnchor="middle"
                  fontSize="3"
                  fill={region.color}
                  fontWeight="600"
                >
                  {region.label}时代
                </text>
              </g>
            );
          })}

          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + (height - padding.top - padding.bottom) * ratio;
            const val = Math.round(maxValue * (1 - ratio));
            return (
              <g key={`grid-${i}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={100 - padding.right}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="0.15"
                  strokeDasharray={i === 0 || i === 4 ? '' : '0.5,0.5'}
                />
                <text
                  x={padding.left - 2}
                  y={y + 1}
                  textAnchor="end"
                  fontSize="2.5"
                  fill="#94A3B8"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {allStats.map((key) => {
            if (activeStat && activeStat !== key && activeStat !== 'total') return null;
            const path = chartData.generatePath(key);
            const areaPath = chartData.generateAreaPath(key);
            return (
              <g key={`line-${key}`} opacity={activeStat && activeStat !== key ? 0.15 : 0.85}>
                {showArea && <path d={areaPath} fill={`url(#grad-${key})`} />}
                <path
                  d={path}
                  fill="none"
                  stroke={STAT_COLORS[key]}
                  strokeWidth="0.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {(activeStat === null || activeStat === 'total') && (
            <g>
              {showArea && (
                <path
                  d={chartData.generateAreaPath('total')}
                  fill="url(#grad-total)"
                />
              )}
              <path
                d={chartData.generatePath('total')}
                fill="none"
                stroke="#1E293B"
                strokeWidth="0.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}

          {interactive &&
            snapshots.map((snap, i) => (
              <g key={`point-${i}`}>
                <circle
                  cx={xScale(i)}
                  cy={yScale(snap.totalScore)}
                  r={hoveredIndex === i ? 1.2 : 0.5}
                  fill="#1E293B"
                  stroke="white"
                  strokeWidth="0.3"
                />
                <rect
                  x={xScale(i) - 2}
                  y={padding.top}
                  width={4}
                  height={height - padding.top - padding.bottom}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ cursor: 'pointer' }}
                />
              </g>
            ))}

          {peakSnapshot && (() => {
            const peakIdx = snapshots.indexOf(peakSnapshot);
            if (peakIdx === -1) return null;
            return (
              <g>
                <circle
                  cx={xScale(peakIdx)}
                  cy={yScale(peakSnapshot.totalScore)}
                  r="1.6"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="0.3"
                  opacity="0.6"
                >
                  <animate
                    attributeName="r"
                    values="1.4;2.2;1.4"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.8;0.2;0.8"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle
                  cx={xScale(peakIdx)}
                  cy={yScale(peakSnapshot.totalScore)}
                  r="0.8"
                  fill="#F59E0B"
                />
              </g>
            );
          })()}
        </svg>

        <div className="flex items-center justify-center gap-4 pt-1 pb-2 text-[10px] text-slate-500">
          <div className="flex items-center gap-1">
            <div className="w-4 h-0.5 bg-slate-800 rounded-full" />
            <span>综合国力</span>
          </div>
          {allStats.slice(0, 3).map((key) => (
            <div key={key} className="flex items-center gap-1">
              <div
                className="w-4 h-0.5 rounded-full"
                style={{ backgroundColor: STAT_COLORS[key] }}
              />
              <span>{STAT_LABELS[key]}</span>
            </div>
          ))}
          <div className="flex items-center gap-1 text-amber-600">
            <Info className="w-3 h-3" />
            <span>峰值点</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiseFallChart;
