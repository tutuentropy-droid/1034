import React from 'react';
import { useCivilizationStore } from '../store/useCivilizationStore';
import type { CivilizationStats, GreatPersonAction } from '../../shared/types';
import {
  GREAT_PERSON_TYPE_COLORS,
  GREAT_PERSON_ACTION_LABELS,
  STAT_LABELS,
} from '../types';
import { TrendingUp, TrendingDown, X, Check } from 'lucide-react';

interface EffectDisplayProps {
  effects: Partial<CivilizationStats>;
  previousStats: CivilizationStats;
  newStats: CivilizationStats;
}

const EffectDisplay: React.FC<EffectDisplayProps> = ({ effects, previousStats, newStats }) => {
  const statKeys: Array<keyof CivilizationStats> = ['population', 'technology', 'culture', 'military', 'agriculture'];

  return (
    <div className="space-y-3">
      {statKeys.map((key) => {
        const change = effects[key];
        if (change === undefined || change === 0) return null;

        const isPositive = change > 0;
        const prevValue = previousStats[key];
        const newValue = newStats[key];

        return (
          <div key={key} className="flex items-center justify-between p-3 bg-parchment-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
                `}
              >
                {isPositive ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="font-medium text-ochre-800">{STAT_LABELS[key]}</p>
                <p className="text-sm text-ochre-500">
                  {prevValue} → {newValue}
                </p>
              </div>
            </div>
            <span
              className={`
                font-bold text-lg
                ${isPositive ? 'text-green-600' : 'text-red-600'}
              `}
            >
              {isPositive ? '+' : ''}{change}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const GreatPersonResultModal: React.FC = () => {
  const { showGreatPersonResult, greatPersonResult, stats, closeGreatPersonResult } =
    useCivilizationStore();

  if (!showGreatPersonResult || !greatPersonResult) return null;

  const { greatPerson, action, effects, flavorText } = greatPersonResult;

  const previousStats: CivilizationStats = {
    population: stats.population - (effects.population || 0),
    technology: stats.technology - (effects.technology || 0),
    culture: stats.culture - (effects.culture || 0),
    military: stats.military - (effects.military || 0),
    agriculture: stats.agriculture - (effects.agriculture || 0),
  };

  const actionLabel = GREAT_PERSON_ACTION_LABELS[action as GreatPersonAction];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeGreatPersonResult}
      />

      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-parchment-300 overflow-hidden animate-bounce-in">
          <div className={`bg-gradient-to-r ${GREAT_PERSON_TYPE_COLORS[greatPerson.type]} p-6`}>
            <div className="flex items-start justify-between">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-6 h-6" />
                  <span className="font-serif font-bold text-xl">{actionLabel}成功</span>
                </div>
                <h2 className="font-serif font-black text-3xl">{greatPerson.name}</h2>
                <p className="text-white/90 mt-1">{greatPerson.title}</p>
              </div>
              <button
                onClick={closeGreatPersonResult}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-parchment-50 border border-parchment-200 rounded-xl p-5 mb-6">
              <p className="text-ochre-700 leading-relaxed text-lg">{flavorText}</p>
            </div>

            <h3 className="font-serif font-bold text-xl text-ochre-800 mb-4">数值变化</h3>
            <EffectDisplay effects={effects} previousStats={previousStats} newStats={stats} />

            <button
              onClick={closeGreatPersonResult}
              className="w-full mt-6 py-4 bg-gradient-to-r from-ochre-500 to-ochre-600 hover:from-ochre-600 hover:to-ochre-700 text-white font-serif font-bold text-lg rounded-xl transition-all hover:shadow-lg"
            >
              继续历史进程
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreatPersonResultModal;
