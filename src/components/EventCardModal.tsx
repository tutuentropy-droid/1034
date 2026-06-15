import React from 'react';
import { useCivilizationStore } from '../store/useCivilizationStore';
import { EVENT_CATEGORY_LABELS, EVENT_CATEGORY_COLORS, EVENT_CATEGORY_BG, type EventChoice } from '../types';
import { STAT_LABELS } from '../types';
import { X, TrendingUp, TrendingDown, Skull, Church, Ship, Coins, Crown, Sword, CloudLightning, Lightbulb } from 'lucide-react';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Skull,
  Church,
  Ship,
  Coins,
  Crown,
  Sword,
  CloudLightning,
  Lightbulb,
};

interface EffectDisplayProps {
  effects: Partial<import('../types').CivilizationStats>;
}

const EffectDisplay: React.FC<EffectDisplayProps> = ({ effects }) => {
  const effectEntries = Object.entries(effects) as [keyof import('../types').CivilizationStats, number][];

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {effectEntries.map(([key, value]) => (
        <div
          key={key}
          className={`
            flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold
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
  );
};

interface EventChoiceCardProps {
  choice: EventChoice;
  onClick: () => void;
  disabled: boolean;
  index: number;
}

const EventChoiceCard: React.FC<EventChoiceCardProps> = ({ choice, onClick, disabled, index }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative p-5 text-left rounded-2xl border-2 border-parchment-300
        bg-white/80 hover:bg-white
        hover:border-ochre-400 hover:shadow-lg
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:-translate-y-1
      `}
      style={{
        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
      }}
    >
      <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-ochre-100 flex items-center justify-center text-ochre-600 font-serif font-bold text-sm">
        {index + 1}
      </div>

      <div className="pl-10">
        <h4 className="font-serif text-lg font-bold text-ochre-700 mb-2 group-hover:text-ochre-800 transition-colors">
          {choice.title}
        </h4>
        <p className="text-ochre-600/80 text-sm mb-2 leading-relaxed">
          {choice.description}
        </p>
        <EffectDisplay effects={choice.effects} />
      </div>

      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-6 h-6 rounded-full bg-ochre-500 flex items-center justify-center text-white">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
};

const EventCardModal: React.FC = () => {
  const { showEventModal, currentEvent, makeEventChoice, isLoading, closeEventModal } =
    useCivilizationStore();

  if (!showEventModal || !currentEvent) return null;

  const IconComponent = ICON_MAP[currentEvent.icon] || Skull;
  const categoryColor = EVENT_CATEGORY_COLORS[currentEvent.category];
  const categoryBg = EVENT_CATEGORY_BG[currentEvent.category];

  const handleChoice = (choiceId: string) => {
    makeEventChoice(choiceId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeEventModal}
      />

      <div
        className="relative w-full max-w-4xl bg-card-gradient rounded-3xl shadow-2xl overflow-hidden"
        style={{
          animation: 'eventCardReveal 0.6s ease-out forwards',
        }}
      >
        <button
          onClick={closeEventModal}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative h-64 overflow-hidden">
          <img
            src={currentEvent.imageUrl}
            alt={currentEvent.title}
            className="w-full h-full object-cover"
            style={{ animation: 'slowZoom 15s ease-in-out infinite alternate' }}
          />

          <div className={`absolute inset-0 bg-gradient-to-t ${categoryColor}/90 via-black/50 to-transparent`} />

          <div className="absolute top-6 left-6">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${categoryBg} text-white shadow-lg`}>
              <IconComponent className="w-4 h-4" />
              <span className="text-sm font-bold">{EVENT_CATEGORY_LABELS[currentEvent.category]}事件</span>
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-3">
              {currentEvent.subtitle}
            </div>
            <h2
              className="font-serif text-4xl font-bold text-white"
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
            >
              {currentEvent.title}
            </h2>
          </div>
        </div>

        <div className="p-8">
          <div className="relative p-6 bg-parchment-100/80 rounded-2xl border-2 border-parchment-300 mb-8">
            <div className="absolute -top-3 left-6 text-4xl opacity-20">"</div>
            <p className="font-serif text-lg text-ochre-700 leading-relaxed text-center italic">
              {currentEvent.description}
            </p>
            <div className="absolute -bottom-3 right-6 text-4xl opacity-20 rotate-180">"</div>
          </div>

          <h3 className="font-serif text-2xl font-bold text-ochre-700 mb-6 text-center">
            你将如何应对？
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentEvent.choices.map((choice, index) => (
              <EventChoiceCard
                key={choice.id}
                choice={choice}
                onClick={() => handleChoice(choice.id)}
                disabled={isLoading}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes eventCardReveal {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(50px) rotate(-3deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0) rotate(0deg);
          }
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slowZoom {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.08);
          }
        }
      `}</style>
    </div>
  );
};

export default EventCardModal;
