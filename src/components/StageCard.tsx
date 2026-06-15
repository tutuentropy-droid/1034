import React, { useRef, useEffect } from 'react';
import { useCivilizationStore } from '../store/useCivilizationStore';
import { ERA_BORDER_COLORS, ERA_TEXT_COLORS } from '../types';
import ChoiceButton from './ChoiceButton';
import { BookOpen, Clock } from 'lucide-react';

const StageCard: React.FC = () => {
  const { currentStage, makeChoice, isLoading, isTransitioning } = useCivilizationStore();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current && currentStage) {
      cardRef.current.classList.add('animate-page-turn');
      const timer = setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.classList.remove('animate-page-turn');
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [currentStage?.id]);

  if (!currentStage) return null;

  const handleChoice = (choiceId: string) => {
    makeChoice(choiceId);
  };

  return (
    <div
      ref={cardRef}
      className={`
        w-full max-w-5xl mx-auto perspective-1000
        ${isTransitioning ? 'pointer-events-none' : ''}
      `}
      style={{ perspective: '1500px' }}
    >
      <div
        className={`
          relative bg-card-gradient rounded-3xl shadow-card overflow-hidden
          border-4 ${ERA_BORDER_COLORS[currentStage.eraColor]}
        `}
      >
        <div className="relative h-80 overflow-hidden">
          <img
            src={currentStage.imageUrl}
            alt={currentStage.title}
            className="w-full h-full object-cover"
            style={{ animation: 'slowZoom 20s ease-in-out infinite alternate' }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-ochre-700/90 via-ochre-700/40 to-transparent" />

          <div className="absolute top-6 left-6 right-6">
            <div className="flex items-center justify-between">
              <div
                className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-full
                  bg-white/20 backdrop-blur-sm border border-white/30
                `}
              >
                <Clock className="w-4 h-4 text-white/90" />
                <span className="text-white/90 text-sm font-medium">
                  {currentStage.subtitle}
                </span>
              </div>

              <div
                className={`
                  px-4 py-2 rounded-full font-serif font-bold
                  ${ERA_TEXT_COLORS[currentStage.eraColor]}
                  bg-white/90 backdrop-blur-sm
                `}
              >
                {currentStage.era}
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <h2
              className="font-serif text-5xl font-bold text-white mb-2"
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
            >
              {currentStage.title}
            </h2>
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-start gap-3 mb-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-ochre-100 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-ochre-600" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-ochre-700 mb-2">
                历史百科
              </h3>
              <div className="text-ochre-600/90 leading-relaxed space-y-3 font-sans">
                {currentStage.encyclopedia.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t-2 border-parchment-300 pt-6 mt-6">
            <h3 className="font-serif text-2xl font-bold text-ochre-700 mb-6 text-center">
              历史的十字路口——你将如何选择？
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentStage.choices.map((choice, index) => (
                <ChoiceButton
                  key={choice.id}
                  choice={choice}
                  onClick={() => handleChoice(choice.id)}
                  disabled={isLoading || isTransitioning}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slowZoom {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.05);
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
      `}</style>
    </div>
  );
};

export default StageCard;
