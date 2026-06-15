import React from 'react';
import type { Choice, CivilizationStats } from '../types';
import { STAT_LABELS } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ChoiceButtonProps {
  choice: Choice;
  onClick: () => void;
  disabled?: boolean;
  index: number;
}

const ChoiceButton: React.FC<ChoiceButtonProps> = ({ choice, onClick, disabled, index }) => {
  const effects = Object.entries(choice.effects) as [keyof CivilizationStats, number][];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative w-full p-6 rounded-2xl text-left
        bg-gradient-to-br from-parchment-100 to-parchment-200
        border-3 border-parchment-400
        shadow-button
        transition-all duration-300 ease-out
        hover:shadow-button-hover
        hover:border-gold-400
        hover:-translate-y-1
        active:translate-y-0
        active:shadow-inner-engraved
        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:hover:translate-y-0
        overflow-hidden
      `}
      style={{
        animationDelay: `${0.3 + index * 0.15}s`,
        animation: 'fadeInUp 0.6s ease-out forwards',
        opacity: 0,
      }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-gold-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-serif text-xl font-bold text-ochre-700 group-hover:text-ochre-600 transition-colors">
            {choice.title}
          </h4>
          <div className="w-8 h-8 rounded-full bg-ochre-500/10 flex items-center justify-center text-ochre-600 font-serif font-bold">
            {index + 1}
          </div>
        </div>

        <p className="text-ochre-600/90 text-sm leading-relaxed mb-4 font-sans">
          {choice.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {effects.map(([key, value]) => (
            <div
              key={key}
              className={`
                flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold
                ${value > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
              `}
            >
              {value > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{STAT_LABELS[key]}</span>
              <span>{value > 0 ? '+' : ''}{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
      />
    </button>
  );
};

export default ChoiceButton;
