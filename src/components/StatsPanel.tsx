import React, { useState, useEffect } from 'react';
import { useCivilizationStore } from '../store/useCivilizationStore';
import { STAT_LABELS, type CivilizationStats } from '../types';
import { Users, FlaskConical, BookOpen, Sword, Wheat, TrendingUp, TrendingDown } from 'lucide-react';

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

interface StatItemProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  previousValue?: number;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, icon, color, previousValue }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [showChange, setShowChange] = useState(false);
  const change = previousValue !== undefined ? value - previousValue : 0;

  useEffect(() => {
    if (previousValue !== undefined && previousValue !== value) {
      setShowChange(true);
      const startValue = previousValue;
      const endValue = value;
      const duration = 800;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        setDisplayValue(Math.round(startValue + (endValue - startValue) * easeProgress));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setTimeout(() => setShowChange(false), 1500);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [value, previousValue]);

  return (
    <div className="relative flex flex-col items-center p-4 bg-parchment-100/80 rounded-xl border-2 border-parchment-300 shadow-inner-engraved">
      <div className={`w-10 h-10 rounded-full bg-parchment-200 flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div className="mt-2 text-center">
        <p className="text-xs text-ochre-600 font-medium">{label}</p>
        <p className={`text-2xl font-serif font-bold ${color} animate-number-scroll`}>
          {displayValue}
        </p>
      </div>
      {showChange && change !== 0 && (
        <div
          className={`
            absolute -top-2 -right-2 flex items-center gap-0.5 px-2 py-1 rounded-full text-xs font-bold
            ${change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
            animate-bounce
          `}
        >
          {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {change > 0 ? '+' : ''}
          {change}
        </div>
      )}
    </div>
  );
};

interface StatsPanelProps {
  previousStats?: CivilizationStats;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ previousStats }) => {
  const { stats, civilizationName } = useCivilizationStore();

  const statKeys: (keyof CivilizationStats)[] = [
    'population',
    'technology',
    'culture',
    'military',
    'agriculture',
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl text-ochre-700 mb-1">
          「{civilizationName}」文明状态
        </h2>
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto" />
      </div>

      <div className="grid grid-cols-5 gap-4">
        {statKeys.map((key) => (
          <StatItem
            key={key}
            label={STAT_LABELS[key]}
            value={stats[key]}
            icon={React.createElement(STAT_ICONS[key], { className: 'w-5 h-5' })}
            color={STAT_COLORS[key]}
            previousValue={previousStats?.[key]}
          />
        ))}
      </div>
    </div>
  );
};

export default StatsPanel;
