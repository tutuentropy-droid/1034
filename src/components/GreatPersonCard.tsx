import React from 'react';
import type { GreatPerson, GreatPersonAction, CivilizationStats } from '../../shared/types';
import {
  GREAT_PERSON_TYPE_LABELS,
  GREAT_PERSON_TYPE_COLORS,
  GREAT_PERSON_TYPE_BG,
  GREAT_PERSON_PERSONALITY_LABELS,
  GREAT_PERSON_BIAS_LABELS,
  GREAT_PERSON_ACTION_LABELS,
  STAT_LABELS,
} from '../types';
import { getActionEffects, getActionRiskLevel, getActionDescription } from '../lib/greatPersonEngine';
import { Brain, Sword, FlaskConical, Church, Skull, Shield, Ban, Eye, TrendingUp, TrendingDown } from 'lucide-react';

const GREAT_PERSON_ICONS: Record<string, React.ReactNode> = {
  Brain: <Brain className="w-6 h-6" />,
  Sword: <Sword className="w-6 h-6" />,
  FlaskConical: <FlaskConical className="w-6 h-6" />,
  Church: <Church className="w-6 h-6" />,
};

const ACTION_ICONS: Record<GreatPersonAction, React.ReactNode> = {
  support: <Shield className="w-5 h-5" />,
  exile: <Ban className="w-5 h-5" />,
  assassinate: <Skull className="w-5 h-5" />,
  ignore: <Eye className="w-5 h-5" />,
};

const ACTION_COLORS: Record<GreatPersonAction, string> = {
  support: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-green-400',
  exile: 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 border-amber-400',
  assassinate: 'from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 border-red-400',
  ignore: 'from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 border-gray-400',
};

const RISK_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

const RISK_LABELS: Record<string, string> = {
  low: '低风险',
  medium: '中风险',
  high: '高风险',
};

interface StatChangeDisplayProps {
  effects: Partial<CivilizationStats>;
}

const StatChangeDisplay: React.FC<StatChangeDisplayProps> = ({ effects }) => {
  const statKeys: Array<keyof CivilizationStats> = ['population', 'technology', 'culture', 'military', 'agriculture'];

  return (
    <div className="flex flex-wrap gap-2">
      {statKeys.map((key) => {
        const value = effects[key];
        if (value === undefined || value === 0) return null;

        const isPositive = value > 0;
        return (
          <div
            key={key}
            className={`
              flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium
              ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
            `}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{STAT_LABELS[key]}</span>
            <span>{isPositive ? '+' : ''}{value}</span>
          </div>
        );
      })}
    </div>
  );
};

interface GreatPersonCardProps {
  greatPerson: GreatPerson;
  onAction?: (action: GreatPersonAction) => void;
  showActions?: boolean;
  compact?: boolean;
}

