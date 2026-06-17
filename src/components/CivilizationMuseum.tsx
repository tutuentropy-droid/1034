import React, { useState, useEffect, useMemo } from 'react';
import type {
  CivilizationMuseumReport,
  MajorDecision,
  CrazyEvent,
  DeathCause,
  StatsSnapshot,
  CivilizationStats,
} from '../types';
import {
  STAT_LABELS,
  GREAT_PERSON_TYPE_LABELS,
  GREAT_PERSON_TYPE_COLORS,
  GREAT_PERSON_STATUS_LABELS,
  GREAT_PERSON_ACTION_LABELS,
} from '../types';
import RiseFallChart from './RiseFallChart';
import EvolutionPlayback from './EvolutionPlayback';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Building2,
  TrendingUp,
  FileText,
  Skull,
  Brain,
  Sparkles,
  Crown,
  Trophy,
  Users,
  FlaskConical,
  BookOpen,
  Sword,
  Wheat,
  Clock,
  MapPin,
  PlayCircle,
  BarChart3,
  Scroll,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
} from 'lucide-react';

interface CivilizationMuseumProps {
  report: CivilizationMuseumReport;
  onClose: () => void;
}

type MuseumSection =
  | 'overview'
  | 'risefall'
  | 'decisions'
  | 'death'
  | 'ideology'
  | 'crazy'
  | 'playback'
  | 'people';

const SECTION_ORDER: MuseumSection[] = [
  'overview',
  'risefall',
  'decisions',
  'death',
  'ideology',
  'crazy',
  'playback',
  'people',
];

const SECTION_INFO: Record<MuseumSection, { label: string; icon: React.ReactNode; color: string }> = {
  overview: { label: '文明总览', icon: <Trophy className="w-5 h-5" />, color: 'from-amber-500 to-orange-500' },
  risefall: { label: '兴衰曲线图', icon: <BarChart3 className="w-5 h-5" />, color: 'from-blue-500 to-indigo-500' },
  decisions: { label: '重大决策', icon: <FileText className="w-5 h-5" />, color: 'from-emerald-500 to-teal-500' },
  death: { label: '死亡原因', icon: <Skull className="w-5 h-5" />, color: 'from-rose-500 to-red-500' },
  ideology: { label: '最强意识形态', icon: <Brain className="w-5 h-5" />, color: 'from-violet-500 to-purple-500' },
  crazy: { label: '最离谱事件', icon: <Sparkles className="w-5 h-5" />, color: 'from-pink-500 to-fuchsia-500' },
  playback: { label: '文明演化回放', icon: <PlayCircle className="w-5 h-5" />, color: 'from-cyan-500 to-sky-500' },
  people: { label: '伟人殿堂', icon: <Crown className="w-5 h-5" />, color: 'from-yellow-500 to-amber-500' },
};

const STAT_ICONS: Record<keyof CivilizationStats, React.ReactNode> = {
  population: <Users className="w-4 h-4" />,
  technology: <FlaskConical className="w-4 h-4" />,
  culture: <BookOpen className="w-4 h-4" />,
  military: <Sword className="w-4 h-4" />,
  agriculture: <Wheat className="w-4 h-4" />,
};

const STAT_BG: Record<keyof CivilizationStats, string> = {
  population: 'from-emerald-400 to-green-500',
  technology: 'from-blue-400 to-indigo-500',
  culture: 'from-violet-400 to-purple-500',
  military: 'from-red-400 to-rose-500',
  agriculture: 'from-amber-400 to-orange-500',
};

const ERA_NAME: Record<string, string> = {
  stoneAge: '石器时代',
  agricultural: '农业时代',
  imperial: '帝国时代',
  scientific: '科学时代',
};

const SEVERITY_STYLE: Record<DeathCause['severity'], { bg: string; border: string; text: string }> = {
  critical: {
    bg: 'from-red-50 to-rose-100',
    border: 'border-red-400',
    text: 'text-red-700',
  },
  high: {
    bg: 'from-orange-50 to-amber-100',
    border: 'border-orange-400',
    text: 'text-orange-700',
  },
  medium: {
    bg: 'from-yellow-50 to-lime-100',
    border: 'border-yellow-400',
    text: 'text-yellow-700',
  },
};

