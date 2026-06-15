import { useMemo } from 'react';
import { useEncyclopediaStore } from '../store/useEncyclopediaStore';
import { QuizSection } from './QuizSection';
import { ERA_BORDER_COLORS, ERA_TEXT_COLORS } from '../types';

export function KnowledgeNodeDetail() {
  const {
    currentNode,
    tags,
    showQuiz,
    setShowQuiz,
    toggleFavorite,
    isFavorite,
    loadNode,
    goBack,
    isLoading,
    nodes,
  } = useEncyclopediaStore();

  const tagMap = useMemo(() => {
    return new Map(tags.map(t => [t.id, t]));
  }, [tags]);

  const relatedNodes = useMemo(() => {
    if (!currentNode) return [];
    return currentNode.relatedNodes
      .map(id => nodes.find(n => n.id === id))
      .filter(Boolean);
  }, [currentNode, nodes]);

  if (isLoading && !currentNode) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full" />
      </div>
    );
  }

  if (!currentNode) {
    return (
      <div className="text-center py-16 text-slate-500">
        未找到该知识点
      </div>
    );
  }

  const eraColorClass = ERA_BORDER_COLORS[currentNode.eraColor] || 'border-slate-400';
  const eraTextClass = ERA_TEXT_COLORS[currentNode.eraColor] || 'text-slate-600';
  const isFav = isFavorite(currentNode.id);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goBack}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回列表
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleFavorite(currentNode.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isFav
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <svg className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {isFav ? '已收藏' : '收藏'}
          </button>
          <button
            onClick={() => setShowQuiz(!showQuiz)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              showQuiz
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            {showQuiz ? '隐藏测验' : '开始测验'}
          </button>
        </div>
      </div>

      <article className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
        <div className="relative h-64 md:h-80">
          <img
            src={currentNode.imageUrl}
            alt={currentNode.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 border-l-4 ${eraColorClass} bg-white/90 ${eraTextClass}`}>
              {currentNode.era}
            </span>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
              {currentNode.title}
            </h1>
            <p className="text-white/80 text-sm md:text-base">
              {currentNode.subtitle}
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap gap-2 mb-6">
            {currentNode.tags.map(tagId => {
              const tag = tagMap.get(tagId);
              if (!tag) return null;
              return (
                <span
                  key={tagId}
                  className="px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: tag.color }}
                  title={tag.description}
                >
                  {tag.name}
                </span>
              );
            })}
          </div>

          <div className="prose prose-slate max-w-none mb-8">
            <p className="text-lg text-slate-600 font-medium border-l-4 border-slate-300 pl-4 py-1 mb-6 bg-slate-50">
              {currentNode.summary}
            </p>

            {currentNode.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-slate-700 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="bg-slate-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">✨ 核心洞察</h3>
            <ul className="space-y-3">
              {currentNode.keyInsights.map((insight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    {index + 1}
                  </span>
                  <span className="text-slate-700 pt-0.5">{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {relatedNodes.length > 0 && (
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">🔗 相关知识点</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedNodes.map(node => node && (
                  <button
                    key={node.id}
                    onClick={() => loadNode(node.id)}
                    className={`text-left p-4 rounded-xl border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all group ${ERA_BORDER_COLORS[node.eraColor] || 'border-slate-200'}`}
                  >
                    <span className={`text-xs font-medium ${ERA_TEXT_COLORS[node.eraColor] || 'text-slate-500'}`}>
                      {node.era}
                    </span>
                    <h4 className="font-semibold text-slate-800 mt-1 group-hover:text-slate-900">
                      {node.title}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      {node.summary}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {showQuiz && (
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <QuizSection nodeId={currentNode.id} />
        </div>
      )}
    </div>
  );
}
