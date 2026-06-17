import React, { useState } from 'react';
import { useCivilizationStore } from '../store/useCivilizationStore';
import {
  MYTH_TYPE_LABELS,
  LAW_CATEGORY_LABELS,
  LAW_SEVERITY_LABELS,
  LEGAL_TYPE_LABELS,
  CURRENCY_TYPE_LABELS,
  SLOGAN_THEME_LABELS,
  FLAG_PATTERN_LABELS,
} from '../lib/storyGenerator';
import { STAT_LABELS, type CivilizationStats } from '../types';
import {
  X,
  Flag,
  Scroll,
  Coins,
  BookOpen,
  Sparkles,
  Users,
  FlaskConical,
  Sword,
  Wheat,
  TrendingUp,
  RefreshCw,
  Gavel,
  HeartHandshake,
  Building2,
} from 'lucide-react';

const STAT_ICONS = {
  population: Users,
  technology: FlaskConical,
  culture: BookOpen,
  military: Sword,
  agriculture: Wheat,
};

const STAT_COLORS: Record<keyof CivilizationStats, string> = {
  population: 'text-ochre-600',
  technology: 'text-scientific',
  culture: 'text-imperial',
  military: 'text-red-700',
  agriculture: 'text-agricultural',
};

const LAW_SEVERITY_COLORS: Record<string, string> = {
  mild: 'bg-green-100 text-green-700 border-green-300',
  moderate: 'bg-amber-100 text-amber-700 border-amber-300',
  severe: 'bg-red-100 text-red-700 border-red-300',
};

const LAW_CATEGORY_COLORS: Record<string, string> = {
  criminal: 'border-l-red-500',
  civil: 'border-l-blue-500',
  religious: 'border-l-purple-500',
  economic: 'border-l-amber-500',
  military: 'border-l-orange-500',
};

const SLOGAN_THEME_COLORS: Record<string, string> = {
  unity: 'from-blue-500 to-indigo-600',
  glory: 'from-red-500 to-amber-600',
  wisdom: 'from-purple-500 to-indigo-600',
  prosperity: 'from-amber-500 to-green-600',
  eternity: 'from-slate-600 to-slate-800',
  harmony: 'from-teal-500 to-green-600',
};

