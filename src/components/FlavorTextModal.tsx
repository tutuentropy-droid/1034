import React from 'react';
import { useCivilizationStore } from '../store/useCivilizationStore';
import { STAT_LABELS, type CivilizationStats } from '../types';
import { ArrowRight, X, TrendingUp, TrendingDown } from 'lucide-react';

interface EffectDisplayProps {
  effects: Partial<CivilizationStats>;
}

const EffectDisplay: React.FC<EffectDisplayProps> = ({ effects }) => {
  const effectEntries = Object.entries(effects) as [keyof CivilizationStats, number][];

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {effectEntries.map(([key, value]) => (
        <div
          key={key}
          className={`
            flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold
            ${value > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
          `}
        >
          {value > 0 ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>{STAT_LABELS[key]}</span>
          <span>{value > 0 ? '+' : ''}{value}</span>
        </div>
      ))}
    </div>
  );
};

const FlavorTextModal: React.FC = () => {
  const { showFlavorText, transitionData, advanceStage, isComplete, closeFlavorText } =
    useCivilizationStore();

  if (!showFlavorText || !transitionData) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeFlavorText}
      />

      <div
        className="relative w-full max-w-2xl bg-card-gradient rounded-3xl shadow-2xl overflow-hidden border-4 border-gold-400/50"
        style={{
          animation: 'modalReveal 0.5s ease-out forwards',
        }}
      >
        <button
          onClick={closeFlavorText}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-parchment-200/80 text-ochre-600 hover:bg-parchment-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-6">
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-white rounded-full font-serif font-bold text-lg mb-4 shadow-lg">
              历史的转折
            </div>
            <h2 className="font-serif text-3xl text-ochre-700 mb-2">
              {isComplete ? '文明之路已完成' : '你的选择改变了历史'}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto" />
          </div>

          <div className="relative p-6 bg-parchment-100/80 rounded-2xl border-2 border-parchment-300 mb-6">
            <div className="absolute -top-3 left-6 text-4xl opacity-20">"</div>
            <p className="font-serif text-lg text-ochre-700 leading-relaxed text-center italic">
              {transitionData.flavorText}
            </p>
            <div className="absolute -bottom-3 right-6 text-4xl opacity-20 rotate-180">"</div>
          </div>

          <div className="mb-8">
            <h3 className="text-center text-ochre-600 font-medium mb-3">文明属性变化</h3>
            <EffectDisplay effects={transitionData.effects} />
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => {
                if (isComplete) {
                  closeFlavorText();
                } else {
                  advanceStage();
                }
              }}
              className="
                group flex items-center gap-3 px-8 py-4
                bg-gradient-to-r from-ochre-500 to-ochre-600
                text-white font-serif text-xl font-bold
                rounded-2xl shadow-button
                hover:shadow-button-hover
                hover:from-ochre-600 hover:to-ochre-700
                transition-all duration-300
                hover:-translate-y-0.5
                active:translate-y-0
              "
            >
              <span>{isComplete ? '查看文明历程' : '进入下一时代'}</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalReveal {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default FlavorTextModal;
