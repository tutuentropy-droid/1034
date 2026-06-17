import React from 'react';
import { useCivilizationStore } from '../store/useCivilizationStore';
import { STAT_LABELS, type CivilizationStats } from '../types';
import CivilizationMuseum from './CivilizationMuseum';
import {
  Trophy,
  RotateCcw,
  Users,
  FlaskConical,
  BookOpen,
  Sword,
  Wheat,
  History,
  Star,
  Building2,
} from 'lucide-react';

const STAT_ICONS = {
  population: Users,
  technology: FlaskConical,
  culture: BookOpen,
  military: Sword,
  agriculture: Wheat,
};

const ACHIEVEMENTS = [
  { key: 'population', threshold: 80, title: '人丁兴旺', description: '人口突破80大关' },
  { key: 'technology', threshold: 80, title: '科技先驱', description: '科技突破80大关' },
  { key: 'culture', threshold: 80, title: '文化昌盛', description: '文化突破80大关' },
  { key: 'military', threshold: 80, title: '军事强国', description: '军事突破80大关' },
  { key: 'agriculture', threshold: 80, title: '农业大国', description: '农业突破80大关' },
];

const CompletionScreen: React.FC = () => {
  const { stats, civilizationName, history, reset, openMuseum, showMuseum, museumReport, closeMuseum } = useCivilizationStore();

  const totalScore = Object.values(stats).reduce((sum, val) => sum + val, 0);
  const unlockedAchievements = ACHIEVEMENTS.filter(
    (a) => stats[a.key as keyof CivilizationStats] >= a.threshold
  );

  const getCivilizationType = () => {
    const maxStat = Object.entries(stats).reduce(
      (max, [key, value]) => (value > max.value ? { key, value } : max),
      { key: 'population', value: 0 }
    );

    const types: Record<string, { title: string; description: string }> = {
      population: {
        title: '繁衍型文明',
        description: '你的文明以庞大的人口著称，人丁兴旺，生生不息。',
      },
      technology: {
        title: '科技型文明',
        description: '你的文明崇尚理性与探索，科技之光引领未来。',
      },
      culture: {
        title: '文化型文明',
        description: '你的文明以灿烂的文化艺术闻名于世，影响深远。',
      },
      military: {
        title: '军事型文明',
        description: '你的文明以强大的军事力量开疆拓土，威震四方。',
      },
      agriculture: {
        title: '农耕型文明',
        description: '你的文明以农为本，五谷丰登，国泰民安。',
      },
    };

    return types[maxStat.key];
  };

  const civilizationType = getCivilizationType();

  return (
    <>
      <div className="w-full max-w-5xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full mb-6 shadow-2xl">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="font-serif text-5xl font-bold text-ochre-700 mb-4">
            文明历程完成！
          </h1>
          <p className="text-xl text-ochre-600 font-serif">
            「{civilizationName}」的传奇故事已经书写完成
          </p>
        </div>

        <div className="bg-card-gradient rounded-3xl shadow-card border-4 border-gold-400/50 p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl font-bold text-ochre-700 mb-2">
              {civilizationType.title}
            </h2>
            <p className="text-ochre-600 text-lg">{civilizationType.description}</p>
            <div className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-400 text-white rounded-full font-serif font-bold text-xl shadow-lg">
              <Star className="w-6 h-6" />
              综合评分: {totalScore}
              <Star className="w-6 h-6" />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 mb-8">
            {(Object.keys(stats) as (keyof CivilizationStats)[]).map((key) => (
              <div
                key={key}
                className="flex flex-col items-center p-4 bg-parchment-100/80 rounded-xl border-2 border-parchment-300"
              >
                <div className="w-12 h-12 rounded-full bg-parchment-200 flex items-center justify-center text-ochre-600 mb-2">
                  {React.createElement(STAT_ICONS[key], { className: 'w-6 h-6' })}
                </div>
                <p className="text-sm text-ochre-600 font-medium">{STAT_LABELS[key]}</p>
                <p className="text-3xl font-serif font-bold text-ochre-700">{stats[key]}</p>
              </div>
            ))}
          </div>

          {unlockedAchievements.length > 0 && (
            <div className="mb-8">
              <h3 className="font-serif text-2xl font-bold text-ochre-700 mb-4 text-center">
                解锁成就
              </h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {unlockedAchievements.map((achievement) => (
                  <div
                    key={achievement.key}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-100 to-gold-200 rounded-full border-2 border-gold-400"
                  >
                    <Trophy className="w-5 h-5 text-gold-600" />
                    <div>
                      <p className="font-bold text-ochre-700 text-sm">{achievement.title}</p>
                      <p className="text-xs text-ochre-600">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-serif text-2xl font-bold text-ochre-700 mb-4 text-center">
              历史轨迹
            </h3>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-stoneAge via-agricultural via-imperial to-scientific" />
              <div className="space-y-4">
                {history.map((entry, index) => (
                  <div key={index} className="relative pl-14">
                    <div
                      className="absolute left-4 top-1 w-5 h-5 rounded-full border-3 border-white"
                      style={{
                        backgroundColor:
                          index === 0
                            ? '#757575'
                            : index === 1
                            ? '#558B2F'
                            : index === 2
                            ? '#4A148C'
                            : '#0D47A1',
                      }}
                    />
                    <div className="bg-parchment-100/80 rounded-xl p-4 border-2 border-parchment-300">
                      <div className="flex items-center gap-2 mb-1">
                        <History className="w-4 h-4 text-ochre-500" />
                        <span className="text-sm text-ochre-500 font-medium">
                          {entry.stageTitle}
                        </span>
                      </div>
                      <p className="text-ochre-700 font-medium">选择：{entry.choiceTitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={openMuseum}
            className="
              group flex items-center justify-center gap-3 px-8 py-4
              bg-gradient-to-r from-slate-800 to-slate-900
              text-white font-serif text-xl font-bold
              rounded-2xl shadow-lg
              hover:shadow-xl
              hover:from-slate-700 hover:to-slate-800
              transition-all duration-300
              hover:-translate-y-1
              active:translate-y-0
            "
          >
            <Building2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span>进入文明博物馆</span>
          </button>

          <button
            onClick={reset}
            className="
              group flex items-center justify-center gap-3 px-8 py-4
              bg-gradient-to-r from-ochre-500 to-ochre-600
              text-white font-serif text-xl font-bold
              rounded-2xl shadow-button
              hover:shadow-button-hover
              hover:from-ochre-600 hover:to-ochre-700
              transition-all duration-300
              hover:-translate-y-1
              active:translate-y-0
            "
          >
            <RotateCcw className="w-6 h-6 group-hover:rotate-[-360deg] transition-transform duration-500" />
            <span>开启新的文明之旅</span>
          </button>
        </div>
      </div>

      {showMuseum && museumReport && (
        <CivilizationMuseum report={museumReport} onClose={closeMuseum} />
      )}
    </>
  );
};

export default CompletionScreen;
