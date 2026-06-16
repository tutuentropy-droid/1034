import React, { useEffect, useState } from 'react';
import { useCivilizationStore } from '../store/useCivilizationStore';
import type { CivilizationStats } from '../types';
import Timeline from '../components/Timeline';
import StatsPanel from '../components/StatsPanel';
import StageCard from '../components/StageCard';
import CompletionScreen from '../components/CompletionScreen';
import TransitionOverlay from '../components/TransitionOverlay';
import FlavorTextModal from '../components/FlavorTextModal';
import EventCardModal from '../components/EventCardModal';
import EventResultModal from '../components/EventResultModal';
import { RotateCcw, BookOpen, Globe, Library, Users, Swords } from 'lucide-react';

interface HeaderProps {
  onEnterEncyclopedia: () => void;
  onEnterMultiCiv: () => void;
}

const Header: React.FC<HeaderProps> = ({ onEnterEncyclopedia, onEnterMultiCiv }) => {
  const { reset, isLoading, civilizationName } = useCivilizationStore();

  return (
    <header className="relative py-8 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-ochre-500/10 to-transparent" />

      <div className="relative max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-ochre-500 to-ochre-700 flex items-center justify-center shadow-lg">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="font-serif text-4xl font-black text-ochre-700 tracking-tight">
                人类简史
              </h1>
              <p className="text-ochre-500 text-sm font-medium flex items-center gap-2">
                <span className="w-8 h-px bg-ochre-400" />
                互动文明地图
                <span className="w-8 h-px bg-ochre-400" />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onEnterMultiCiv}
              className="
                group flex items-center gap-2 px-5 py-3
                bg-gradient-to-r from-blue-500 to-indigo-600
                hover:from-blue-600 hover:to-indigo-700
                text-white font-serif font-bold
                rounded-xl border-2 border-blue-400
                shadow-sm hover:shadow-lg
                transition-all duration-300
              "
            >
              <Users className="w-5 h-5" />
              <span className="hidden sm:inline">多文明竞争</span>
            </button>

            <button
              onClick={onEnterEncyclopedia}
              className="
                group flex items-center gap-2 px-5 py-3
                bg-slate-800 hover:bg-slate-700
                text-white font-serif font-bold
                rounded-xl border-2 border-slate-600
                shadow-sm hover:shadow-md
                transition-all duration-300
              "
            >
              <Library className="w-5 h-5" />
              <span className="hidden sm:inline">百科模式</span>
            </button>

            <div className="text-right hidden sm:block">
              <p className="text-xs text-ochre-500 font-medium">当前文明</p>
              <p className="font-serif text-xl font-bold text-ochre-700">
                「{civilizationName}」
              </p>
            </div>

            <button
              onClick={reset}
              disabled={isLoading}
              className="
                group flex items-center gap-2 px-5 py-3
                bg-parchment-200 hover:bg-parchment-300
                text-ochre-700 font-serif font-bold
                rounded-xl border-2 border-parchment-400
                shadow-sm hover:shadow-md
                transition-all duration-300
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              <RotateCcw className="w-5 h-5 group-hover:rotate-[-360deg] transition-transform duration-500" />
              <span className="hidden sm:inline">重新开始</span>
            </button>
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-parchment-100/60 rounded-xl border border-parchment-300 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-ochre-600 flex-shrink-0 mt-0.5" />
              <p className="text-ochre-600/90 text-sm leading-relaxed font-sans">
                <strong>经典模式：</strong>从石器时代的部落开始，在每个关键的历史节点做出选择，
                引领你的文明走过认知革命、农业革命、帝国时代，最终到达科学革命的现代。
                每个选择都会影响文明的发展方向——人口、科技、文化、军事、农业，
                五维属性将记录你的文明特质。
              </p>
            </div>
          </div>

          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <Swords className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-blue-700/90 text-sm leading-relaxed font-sans">
                <strong>多文明竞争模式：</strong>与AI文明共同发展！贸易、战争、联盟、文化传播，
                每回合AI根据规则自动决策。你需要发展自己的文明，扩张领土，
                在世界舞台上与其他文明竞争，最终成为世界霸主！
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-parchment-300 border-t-ochre-500 rounded-full animate-spin mx-auto mb-6" />
        <h2 className="font-serif text-2xl text-ochre-700 mb-2">正在加载历史长河...</h2>
        <p className="text-ochre-500">准备好开启你的文明之旅</p>
      </div>
    </div>
  );
};

const ErrorScreen: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md bg-card-gradient rounded-2xl p-8 shadow-card border-2 border-red-300">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">⚠️</span>
        </div>
        <h2 className="font-serif text-2xl text-ochre-700 mb-3">出错了</h2>
        <p className="text-ochre-600 mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-ochre-500 text-white font-serif font-bold rounded-xl hover:bg-ochre-600 transition-colors"
        >
          重试
        </button>
      </div>
    </div>
  );
};

interface HomeProps {
  onEnterEncyclopedia: () => void;
  onEnterMultiCiv: () => void;
}

const Home: React.FC<HomeProps> = ({ onEnterEncyclopedia, onEnterMultiCiv }) => {
  const {
    init,
    isLoading,
    error,
    isComplete,
    isTransitioning,
    currentStage,
    stats,
    showFlavorText,
    showEventModal,
    showEventResult,
    checkForEvent,
  } = useCivilizationStore();
  const [previousStats, setPreviousStats] = useState<CivilizationStats | undefined>(undefined);
  const [previousFlavorText, setPreviousFlavorText] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (isTransitioning) {
      setPreviousStats(stats);
    }
  }, [isTransitioning, stats]);

  useEffect(() => {
    if (previousFlavorText && !showFlavorText && !isComplete && !showEventModal && !showEventResult) {
      const timer = setTimeout(() => {
        checkForEvent();
      }, 500);
      return () => clearTimeout(timer);
    }
    setPreviousFlavorText(showFlavorText);
  }, [showFlavorText, previousFlavorText, isComplete, showEventModal, showEventResult, checkForEvent]);

  if (isLoading && !currentStage) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={init} />;
  }

  const transitionColor = currentStage?.eraColor
    ? {
        stoneAge: '#757575',
        agricultural: '#558B2F',
        imperial: '#4A148C',
        scientific: '#0D47A1',
      }[currentStage.eraColor]
    : '#8B4513';

  return (
    <div className="min-h-screen">
      <Header onEnterEncyclopedia={onEnterEncyclopedia} onEnterMultiCiv={onEnterMultiCiv} />

      <main className="pb-16">
        <Timeline />

        <StatsPanel previousStats={previousStats} />

        {isComplete ? <CompletionScreen /> : <StageCard />}
      </main>

      <footer className="py-6 text-center text-ochre-500 text-sm border-t border-parchment-300">
        <p>
          基于尤瓦尔·赫拉利《人类简史》理念创作 · 选择决定命运
        </p>
      </footer>

      <TransitionOverlay isVisible={isTransitioning} color={transitionColor} />

      <FlavorTextModal />
      <EventCardModal />
      <EventResultModal />
    </div>
  );
};

export default Home;
