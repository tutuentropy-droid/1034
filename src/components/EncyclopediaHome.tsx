import { useEffect, useMemo } from 'react';
import { useEncyclopediaStore } from '../store/useEncyclopediaStore';
import { TagFilter } from './TagFilter';
import type { KnowledgeNode, Tag } from '../types';
import { ERA_BORDER_COLORS, ERA_TEXT_COLORS } from '../types';

interface EncyclopediaHomeProps {
  onExit: () => void;
}

export function EncyclopediaHome({ onExit }: EncyclopediaHomeProps) {
  const {
    init,
    nodes,
    allNodes,
    tags,
    isLoading,
    error,
    loadNode,
    loadGraph,
    setCurrentView,
    toggleFavorite,
    isFavorite,
    currentView,
    favorites,
  } = useEncyclopediaStore();

  useEffect(() => {
    init();
  }, [init]);

  const favoriteNodeIds = useMemo(() => {
    return new Set(favorites.map(f => f.knowledgeNodeId));
  }, [favorites]);

  const displayNodes = useMemo(() => {
    if (currentView === 'favorites') {
      return allNodes.filter(n => favoriteNodeIds.has(n.id));
    }
    return nodes;
  }, [nodes, allNodes, currentView, favoriteNodeIds]);

  const tagMap = useMemo(() => {
    return new Map(tags.map((t: Tag) => [t.id, t]));
  }, [tags]);

  if (isLoading && nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-500">
        <p className="text-lg">{error}</p>
        <button
          onClick={init}
          className="mt-4 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          重试
        </button>
      </div>
    );
  }

  const viewTitle = currentView === 'favorites' ? '📚 我的收藏' : '📖 人类简史百科';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回游戏
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{viewTitle}</h1>
        <div className="w-24" />
      </div>

      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 md:p-8 mb-6 text-white">
        <h2 className="text-xl md:text-2xl font-bold mb-2">探索人类文明的演变</h2>
        <p className="text-white/80 mb-4 max-w-2xl">
          基于尤瓦尔·赫拉利《人类简史》的核心观点，深入理解人类如何从狩猎采集者走向现代文明，
          以及虚构故事、农业革命、货币、宗教、科学等如何塑造了我们的世界。
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={loadGraph}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-800 rounded-xl font-medium hover:bg-slate-100 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            知识关系图谱
          </button>
          <button
            onClick={() => setCurrentView(currentView === 'favorites' ? 'home' : 'favorites')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
              currentView === 'favorites'
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <svg className="w-5 h-5" fill={currentView === 'favorites' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {currentView === 'favorites' ? '查看全部' : `我的收藏 (${favoriteNodeIds.size})`}
          </button>
        </div>
      </div>

      {currentView !== 'favorites' && <TagFilter />}

      {currentView === 'favorites' && displayNodes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">还没有收藏</h3>
          <p className="text-slate-500 mb-6">点击知识点卡片上的星星图标来收藏你感兴趣的内容</p>
          <button
            onClick={() => setCurrentView('home')}
            className="px-6 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-all"
          >
            浏览知识点
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayNodes.map((node: KnowledgeNode) => {
            const isFav = isFavorite(node.id);
            const eraColorClass = ERA_BORDER_COLORS[node.eraColor] || 'border-slate-400';
            const eraTextClass = ERA_TEXT_COLORS[node.eraColor] || 'text-slate-600';

            return (
              <div
                key={node.id}
                className={`group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border-t-4 ${eraColorClass} relative`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(node.id);
                  }}
                  className={`absolute top-3 right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isFav
                      ? 'bg-amber-100 text-amber-500'
                      : 'bg-white/80 text-slate-400 hover:bg-white hover:text-amber-500'
                  }`}
                >
                  <svg className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>

                <button
                  onClick={() => loadNode(node.id)}
                  className="w-full text-left"
                >
                  <div className="h-40 overflow-hidden">
                    <img
                      src={node.imageUrl}
                      alt={node.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-medium ${eraTextClass}`}>
                        {node.era}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500">
                        {node.quizIds.length} 道测验
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-slate-900 line-clamp-1">
                      {node.title}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                      {node.summary}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {node.tags.slice(0, 3).map(tagId => {
                        const tag = tagMap.get(tagId);
                        if (!tag) return null;
                        return (
                          <span
                            key={tagId}
                            className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: tag.color }}
                          >
                            {tag.name}
                          </span>
                        );
                      })}
                      {node.tags.length > 3 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
                          +{node.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 flex items-center gap-1">
                      阅读全文
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