type TabType = 'overview' | 'myth' | 'law' | 'currency' | 'flag';

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-3 rounded-xl font-serif font-bold text-sm
      transition-all duration-300 whitespace-nowrap
      ${active
        ? 'bg-gradient-to-r from-ochre-500 to-gold-600 text-white shadow-lg scale-105'
        : 'bg-parchment-100 text-ochre-600 hover:bg-parchment-200 border-2 border-parchment-300'
      }
    `}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const StatBadge: React.FC<{ effects: Partial<CivilizationStats> }> = ({ effects }) => {
  const keys = Object.keys(effects) as (keyof CivilizationStats)[];
  if (keys.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {keys.map((key) => {
        const value = effects[key];
        if (!value) return null;
        const Icon = STAT_ICONS[key];
        return (
          <span
            key={key}
            className={`
              inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold
              ${value > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
            `}
          >
            <Icon className="w-3 h-3" />
            {STAT_LABELS[key]} {value > 0 ? '+' : ''}{value}
          </span>
        );
      })}
    </div>
  );
};

const FlagDisplay: React.FC = () => {
  const { culture } = useCivilizationStore();
  if (!culture) return null;
  const { flag } = culture;

  const renderPattern = () => {
    const { pattern, centralEmblem } = flag;
    const { primaryColor, secondaryColor, accentColor, type } = pattern;

    switch (type) {
      case 'stripes':
        return (
          <div className="w-full h-full flex flex-col">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex-1 flex items-center justify-center"
                style={{ backgroundColor: [primaryColor, secondaryColor, accentColor][i % 3] }}
              >
                {i === 1 && <span className="text-4xl drop-shadow-lg">{centralEmblem}</span>}
              </div>
            ))}
          </div>
        );
      case 'cross':
        return (
          <div className="w-full h-full relative" style={{ backgroundColor: primaryColor }}>
            <div
              className="absolute left-1/2 top-0 bottom-0 w-1/6 -translate-x-1/2"
              style={{ backgroundColor: secondaryColor }}
            />
            <div
              className="absolute top-1/2 left-0 right-0 h-1/6 -translate-y-1/2"
              style={{ backgroundColor: secondaryColor }}
            />
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1/5 h-1/5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: accentColor }}
            >
              <span className="text-2xl">{centralEmblem}</span>
            </div>
          </div>
        );
      case 'circle':
        return (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
            <div
              className="w-3/5 h-3/5 rounded-full flex items-center justify-center border-4"
              style={{ backgroundColor: secondaryColor, borderColor: accentColor }}
            >
              <span className="text-5xl drop-shadow-lg">{centralEmblem}</span>
            </div>
          </div>
        );
      case 'animal':
      case 'plant':
      case 'abstract':
        return (
          <div className="w-full h-full relative" style={{ backgroundColor: primaryColor }}>
            <div
              className="absolute inset-4 rounded-xl flex items-center justify-center border-4"
              style={{ backgroundColor: secondaryColor, borderColor: accentColor }}
            >
              <span className="text-7xl drop-shadow-2xl">{centralEmblem}</span>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
            <span className="text-6xl">{centralEmblem}</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-serif text-lg text-ochre-700 font-bold mb-3 flex items-center gap-2">
            <Flag className="w-5 h-5" />
            文明旗帜
          </h3>
          <div
            className="aspect-[3/2] rounded-xl shadow-2xl overflow-hidden border-4 border-parchment-400"
            style={{ boxShadow: `0 10px 40px ${flag.pattern.primaryColor}40` }}
          >
            {renderPattern()}
          </div>
          <p className="mt-3 text-sm text-ochre-600 leading-relaxed bg-parchment-100 p-3 rounded-lg">
            {flag.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-parchment-200 rounded-full text-xs text-ochre-700">
              {FLAG_PATTERN_LABELS[flag.pattern.type]}
            </span>
            <span className="px-2 py-1 bg-parchment-200 rounded-full text-xs text-ochre-700">
              边框: {flag.mottoBorder}
            </span>
          </div>
          <div className="mt-3 flex gap-2">
            {flag.pattern.colors.map((c, i) => (
              <div key={i} className="flex items-center gap-1">
                <div
                  className="w-6 h-6 rounded-full border-2 border-parchment-400"
                  style={{ backgroundColor: c }}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-serif text-lg text-ochre-700 font-bold mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            文明口号
          </h3>
          <div className={`p-6 rounded-2xl bg-gradient-to-br ${SLOGAN_THEME_COLORS[culture.slogan.theme]} text-white shadow-xl`}>
            <div className="text-xs opacity-80 mb-2">
              「{SLOGAN_THEME_LABELS[culture.slogan.theme]}·精神」
            </div>
            <div className="font-serif text-3xl font-black mb-3 tracking-wider leading-relaxed">
              「{culture.slogan.short}」
            </div>
            <div className="text-sm opacity-95 leading-relaxed border-t border-white/30 pt-3 mt-3">
              {culture.slogan.full}
            </div>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <HeartHandshake className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-amber-700 text-sm">士气加成</span>
              <span className="ml-auto text-amber-800 font-black text-lg">
                +{culture.slogan.moraleBonus}%
              </span>
            </div>
            <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                style={{ width: `${(culture.slogan.moraleBonus / 12) * 100}%` }}
              />
            </div>
          </div>

          <StatBadge effects={culture.slogan.effects} />
        </div>
      </div>
    </div>
  );
};

const MythSection: React.FC = () => {
  const { culture } = useCivilizationStore();
  if (!culture) return null;
  const { myth } = culture;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-xs font-bold">
                {MYTH_TYPE_LABELS[myth.type]}
              </span>
            </div>
            <h3 className="font-serif text-2xl font-black text-purple-900 mt-2">
              「{myth.title}」
            </h3>
            <p className="text-purple-700 mt-2 leading-relaxed">{myth.summary}</p>
          </div>
          <div className="text-6xl drop-shadow-lg">{myth.sacredSymbol}</div>
        </div>

        <div className="p-4 bg-white/60 rounded-xl mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-purple-600" />
            <span className="font-bold text-purple-800 text-sm">主神：{myth.coreDeity}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="font-bold text-purple-800 text-sm">神圣符号：{myth.sacredSymbol}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-serif text-lg font-bold text-purple-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            创世史诗
          </h4>
          {myth.story.map((paragraph, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-300 text-purple-900 flex items-center justify-center font-bold text-sm">
                {idx + 1}
              </div>
              <p className="text-purple-800 leading-relaxed pt-1">{paragraph}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl border-2 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-green-600" />
            <span className="font-bold text-green-800">共同信仰·合作效率加成</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-green-700">+{myth.cooperationBonus}</span>
            <span className="text-green-700 mb-1">%</span>
          </div>
          <div className="mt-2 h-2 bg-green-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-teal-500 transition-all"
              style={{ width: `${(myth.cooperationBonus / 15) * 100}%` }}
            />
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-amber-800">神话带来的文明属性加成</span>
          </div>
          <StatBadge effects={myth.effects} />
        </div>
      </div>
    </div>
  );
};

const LawSection: React.FC = () => {
  const { culture } = useCivilizationStore();
  if (!culture) return null;
  const { legalSystem } = culture;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-br from-slate-50 to-stone-100 rounded-2xl border-2 border-stone-300">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-stone-300 text-stone-800 rounded-full text-xs font-bold">
                {LEGAL_TYPE_LABELS[legalSystem.type]}
              </span>
            </div>
            <h3 className="font-serif text-2xl font-black text-stone-900 mt-2">
              「{legalSystem.title}」
            </h3>
            <p className="text-stone-700 mt-2 leading-relaxed">{legalSystem.description}</p>
          </div>
          <div className="text-5xl">
            <Gavel className="w-12 h-12 text-stone-600" />
          </div>
        </div>

        <div className="p-4 bg-stone-200/60 rounded-xl">
          <div className="text-xs text-stone-600 mb-1">核心原则</div>
          <div className="font-serif text-lg text-stone-800 italic">
            「{legalSystem.corePrinciple}」
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-blue-800">社会秩序加成</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-blue-700">+{legalSystem.socialOrderBonus}</span>
            <span className="text-blue-700 mb-1">%</span>
          </div>
          <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
              style={{ width: `${(legalSystem.socialOrderBonus / 15) * 100}%` }}
            />
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="font-bold text-purple-800">法律体系属性加成</span>
          </div>
          <StatBadge effects={legalSystem.effects} />
        </div>
      </div>

      <div>
        <h4 className="font-serif text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
          <Scroll className="w-5 h-5" />
          法典条文（共{legalSystem.articles.length}条）
        </h4>
        <div className="space-y-3">
          {legalSystem.articles.map((article, idx) => (
            <div
              key={article.id}
              className={`
                p-4 bg-white rounded-xl border-2 border-l-4 shadow-sm hover:shadow-md transition-shadow
                ${LAW_CATEGORY_COLORS[article.category]}
              `}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-sm">
                    第{idx + 1}条
                  </span>
                  <span className="font-serif font-bold text-stone-800">{article.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-stone-100 rounded-full text-xs text-stone-700 border">
                    {LAW_CATEGORY_LABELS[article.category]}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${LAW_SEVERITY_COLORS[article.severity]}`}>
                    {LAW_SEVERITY_LABELS[article.severity]}
                  </span>
                </div>
              </div>
              <p className="text-stone-700 text-sm leading-relaxed mb-2">
                {article.content}
              </p>
              <StatBadge effects={article.effects} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CurrencySection: React.FC = () => {
  const { culture } = useCivilizationStore();
  if (!culture) return null;
  const { currencySystem } = culture;

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-100 rounded-2xl border-2 border-amber-300">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-amber-300 text-amber-900 rounded-full text-xs font-bold">
                {CURRENCY_TYPE_LABELS[currencySystem.type]}
              </span>
            </div>
            <h3 className="font-serif text-2xl font-black text-amber-900 mt-2">
              「{currencySystem.name}」
            </h3>
            <p className="text-amber-800 mt-2 leading-relaxed">{currencySystem.description}</p>
          </div>
          <div className="text-7xl drop-shadow-lg">{currencySystem.symbol}</div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          <div className="p-3 bg-white/60 rounded-xl">
            <div className="text-xs text-amber-700 mb-1">货币单位</div>
            <div className="font-serif font-bold text-amber-900 text-lg">{currencySystem.unitName}</div>
          </div>
          <div className="p-3 bg-white/60 rounded-xl">
            <div className="text-xs text-amber-700 mb-1">材质</div>
            <div className="font-serif font-bold text-amber-900 text-lg">{currencySystem.material}</div>
          </div>
          <div className="p-3 bg-white/60 rounded-xl">
            <div className="text-xs text-amber-700 mb-1">基础兑换率</div>
            <div className="font-serif font-bold text-amber-900 text-lg">
              1 : {currencySystem.conversionRate}
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200">
        <h4 className="font-serif text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
          <Scroll className="w-5 h-5" />
          货币起源传说
        </h4>
        <p className="text-indigo-800 leading-relaxed italic">
          {currencySystem.originStory}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-emerald-800">贸易效率加成</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-emerald-700">+{currencySystem.tradeEfficiencyBonus}</span>
            <span className="text-emerald-700 mb-1">%</span>
          </div>
          <div className="mt-2 h-2 bg-emerald-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all"
              style={{ width: `${(currencySystem.tradeEfficiencyBonus / 20) * 100}%` }}
            />
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span className="font-bold text-orange-800">货币体系属性加成</span>
          </div>
          <StatBadge effects={currencySystem.effects} />
        </div>
      </div>
    </div>
  );
};

