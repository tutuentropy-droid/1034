import React, { useEffect, useState } from 'react';
import { useCivilizationStore } from '../store/useCivilizationStore';
import { EVENT_CATEGORY_LABELS, EVENT_CATEGORY_BG, STAT_LABELS, type CivilizationStats } from '../types';
import { X, TrendingUp, TrendingDown, CheckCircle, Skull, Church, Ship, Coins, Crown, Sword, CloudLightning, Lightbulb, Sparkles } from 'lucide-react';

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

interface StatChangeAnimationProps {
  label: string;
  value: number;
  delay: number;
}

const StatChangeAnimation: React.FC<StatChangeAnimationProps> = ({ label, value, delay }) => {
  const [show, setShow] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
      const duration = 800;
      const steps = 30;
      const stepValue = value / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        setDisplayValue(Math.round(stepValue * currentStep));
        if (currentStep >= steps) {
          setDisplayValue(value);
          clearInterval(interval);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  if (!show) return null;

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl
        ${value > 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}
      `}
      style={{
        animation: 'statPopIn 0.5s ease-out forwards',
      }}
    >
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
        ${value > 0 ? 'bg-green-500' : 'bg-red-500'}
      `}>
        {value > 0 ? (
          <TrendingUp className="w-5 h-5 text-white" />
        ) : (
          <TrendingDown className="w-5 h-5 text-white" />
        )}
      </div>
      <div className="flex-1">
        <p className="text-ochre-600 font-medium text-sm">{label}</p>
        <p className={`font-serif text-2xl font-bold ${value > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {value > 0 ? '+' : ''}{displayValue}
        </p>
      </div>
    </div>
  );
};

interface ParticleProps {
  delay: number;
  x: number;
  y: number;
}

const Particle: React.FC<ParticleProps> = ({ delay, x, y }) => {
  return (
    <div
      className="absolute w-2 h-2 rounded-full bg-gold-400"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animation: `particleFloat 2s ease-out ${delay}s forwards`,
      }}
    />
  );
};

const EventResultModal: React.FC = () => {
  const { showEventResult, eventResult, closeEventResult } = useCivilizationStore();
  const [showContent, setShowContent] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showFlavor, setShowFlavor] = useState(false);

  useEffect(() => {
    if (showEventResult) {
      setShowContent(false);
      setShowStats(false);
      setShowFlavor(false);

      const timer1 = setTimeout(() => setShowContent(true), 300);
      const timer2 = setTimeout(() => setShowStats(true), 800);
      const timer3 = setTimeout(() => setShowFlavor(true), 1500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [showEventResult, eventResult?.event.id]);

  if (!showEventResult || !eventResult) return null;

  const { event, choice, effects } = eventResult;
  const IconComponent = ICON_MAP[event.icon] || Skull;
  const categoryBg = EVENT_CATEGORY_BG[event.category];

  const effectEntries = Object.entries(effects) as [keyof CivilizationStats, number][];

  const particles = Array.from({ length: 20 }, (_, i) => ({
    delay: i * 0.1,
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeEventResult}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p, i) => (
          <Particle key={i} {...p} />
        ))}
      </div>

      <div
        className="relative w-full max-w-2xl bg-card-gradient rounded-3xl shadow-2xl overflow-hidden border-4 border-gold-400"
        style={{
          animation: 'resultReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}
      >
        <button
          onClick={closeEventResult}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-parchment-200/80 text-ochre-600 hover:bg-parchment-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative p-8">
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${categoryBg} mb-4 shadow-lg`}
              style={{
                animation: showContent ? 'iconBounce 1s ease-out forwards' : 'none',
                opacity: showContent ? 1 : 0,
              }}
            >
              <IconComponent className="w-10 h-10 text-white" />
            </div>

            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-100 text-gold-700 mb-4"
              style={{
                opacity: showContent ? 1 : 0,
                transform: showContent ? 'translateY(0)' : 'translateY(-20px)',
                transition: 'all 0.5s ease-out 0.2s',
              }}
            >
              <CheckCircle className="w-4 h-4" />
              <span className="font-bold text-sm">已做出选择</span>
            </div>

            <h2
              className="font-serif text-3xl text-ochre-700 mb-2"
              style={{
                opacity: showContent ? 1 : 0,
                transform: showContent ? 'translateY(0)' : 'translateY(-20px)',
                transition: 'all 0.5s ease-out 0.3s',
              }}
            >
              {event.title}
            </h2>

            <p
              className="text-ochre-500 font-medium"
              style={{
                opacity: showContent ? 1 : 0,
                transform: showContent ? 'translateY(0)' : 'translateY(-20px)',
                transition: 'all 0.5s ease-out 0.4s',
              }}
            >
              {EVENT_CATEGORY_LABELS[event.category]}事件
            </p>
          </div>

          {showStats && (
            <div className="mb-8">
              <h3 className="text-center text-ochre-600 font-medium mb-4">
                <Sparkles className="w-4 h-4 inline mr-2" />
                文明属性变化
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {effectEntries.map(([key, value], index) => (
                  <StatChangeAnimation
                    key={key}
                    label={STAT_LABELS[key]}
                    value={value}
                    delay={index * 200}
                  />
                ))}
              </div>
            </div>
          )}

          {showFlavor && (
            <div
              className="relative p-6 bg-parchment-100/80 rounded-2xl border-2 border-parchment-300 mb-8"
              style={{
                animation: 'fadeInUp 0.6s ease-out forwards',
              }}
            >
              <div className="absolute -top-3 left-6 text-4xl opacity-20">"</div>
              <p className="font-serif text-lg text-ochre-700 leading-relaxed text-center italic">
                {choice.flavorText}
              </p>
              <div className="absolute -bottom-3 right-6 text-4xl opacity-20 rotate-180">"</div>
            </div>
          )}

          <div
            className="flex justify-center"
            style={{
              opacity: showFlavor ? 1 : 0,
              transition: 'opacity 0.5s ease-out',
            }}
          >
            <button
              onClick={closeEventResult}
              className="
                group flex items-center gap-3 px-8 py-4
                bg-gradient-to-r from-gold-500 to-gold-600
                text-white font-serif text-xl font-bold
                rounded-2xl shadow-lg
                hover:shadow-xl
                hover:from-gold-600 hover:to-gold-700
                transition-all duration-300
                hover:-translate-y-0.5
                active:translate-y-0
              "
            >
              <span>继续历史进程</span>
              <CheckCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes resultReveal {
          0% {
            opacity: 0;
            transform: scale(0.5) rotate(-10deg);
          }
          60% {
            transform: scale(1.05) rotate(2deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        @keyframes iconBounce {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes statPopIn {
          0% {
            opacity: 0;
            transform: scale(0.8) translateX(-20px);
          }
          60% {
            transform: scale(1.05) translateX(5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateX(0);
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

        @keyframes particleFloat {
          0% {
            opacity: 0;
            transform: scale(0) translateY(0);
          }
          20% {
            opacity: 1;
            transform: scale(1) translateY(-20px);
          }
          100% {
            opacity: 0;
            transform: scale(0.5) translateY(-100px);
          }
        }
      `}</style>
    </div>
  );
};

export default EventResultModal;