const DECISION_TYPE_LABEL: Record<MajorDecision['type'], { label: string; icon: React.ReactNode; bg: string }> = {
  stage_choice: { label: '历史选择', icon: <Scroll className="w-4 h-4" />, bg: 'bg-slate-100 text-slate-700' },
  event_choice: { label: '事件应对', icon: <AlertTriangle className="w-4 h-4" />, bg: 'bg-amber-100 text-amber-700' },
  great_person: { label: '伟人决策', icon: <Crown className="w-4 h-4" />, bg: 'bg-purple-100 text-purple-700' },
  player_action: { label: '玩家行动', icon: <Gauge className="w-4 h-4" />, bg: 'bg-blue-100 text-blue-700' },
};

const CivilizationMuseum: React.FC<CivilizationMuseumProps> = ({ report, onClose }) => {
  const [activeSection, setActiveSection] = useState<MuseumSection>('overview');
  const [isEntering, setIsEntering] = useState(true);
  const [expandedDecision, setExpandedDecision] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setIsEntering(false), 800);
    return () => clearTimeout(t);
  }, []);

  const peakSnapshot = useMemo(() => {
    return report.snapshots.reduce(
      (peak, s) => (s.totalScore > peak.totalScore ? s : peak),
      report.snapshots[0]
    );
  }, [report.snapshots]);

  const totalGrowth = useMemo(() => {
    const start = report.snapshots[0]?.totalScore || 0;
    const end = report.finalScore;
    return end - start;
  }, [report.snapshots, report.finalScore]);

  const formatEffectValue = (val: number | undefined): string => {
    if (val === undefined || val === 0) return '0';
    return val > 0 ? `+${val}` : `${val}`;
  };

  const getEffectColor = (val: number | undefined): string => {
    if (val === undefined || val === 0) return 'text-slate-500';
    return val > 0 ? 'text-emerald-600' : 'text-rose-600';
  };

  const navigateSection = (dir: -1 | 1) => {
    const idx = SECTION_ORDER.indexOf(activeSection);
    const next = SECTION_ORDER[(idx + dir + SECTION_ORDER.length) % SECTION_ORDER.length];
    setActiveSection(next);
  };

  const renderOverview = () => (
    <div className="space-y-6 animate-fade-in">
      <div
        className={`relative overflow-hidden rounded-3xl p-8 ${
          report.isVictory
            ? 'bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 border-2 border-amber-300'
            : 'bg-gradient-to-br from-slate-100 via-gray-50 to-zinc-100 border-2 border-slate-300'
        }`}
      >
        <div className="absolute top-0 right-0 opacity-10">
          <Building2 className="w-64 h-64 -mr-16 -mt-16" />
        </div>

        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                    report.isVictory
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                      : 'bg-gradient-to-br from-slate-500 to-slate-700'
                  }`}
                >
                  {report.isVictory ? (
                    <Trophy className="w-7 h-7 text-white" />
                  ) : (
                    <Scroll className="w-7 h-7 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="font-serif text-3xl font-black text-slate-800">
                    「{report.civilizationName}」
                  </h2>
                  <p className="text-slate-500 mt-0.5">
                    {report.mode === 'single' ? '经典模式' : '多文明竞争模式'} · 文明档案
                  </p>
                </div>
              </div>

              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm shadow-md ${
                  report.isVictory
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                    : 'bg-gradient-to-r from-slate-500 to-slate-700 text-white'
                }`}
              >
                {report.isVictory ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    文明延续 · 完成历史使命
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    文明历程中断
                  </>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500 mb-1">综合评分</div>
              <div className="font-serif text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 tabular-nums">
                {report.finalScore}
              </div>
              <div className={`text-sm font-semibold mt-1 ${totalGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {totalGrowth >= 0 ? '▲' : '▼'} {Math.abs(totalGrowth)} 总成长
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-white/60 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <MapPin className="w-4 h-4" />
                起始时代
              </div>
              <div className="font-bold text-xl text-slate-800">
                {ERA_NAME[report.startEra] || '未知'}
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-white/60 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <Flag className="w-4 h-4" />
                终止时代
              </div>
              <div className="font-bold text-xl text-slate-800">
                {ERA_NAME[report.endEra] || '未知'}
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-white/60 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <Clock className="w-4 h-4" />
                历史回合
              </div>
              <div className="font-bold text-xl text-slate-800 tabular-nums">
                {report.totalTurns}
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-white/60 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                峰值国力
              </div>
              <div className="font-bold text-xl text-amber-600 tabular-nums">
                {peakSnapshot.totalScore}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {(Object.keys(report.finalStats) as (keyof CivilizationStats)[]).map((key) => (
          <div
            key={key}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow p-4"
          >
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${STAT_BG[key]}`}
            />
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-2 mt-1">
              {STAT_ICONS[key]}
              {STAT_LABELS[key]}
            </div>
            <div
              className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${STAT_BG[key]} tabular-nums`}
            >
              {report.finalStats[key]}
            </div>
            {peakSnapshot.stats[key] !== report.finalStats[key] && (
              <div className="text-[10px] text-slate-400 mt-1">
                峰值 {peakSnapshot.stats[key]}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-5">
          <div className="flex items-center gap-2 text-blue-700 font-bold mb-3">
            <FileText className="w-5 h-5" />
            历史选择
          </div>
          <div className="text-3xl font-black text-blue-900 mb-1 tabular-nums">
            {report.stageHistory.length}
          </div>
          <div className="text-sm text-blue-600">次关键历史节点选择</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-200 p-5">
          <div className="flex items-center gap-2 text-purple-700 font-bold mb-3">
            <Crown className="w-5 h-5" />
            出现伟人
          </div>
          <div className="text-3xl font-black text-purple-900 mb-1 tabular-nums">
            {report.greatPeople.length}
          </div>
          <div className="text-sm text-purple-600">位影响历史的伟大人物</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5">
          <div className="flex items-center gap-2 text-amber-700 font-bold mb-3">
            <AlertTriangle className="w-5 h-5" />
            遭遇事件
          </div>
          <div className="text-3xl font-black text-amber-900 mb-1 tabular-nums">
            {report.eventHistory.length}
          </div>
          <div className="text-sm text-amber-600">起历史突发事件</div>
        </div>
      </div>
    </div>
  );

  const renderRiseFall = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">文明兴衰曲线</h3>
              <p className="text-blue-100 text-sm">综合国力与各维度属性随时间的演变</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <RiseFallChart snapshots={report.snapshots} height={320} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-300 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-bold text-amber-800">文明极盛时刻</h4>
          </div>
          <div className="text-xs text-amber-700 mb-1">
            回合 {peakSnapshot.turn} · {peakSnapshot.stageTitle || '未知阶段'}
          </div>
          <div className="text-4xl font-black text-amber-700 mb-4 tabular-nums">
            {peakSnapshot.totalScore}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {(Object.keys(peakSnapshot.stats) as (keyof CivilizationStats)[]).map((key) => (
              <div key={key} className="text-center">
                <div className="text-amber-600/70 mb-0.5">{STAT_ICONS[key]}</div>
                <div className="font-bold text-amber-900 text-sm tabular-nums">
                  {peakSnapshot.stats[key]}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl border-2 border-slate-300 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h4 className="font-bold text-slate-800">成长分析</h4>
          </div>
          <div className="space-y-3">
            {(() => {
              const first = report.snapshots[0]?.stats || report.finalStats;
              const changes: { key: keyof CivilizationStats; diff: number }[] = [];
              (Object.keys(report.finalStats) as (keyof CivilizationStats)[]).forEach((k) => {
                changes.push({ key: k, diff: report.finalStats[k] - first[k] });
              });
              changes.sort((a, b) => b.diff - a.diff);
              return changes.map((c, i) => {
                const maxDiff = Math.max(...changes.map((x) => Math.abs(x.diff)), 1);
                const width = Math.max(5, (Math.abs(c.diff) / maxDiff) * 100);
                return (
                  <div key={c.key}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="flex items-center gap-1 text-slate-600">
                        {STAT_ICONS[c.key]}
                        {STAT_LABELS[c.key]}
                      </span>
                      <span className={`font-bold tabular-nums ${c.diff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {c.diff >= 0 ? '+' : ''}
                        {c.diff}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${c.diff >= 0 ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-rose-400 to-red-500'}`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDecisions = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">影响文明的重大决策</h3>
                <p className="text-emerald-100 text-sm">按影响力排序的前 {report.majorDecisions.length} 个关键抉择</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-white tabular-nums">{report.majorDecisions.length}</div>
              <div className="text-emerald-200 text-xs">项决策</div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
          {report.majorDecisions.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>暂无重大决策记录</p>
            </div>
          ) : (
            report.majorDecisions.map((decision, idx) => {
              const typeInfo = DECISION_TYPE_LABEL[decision.type];
              const isExpanded = expandedDecision === decision.id;
              return (
                <div
                  key={decision.id}
                  className={`rounded-2xl border-2 transition-all overflow-hidden ${
                    decision.isPivotal
                      ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-white shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <button
                    onClick={() => setExpandedDecision(isExpanded ? null : decision.id)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-md ${
                          idx === 0
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                            : idx === 1
                            ? 'bg-gradient-to-br from-slate-400 to-slate-500'
                            : idx === 2
                            ? 'bg-gradient-to-br from-orange-400 to-amber-600'
                            : 'bg-gradient-to-br from-slate-300 to-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {decision.isPivotal && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 text-[10px] font-bold">
                              <Zap className="w-3 h-3" />
                              转折点
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${typeInfo.bg}`}>
                            {typeInfo.icon}
                            {typeInfo.label}
                          </span>
                          {decision.era && (
                            <span className="text-xs text-slate-500">
                              {ERA_NAME[decision.era] || decision.era}
                            </span>
                          )}
                          <span className="text-xs text-slate-400 ml-auto">
                            回合 {decision.turn}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-800 mb-1">{decision.title}</h4>
                        <p className="text-sm text-slate-600 line-clamp-1">{decision.description}</p>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-500">影响值</span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold tabular-nums ${
                                decision.impactScore >= 15
                                  ? 'bg-rose-100 text-rose-700'
                                  : decision.impactScore >= 8
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {decision.impactScore}
                            </span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 ml-14 border-t border-slate-100 mt-2 pt-3">
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                        效果影响
                      </h5>
                      <div className="grid grid-cols-5 gap-2">
                        {(Object.keys(decision.effects) as (keyof CivilizationStats)[]).map((key) => (
                          <div
                            key={key}
                            className="text-center p-2 rounded-lg bg-slate-50 border border-slate-100"
                          >
                            <div className="text-slate-400 mb-0.5 flex justify-center">
                              {STAT_ICONS[key]}
                            </div>
                            <div
                              className={`font-bold text-sm tabular-nums ${getEffectColor(
                                decision.effects[key]
                              )}`}
                            >
                              {formatEffectValue(decision.effects[key])}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  const renderDeathCause = () => {
    const dc = report.deathCause;
    return (
      <div className="space-y-6 animate-fade-in">
        {dc ? (
          <div
            className={`relative overflow-hidden rounded-3xl border-2 ${SEVERITY_STYLE[dc.severity].border} bg-gradient-to-br ${SEVERITY_STYLE[dc.severity].bg}`}
          >
            <div className="absolute top-0 right-0 opacity-10">
              <Skull className="w-48 h-48 -mr-8 -mt-8" />
            </div>
            <div className="relative p-8">
              <div className="flex items-start gap-5">
                <div className="text-7xl flex-shrink-0 animate-pulse">{dc.icon}</div>
                <div className="flex-1">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 bg-white/60 ${SEVERITY_STYLE[dc.severity].text} border ${SEVERITY_STYLE[dc.severity].border}`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {dc.severity === 'critical'
                      ? '致命打击'
                      : dc.severity === 'high'
                      ? '重大原因'
                      : '重要因素'}
                  </div>
                  <h3 className={`text-3xl font-black mb-3 ${SEVERITY_STYLE[dc.severity].text}`}>
                    {dc.cause}
                  </h3>
                  <p className="text-lg text-slate-700 leading-relaxed">{dc.description}</p>

                  {Object.keys(dc.contributingStats).length > 0 && (
                    <div className="mt-5">
                      <h4 className="text-sm font-bold text-slate-600 mb-2">关键指标</h4>
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(dc.contributingStats) as (keyof CivilizationStats)[]).map(
                          (key) => (
                            <div
                              key={key}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 backdrop-blur border border-white/80 shadow-sm"
                            >
                              <span
                                className={`w-6 h-6 rounded-lg flex items-center justify-center text-white bg-gradient-to-r ${STAT_BG[key]}`}
                              >
                                {STAT_ICONS[key]}
                              </span>
                              <div>
                                <div className="text-xs text-slate-500">{STAT_LABELS[key]}</div>
                                <div
                                  className={`font-bold tabular-nums ${SEVERITY_STYLE[dc.severity].text}`}
                                >
                                  {dc.contributingStats[key]}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl border-2 border-emerald-300 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-5 shadow-xl">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-black text-emerald-800 mb-3">文明完整传承！</h3>
            <p className="text-lg text-emerald-700">
              你的文明成功走完了整个历史历程，智慧与精神在岁月中延续。
            </p>
          </div>
        )}

        {!report.isVictory && report.snapshots.length > 3 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-slate-500" />
              衰亡过程分析
            </h4>
            <RiseFallChart
              snapshots={report.snapshots.slice(Math.max(0, report.snapshots.length - 8))}
              height={180}
              interactive={false}
            />
          </div>
        )}
      </div>
    );
  };

  const renderIdeology = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">意识形态分析</h3>
              <p className="text-violet-100 text-sm">影响文明发展的思潮与信念</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {report.dominantBeliefs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="mb-2">经典模式暂不追踪意识形态传播</p>
              <p className="text-sm">
                意识形态系统在「多文明竞争模式」中可用，通过贸易、战争、文化传播扩散
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {report.dominantBeliefs.map((belief, idx) => (
                <div
                  key={belief.beliefId}
                  className="rounded-2xl border-2 border-slate-200 p-4 bg-gradient-to-br from-white to-slate-50 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md"
                      style={{ backgroundColor: belief.color + '20' }}
                    >
                      {belief.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-lg text-slate-800">{belief.name}</h4>
                        {idx === 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                            主流思潮
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{belief.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-black tabular-nums" style={{ color: belief.color }}>
                        {belief.peakInfection}%
                      </div>
                      <div className="text-xs text-slate-500">峰值影响</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCrazyEvents = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 to-fuchsia-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">历史上的离谱时刻</h3>
                <p className="text-pink-100 text-sm">那些让你哭笑不得的瞬间</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-white tabular-nums">
                {report.crazyEvents.length}
              </div>
              <div className="text-pink-200 text-xs">个难忘时刻</div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {report.crazyEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="mb-2">这是一段平淡稳定的历史</p>
              <p className="text-sm">没有发生特别离谱的事件</p>
            </div>
          ) : (
            report.crazyEvents.map((event, idx) => (
              <div
                key={event.id}
                className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white"
              >
                <div
                  className="absolute top-0 left-0 bottom-0 w-1.5"
                  style={{
                    background: `linear-gradient(to bottom, hsl(${320 - idx * 40}, 80%, 60%), hsl(${280 - idx * 40}, 80%, 50%))`,
                  }}
                />
                <div className="p-5 pl-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-100 to-fuchsia-100 flex items-center justify-center text-3xl shadow-inner">
                      {event.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="font-black text-xl text-slate-800">{event.title}</h4>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < event.weirdness ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                            />
                          ))}
                          <span className="text-xs text-amber-600 font-bold ml-1">
                            离谱度 {event.weirdness}/10
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-600 leading-relaxed mb-2">{event.description}</p>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs">
                        <Clock className="w-3 h-3" />
                        发生于第 {event.turn} 回合
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderPlayback = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-500 to-sky-600 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <PlayCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">文明演化回放</h3>
              <p className="text-cyan-100 text-sm">重温你的文明从诞生到终结的全过程</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <EvolutionPlayback snapshots={report.snapshots} speed={1} />
        </div>
      </div>
    </div>
  );

  const renderPeople = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-yellow-500 to-amber-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">伟人殿堂</h3>
                <p className="text-yellow-100 text-sm">那些在历史长河中留下印记的名字</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-white tabular-nums">
                {report.greatPeople.length}
              </div>
              <div className="text-yellow-200 text-xs">位伟大人物</div>
            </div>
          </div>
        </div>

        <div className="p-4">
          {report.greatPeople.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Crown className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="mb-2">没有特别的伟人在这段历史中涌现</p>
              <p className="text-sm">也许，是普通人创造了历史</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {report.greatPeople.map((person) => (
                <div
                  key={person.id}
                  className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:shadow-md transition-all"
                >
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 bg-gradient-to-br ${GREAT_PERSON_TYPE_COLORS[person.type]} opacity-10`}
                  />
                  <div className="relative p-5">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${GREAT_PERSON_TYPE_COLORS[person.type]} flex items-center justify-center text-white shadow-lg`}
                      >
                        {person.type === 'thinker' && <Brain className="w-7 h-7" />}
                        {person.type === 'conqueror' && <Sword className="w-7 h-7" />}
                        {person.type === 'scientist' && <FlaskConical className="w-7 h-7" />}
                        {person.type === 'religious_leader' && <BookOpen className="w-7 h-7" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-black text-lg text-slate-800 truncate">
                            {person.name}
                          </h4>
                          <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                            person.status === 'active' ? 'bg-green-100 text-green-700' :
                            person.status === 'deceased' ? 'bg-purple-100 text-purple-700' :
                            person.status === 'assassinated' ? 'bg-red-100 text-red-700' :
                            person.status === 'exiled' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {GREAT_PERSON_STATUS_LABELS[person.status]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                            {GREAT_PERSON_TYPE_LABELS[person.type]}
                          </span>
                          <span className="text-xs text-slate-500">{person.title}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            第 {person.turnIntroduced} 回合登场
                          </span>
                          {person.actionTaken && (
                            <span className="flex items-center gap-1">
                              → 决策：{GREAT_PERSON_ACTION_LABELS[person.actionTaken]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'risefall':
        return renderRiseFall();
      case 'decisions':
        return renderDecisions();
      case 'death':
        return renderDeathCause();
      case 'ideology':
        return renderIdeology();
      case 'crazy':
        return renderCrazyEvents();
      case 'playback':
        return renderPlayback();
      case 'people':
        return renderPeople();
    }
  };

  const currentIdx = SECTION_ORDER.indexOf(activeSection);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-stretch justify-center bg-slate-900/70 backdrop-blur-sm transition-opacity duration-500 ${
        isEntering ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className={`relative w-full max-w-6xl my-6 mx-4 flex flex-col bg-gradient-to-b from-slate-50 to-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-700 ${
          isEntering ? 'scale-95 translate-y-8' : 'scale-100 translate-y-0'
        }`}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 opacity-100" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '16px 16px',
          }} />

          <div className="relative px-6 py-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center shadow-xl border-2 border-white/30">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="font-serif text-2xl font-black text-white tracking-wide">
                  文明数字博物馆
                </h1>
              </div>
              <p className="text-slate-300 text-sm">
                「{report.civilizationName}」· 文明档案 ·{' '}
                {new Date(report.generationTime).toLocaleString('zh-CN')}
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => navigateSection(-1)}
                disabled={currentIdx === 0}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10">
                <span className="text-white font-bold tabular-nums">{currentIdx + 1}</span>
                <span className="text-slate-400">/</span>
                <span className="text-slate-300 tabular-nums">{SECTION_ORDER.length}</span>
              </div>
              <button
                onClick={() => navigateSection(1)}
                disabled={currentIdx === SECTION_ORDER.length - 1}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-11 h-11 rounded-xl bg-white/10 hover:bg-red-500/80 text-white flex items-center justify-center transition-all hover:scale-105"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative px-6 pb-4">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {SECTION_ORDER.map((section) => {
                const info = SECTION_INFO[section];
                const isActive = activeSection === section;
                return (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                      isActive
                        ? `bg-gradient-to-r ${info.color} text-white shadow-lg scale-105`
                        : 'bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {info.icon}
                    <span>{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">{renderSection()}</div>

        <div className="md:hidden border-t border-slate-200 px-4 py-3 flex items-center justify-between bg-white">
          <button
            onClick={() => navigateSection(-1)}
            disabled={currentIdx === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            上一展厅
          </button>
          <span className="text-sm font-bold text-slate-500 tabular-nums">
            {currentIdx + 1} / {SECTION_ORDER.length}
          </span>
          <button
            onClick={() => navigateSection(1)}
            disabled={currentIdx === SECTION_ORDER.length - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            下一展厅
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

function Flag(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" x2="4" y1="22" y2="15" />
    </svg>
  );
}

export default CivilizationMuseum;
