import React from 'react';
import { useCivilizationStore } from '../store/useCivilizationStore';
import { ERA_COLORS, ERA_TEXT_COLORS } from '../types';
import { Check, Flame, Leaf, Crown, FlaskConical } from 'lucide-react';

const ERA_ICONS: Record<string, React.ReactNode> = {
  stoneAge: <Flame className="w-5 h-5" />,
  agricultural: <Leaf className="w-5 h-5" />,
  imperial: <Crown className="w-5 h-5" />,
  scientific: <FlaskConical className="w-5 h-5" />,
};

const Timeline: React.FC = () => {
  const { stages, currentStageId, history } = useCivilizationStore();

  const currentIndex = stages.findIndex((s) => s.id === currentStageId);
  const completedStageIds = history.map((h) => h.stageId);

  return (
    <div className="w-full py-8 px-4">
      <div className="relative max-w-5xl mx-auto">
        <svg
          className="absolute top-1/2 left-0 w-full h-2 -translate-y-1/2 z-0"
          viewBox="0 0 1000 20"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="timelineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#757575" />
              <stop offset="33%" stopColor="#558B2F" />
              <stop offset="66%" stopColor="#4A148C" />
              <stop offset="100%" stopColor="#0D47A1" />
            </linearGradient>
          </defs>
          <path
            d="M 0 10 Q 250 0, 500 10 T 1000 10"
            fill="none"
            stroke="#D2B48C"
            strokeWidth="4"
            strokeDasharray="1000"
            className="animate-timeline-draw"
          />
          <path
            d="M 0 10 Q 250 0, 500 10 T 1000 10"
            fill="none"
            stroke="url(#timelineGradient)"
            strokeWidth="4"
            strokeDasharray="1000"
            style={{
              strokeDashoffset: `${1000 - (currentIndex / (stages.length - 1 || 1)) * 1000}`,
            }}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="relative z-10 flex justify-between items-center">
          {stages.map((stage, index) => {
            const isCompleted = completedStageIds.includes(stage.id);
            const isCurrent = stage.id === currentStageId;
            const isFuture = index > currentIndex;

            return (
              <div
                key={stage.id}
                className="flex flex-col items-center"
                style={{
                  opacity: isFuture ? 0.5 : 1,
                  transform: `translateY(${index % 2 === 0 ? '-20px' : '20px'})`,
                }}
              >
                <div
                  className={`
                    relative w-16 h-16 rounded-full flex items-center justify-center
                    border-4 transition-all duration-500
                    ${isCurrent ? 'scale-125 animate-glow-pulse' : ''}
                    ${isCompleted ? `${ERA_COLORS[stage.eraColor]} border-white` : 'bg-parchment-200 border-parchment-400'}
                    ${isCurrent ? `${ERA_BORDER_COLORS[stage.eraColor]} border-white` : ''}
                  `}
                  style={{
                    boxShadow: isCurrent
                      ? '0 0 30px rgba(212, 175, 55, 0.6)'
                      : '0 4px 15px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {isCompleted ? (
                    <Check className="w-8 h-8 text-white" />
                  ) : (
                    <span className={isCurrent ? 'text-white' : 'text-ochre-600'}>
                      {ERA_ICONS[stage.eraColor]}
                    </span>
                  )}

                  {isCurrent && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-gold-500 rounded-full animate-ping" />
                  )}
                </div>

                <div
                  className={`
                    mt-4 text-center transition-all duration-300
                    ${isCurrent ? 'scale-110' : ''}
                  `}
                >
                  <h3
                    className={`
                      font-serif text-lg font-bold
                      ${isCurrent ? ERA_TEXT_COLORS[stage.eraColor] : 'text-ochre-700'}
                    `}
                  >
                    {stage.era}
                  </h3>
                  <p className="text-xs text-ochre-500 mt-1 font-sans">
                    {stage.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ERA_BORDER_COLORS: Record<string, string> = {
  stoneAge: 'border-stoneAge',
  agricultural: 'border-agricultural',
  imperial: 'border-imperial',
  scientific: 'border-scientific',
};

export default Timeline;