const OverviewSection: React.FC = () => {
  const { culture, stats, effectiveStats } = useCivilizationStore();
  if (!culture) return null;

  const statKeys: (keyof CivilizationStats)[] = [
    'population',
    'technology',
    'culture',
    'military',
    'agriculture',
  ];

  const bonuses: Partial<CivilizationStats> = {};
  for (const key of statKeys) {
    const bonus = effectiveStats[key] - stats[key];
    if (bonus !== 0) bonuses[key] = bonus;
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gradient-to-br from-ochre-50 via-amber-50 to-gold-50 rounded-2xl border-2 border-gold-300">
        <div className="text-center mb-6">
          <h2 className="font-serif text-3xl font-black text-ochre-800 mb-2">
            「{useCivilizationStore.getState().civilizationName}」
          </h2>
          <div className="w-40 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto" />
          <p className="text-ochre-600 mt-3 text-sm">
            文化体系生成于第 {culture.generationTurn} 回合
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { icon: <Sparkles className="w-5 h-5" />, label: '神话体系', value: culture.myth.name, color: 'from-purple-400 to-indigo-500' },
            { icon: <Gavel className="w-5 h-5" />, label: '法律体系', value: culture.legalSystem.name, color: 'from-slate-400 to-stone-600' },
            { icon: <Coins className="w-5 h-5" />, label: '货币体系', value: culture.currencySystem.name, color: 'from-amber-400 to-orange-500' },
            { icon: <Flag className="w-5 h-5" />, label: '旗帜样式', value: FLAG_PATTERN_LABELS[culture.flag.pattern.type], color: 'from-red-400 to-rose-600' },
            { icon: <HeartHandshake className="w-5 h-5" />, label: '口号主题', value: SLOGAN_THEME_LABELS[culture.slogan.theme], color: 'from-teal-400 to-emerald-600' },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg`}
            >
              <div className="opacity-90 mb-1">{item.icon}</div>
              <div className="text-xs opacity-80 mb-1">{item.label}</div>
              <div className="font-bold text-sm leading-tight">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 bg-white rounded-2xl border-2 border-parchment-300 shadow-lg">
        <h3 className="font-serif text-xl font-bold text-ochre-700 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          文化体系·综合属性加成
        </h3>
        <div className="grid grid-cols-5 gap-4">
          {statKeys.map((key) => {
            const bonus = bonuses[key] || 0;
            const base = stats[key];
            const effective = effectiveStats[key];
            const Icon = STAT_ICONS[key];
            return (
              <div key={key} className="text-center p-3 bg-parchment-50 rounded-xl border border-parchment-200">
                <div className={`w-10 h-10 mx-auto rounded-full bg-parchment-200 flex items-center justify-center ${STAT_COLORS[key]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-xs text-ochre-600 mt-2">{STAT_LABELS[key]}</div>
                <div className="font-serif text-xl font-bold text-ochre-800 mt-1">
                  {base}
                  {bonus !== 0 && (
                    <span className={`text-sm ${bonus > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {' → '}{effective}
                    </span>
                  )}
                </div>
                {bonus !== 0 && (
                  <div className={`text-xs font-bold mt-1 ${bonus > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {bonus > 0 ? '+' : ''}{bonus}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-green-600" />
            <span className="font-bold text-green-800 text-lg">信念加成</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-green-700 text-sm">共同信仰·合作效率</span>
              <span className="font-bold text-green-800">+{culture.myth.cooperationBonus}%</span>
            </div>
            <div className="h-1.5 bg-green-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${(culture.myth.cooperationBonus / 15) * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-blue-800 text-lg">秩序加成</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-blue-700 text-sm">法律体系·社会秩序</span>
              <span className="font-bold text-blue-800">+{culture.legalSystem.socialOrderBonus}%</span>
            </div>
            <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: `${(culture.legalSystem.socialOrderBonus / 15) * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200">
          <div className="flex items-center gap-2 mb-3">
            <Coins className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-emerald-800 text-lg">经济加成</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-emerald-700 text-sm">货币体系·贸易效率</span>
              <span className="font-bold text-emerald-800">+{culture.currencySystem.tradeEfficiencyBonus}%</span>
            </div>
            <div className="h-1.5 bg-emerald-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${(culture.currencySystem.tradeEfficiencyBonus / 20) * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <HeartHandshake className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-amber-800 text-lg">士气加成</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-amber-700 text-sm">文明口号·精神鼓舞</span>
              <span className="font-bold text-amber-800">+{culture.slogan.moraleBonus}%</span>
            </div>
            <div className="h-1.5 bg-amber-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500" style={{ width: `${(culture.slogan.moraleBonus / 12) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CulturePage: React.FC = () => {
  const { showCulturePage, closeCulturePage, regenerateCulture, isLoading } = useCivilizationStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!showCulturePage) return null;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: '总览', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'flag', label: '旗帜口号', icon: <Flag className="w-4 h-4" /> },
    { id: 'myth', label: '神话信仰', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'law', label: '法律法典', icon: <Gavel className="w-4 h-4" /> },
    { id: 'currency', label: '货币经济', icon: <Coins className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-5xl max-h-[90vh] bg-gradient-to-br from-parchment-50 to-amber-50 rounded-3xl shadow-2xl border-4 border-gold-400 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-ochre-500 via-gold-500 to-ochre-500 border-b-4 border-gold-600">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Scroll className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-black text-white tracking-wide">
                文明文化殿堂
              </h2>
              <p className="text-white/80 text-xs">
                神话、法律、货币——这些虚构故事塑造了文明的灵魂
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => regenerateCulture()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold transition-colors disabled:opacity-50 backdrop-blur-sm"
              title="重新生成文化（属性也会变化）"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">重塑文明</span>
            </button>
            <button
              onClick={closeCulturePage}
              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-5 pt-4 pb-2 flex gap-2 overflow-x-auto border-b-2 border-parchment-200">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              icon={tab.icon}
              label={tab.label}
            />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'overview' && <OverviewSection />}
          {activeTab === 'flag' && <FlagDisplay />}
          {activeTab === 'myth' && <MythSection />}
          {activeTab === 'law' && <LawSection />}
          {activeTab === 'currency' && <CurrencySection />}
        </div>
      </div>
    </div>
  );
};

export default CulturePage;