const GreatPersonCard: React.FC<GreatPersonCardProps> = ({
  greatPerson,
  onAction,
  showActions = true,
  compact = false,
}) => {
  const actions: GreatPersonAction[] = ['support', 'exile', 'assassinate', 'ignore'];

  if (compact) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-parchment-300 overflow-hidden">
        <div className={`bg-gradient-to-r ${GREAT_PERSON_TYPE_COLORS[greatPerson.type]} p-3`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white">
              {GREAT_PERSON_ICONS[greatPerson.icon] || <Brain className="w-5 h-5" />}
            </div>
            <div className="text-white">
              <h3 className="font-serif font-bold text-lg">{greatPerson.name}</h3>
              <p className="text-sm opacity-90">{greatPerson.title}</p>
            </div>
          </div>
        </div>
        <div className="p-3">
          <div className="flex flex-wrap gap-1 mb-2">
            <span className={`${GREAT_PERSON_TYPE_BG[greatPerson.type]} text-white text-xs px-2 py-0.5 rounded-full`}>
              {GREAT_PERSON_TYPE_LABELS[greatPerson.type]}
            </span>
            <span className="bg-parchment-100 text-ochre-700 text-xs px-2 py-0.5 rounded-full">
              {GREAT_PERSON_PERSONALITY_LABELS[greatPerson.personality]}
            </span>
            <span className="bg-parchment-100 text-ochre-700 text-xs px-2 py-0.5 rounded-full">
              {GREAT_PERSON_BIAS_LABELS[greatPerson.bias]}
            </span>
          </div>
          <p className="text-ochre-600 text-sm italic">"{greatPerson.quote}"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-parchment-300 overflow-hidden max-w-2xl">
      <div className={`bg-gradient-to-r ${GREAT_PERSON_TYPE_COLORS[greatPerson.type]} p-6`}>
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
            {GREAT_PERSON_ICONS[greatPerson.icon] || <Brain className="w-10 h-10" />}
          </div>
          <div className="text-white flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                {GREAT_PERSON_TYPE_LABELS[greatPerson.type]}
              </span>
              <span className="text-white/70 text-sm">
                {greatPerson.birthYear > 0 ? `公元 ${greatPerson.birthYear} 年` : `公元前 ${Math.abs(greatPerson.birthYear)} 年`}
              </span>
            </div>
            <h2 className="font-serif font-black text-2xl mb-1">{greatPerson.name}</h2>
            <p className="text-white/90 font-medium">{greatPerson.title}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`${GREAT_PERSON_TYPE_BG[greatPerson.type]} text-white text-sm px-3 py-1 rounded-full font-medium`}>
              {GREAT_PERSON_TYPE_LABELS[greatPerson.type]}
            </span>
            <span className="bg-indigo-100 text-indigo-700 text-sm px-3 py-1 rounded-full font-medium">
              性格：{GREAT_PERSON_PERSONALITY_LABELS[greatPerson.personality]}
            </span>
            <span className="bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-full font-medium">
              倾向：{GREAT_PERSON_BIAS_LABELS[greatPerson.bias]}
            </span>
          </div>

          <p className="text-ochre-700 leading-relaxed mb-4">
            {greatPerson.description}
          </p>

          <blockquote className="border-l-4 border-ochre-300 pl-4 py-2 bg-parchment-50 rounded-r-lg">
            <p className="text-ochre-600 italic text-lg">"{greatPerson.quote}"</p>
          </blockquote>
        </div>

        {showActions && onAction && (
          <div className="space-y-6">
            <div className="border-t border-parchment-200 pt-6">
              <h3 className="font-serif font-bold text-xl text-ochre-800 mb-4">决定这位伟人的命运</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {actions.map((action) => {
                  const effects = getActionEffects(greatPerson, action);
                  const riskLevel = getActionRiskLevel(action);
                  const description = getActionDescription(action);

                  return (
                    <button
                      key={action}
                      onClick={() => onAction(action)}
                      className={`
                        group relative text-left p-4 rounded-xl border-2 transition-all duration-300
                        bg-gradient-to-r ${ACTION_COLORS[action]}
                        hover:shadow-lg hover:-translate-y-0.5
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-white">
                          {ACTION_ICONS[action]}
                          <span className="font-serif font-bold text-lg">
                            {GREAT_PERSON_ACTION_LABELS[action]}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${RISK_COLORS[riskLevel]}`}>
                          {RISK_LABELS[riskLevel]}
                        </span>
                      </div>
                      <p className="text-white/90 text-sm mb-3">{description}</p>
                      <StatChangeDisplay effects={effects} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {greatPerson.actionTaken && (
          <div className="border-t border-parchment-200 pt-4 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-ochre-600 font-medium">已选择：</span>
              <span className={`${GREAT_PERSON_TYPE_BG[greatPerson.type]} text-white px-3 py-1 rounded-full font-medium`}>
                {GREAT_PERSON_ACTION_LABELS[greatPerson.actionTaken]}
              </span>
            </div>
            <StatChangeDisplay effects={getActionEffects(greatPerson, greatPerson.actionTaken)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default GreatPersonCard;
