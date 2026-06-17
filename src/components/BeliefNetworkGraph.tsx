import React, { useMemo, useState } from 'react';
import type { WorldState, BeliefId } from '../types';
import { getBeliefNetworkData, getDominantBeliefs, BELIEFS, getBeliefById } from '../lib/beliefEngine';
import { Network, TrendingUp, Eye, Filter } from 'lucide-react';

interface BeliefNetworkGraphProps {
  worldState: WorldState;
}

type ViewMode = 'network' | 'beliefs';

const EDGE_COLORS: Record<string, string> = {
  trade: '#FF8F00',
  war: '#D32F2F',
  alliance: '#2E7D32',
  neutral: '#9E9E9E',
};

const EDGE_LABELS: Record<string, string> = {
  trade: '贸易',
  war: '战争',
  alliance: '同盟',
  neutral: '中立',
};

export function BeliefNetworkGraph({ worldState }: BeliefNetworkGraphProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('network');
  const [selectedBeliefFilter, setSelectedBeliefFilter] = useState<BeliefId | 'all'>('all');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const networkData = useMemo(() => getBeliefNetworkData(worldState), [worldState]);
  const dominantBeliefs = useMemo(() => getDominantBeliefs(worldState), [worldState]);

  const filteredNodes = useMemo(() => {
    if (selectedBeliefFilter === 'all') return networkData.nodes;
    return networkData.nodes.filter((n) =>
      n.beliefs.some((b) => b.beliefId === selectedBeliefFilter && b.infectionLevel >= 10)
    );
  }, [networkData, selectedBeliefFilter]);

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

  const filteredEdges = useMemo(() => {
    return networkData.edges.filter(
      (e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
    );
  }, [networkData, filteredNodeIds]);

  const svgWidth = 600;
  const svgHeight = 600;

  const getNodeRadius = (node: (typeof networkData.nodes)[0]) => {
    const baseSize = 28;
    const beliefBonus = node.beliefs.filter((b) => b.infectionLevel >= 30).length * 3;
    return baseSize + beliefBonus;
  };

  const getInfectionColor = (level: number) => {
    if (level >= 80) return '#D32F2F';
    if (level >= 50) return '#FF6D00';
    if (level >= 30) return '#FFA000';
    if (level >= 10) return '#FFD54F';
    return '#E0E0E0';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-slate-800">信念传播网络</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('network')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                viewMode === 'network'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-1" />
              网络图
            </button>
            <button
              onClick={() => setViewMode('beliefs')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                viewMode === 'beliefs'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-1" />
              信念态势
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={selectedBeliefFilter}
            onChange={(e) => setSelectedBeliefFilter(e.target.value as BeliefId | 'all')}
            className="text-sm border border-slate-300 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="all">全部信念</option>
            {BELIEFS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.icon} {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {viewMode === 'network' ? (
        <div className="p-4">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto"
            style={{ maxHeight: '500px' }}
          >
            <defs>
              <marker
                id="arrow-trade"
                viewBox="0 0 10 6"
                refX="10"
                refY="3"
                markerWidth="8"
                markerHeight="6"
                orient="auto"
              >
                <path d="M0,0 L10,3 L0,6 Z" fill="#FF8F00" />
              </marker>
              <marker
                id="arrow-war"
                viewBox="0 0 10 6"
                refX="10"
                refY="3"
                markerWidth="8"
                markerHeight="6"
                orient="auto"
              >
                <path d="M0,0 L10,3 L0,6 Z" fill="#D32F2F" />
              </marker>
              <marker
                id="arrow-alliance"
                viewBox="0 0 10 6"
                refX="10"
                refY="3"
                markerWidth="8"
                markerHeight="6"
                orient="auto"
              >
                <path d="M0,0 L10,3 L0,6 Z" fill="#2E7D32" />
              </marker>
              <marker
                id="arrow-neutral"
                viewBox="0 0 10 6"
                refX="10"
                refY="3"
                markerWidth="8"
                markerHeight="6"
                orient="auto"
              >
                <path d="M0,0 L10,3 L0,6 Z" fill="#9E9E9E" />
              </marker>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {filteredEdges.map((edge, i) => {
              const sourceNode = networkData.nodes.find((n) => n.id === edge.source);
              const targetNode = networkData.nodes.find((n) => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              const dx = targetNode.x - sourceNode.x;
              const dy = targetNode.y - sourceNode.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const sourceR = getNodeRadius(sourceNode);
              const targetR = getNodeRadius(targetNode);

              const startX = sourceNode.x + (dx / dist) * sourceR;
              const startY = sourceNode.y + (dy / dist) * sourceR;
              const endX = targetNode.x - (dx / dist) * (targetR + 8);
              const endY = targetNode.y - (dy / dist) * (targetR + 8);

              const isHighlighted =
                hoveredNode === edge.source || hoveredNode === edge.target;
              const opacity = hoveredNode ? (isHighlighted ? 0.8 : 0.15) : 0.4;

              return (
                <g key={`edge-${i}`}>
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke={EDGE_COLORS[edge.type]}
                    strokeWidth={edge.beliefFlows.length > 0 ? 2.5 : 1.5}
                    strokeDasharray={edge.type === 'war' ? '6,3' : undefined}
                    opacity={opacity}
                    markerEnd={`url(#arrow-${edge.type})`}
                  />
                  {edge.beliefFlows.slice(0, 2).map((flow, fi) => {
                    const belief = getBeliefById(flow.beliefId);
                    if (!belief) return null;
                    const midX = (startX + endX) / 2;
                    const midY = (startY + endY) / 2;
                    const offset = (fi - 0.5) * 12;
                    return (
                      <g key={`flow-${i}-${fi}`}>
                        <circle
                          cx={midX + offset}
                          cy={midY - 8}
                          r={4 + flow.strength * 6}
                          fill={belief.color}
                          opacity={hoveredNode ? (isHighlighted ? 0.7 : 0.1) : 0.5}
                        />
                        <text
                          x={midX + offset}
                          y={midY - 8}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="8"
                          opacity={hoveredNode ? (isHighlighted ? 1 : 0.2) : 0.8}
                        >
                          {belief.icon}
                        </text>
                      </g>
                    );
                  })}
                  {isHighlighted && (
                    <text
                      x={(startX + endX) / 2}
                      y={(startY + endY) / 2 + 14}
                      textAnchor="middle"
                      fontSize="9"
                      fill={EDGE_COLORS[edge.type]}
                      fontWeight="bold"
                    >
                      {EDGE_LABELS[edge.type]}
                      {edge.beliefFlows.length > 0 &&
                        ` · ${edge.beliefFlows
                          .map((f) => getBeliefById(f.beliefId)?.name)
                          .join('→')}传播中`}
                    </text>
                  )}
                </g>
              );
            })}

            {filteredNodes.map((node) => {
              const r = getNodeRadius(node);
              const isHovered = hoveredNode === node.id;
              const isPlayer = node.id === worldState.playerCivilizationId;
              const civ = worldState.civilizations.find((c) => c.id === node.id);

              return (
                <g
                  key={node.id}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={r + (isHovered ? 6 : 0)}
                    fill={node.color + '30'}
                    stroke={node.color}
                    strokeWidth={isPlayer ? 3 : 2}
                    filter={isHovered ? 'url(#glow)' : undefined}
                  />

                  {node.beliefs
                    .filter((b) => b.infectionLevel >= 10)
                    .sort((a, b) => b.infectionLevel - a.infectionLevel)
                    .slice(0, 4)
                    .map((belief, bi) => {
                      const beliefData = getBeliefById(belief.beliefId);
                      if (!beliefData) return null;
                      const angle = (2 * Math.PI * bi) / Math.min(4, node.beliefs.filter((b) => b.infectionLevel >= 10).length) - Math.PI / 2;
                      const orbitR = r + 10;
                      const bx = node.x + orbitR * Math.cos(angle);
                      const by = node.y + orbitR * Math.sin(angle);
                      return (
                        <g key={`belief-${bi}`}>
                          <circle
                            cx={bx}
                            cy={by}
                            r={5 + (belief.infectionLevel / 100) * 4}
                            fill={beliefData.color}
                            opacity={isHovered ? 0.9 : 0.6}
                            stroke="#fff"
                            strokeWidth={1}
                          />
                          <text
                            x={bx}
                            y={by}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="7"
                          >
                            {beliefData.icon}
                          </text>
                        </g>
                      );
                    })}

                  <text
                    x={node.x}
                    y={node.y - 4}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="11"
                    fontWeight="bold"
                    fill={isPlayer ? '#1E88E5' : '#333'}
                  >
                    {civ?.name?.slice(0, 4) || node.name.slice(0, 4)}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 10}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="8"
                    fill="#666"
                  >
                    {node.beliefs.filter((b) => b.infectionLevel >= 30).length} 信念
                  </text>

                  {isHovered && (
                    <g>
                      <rect
                        x={node.x - 80}
                        y={node.y - r - 70}
                        width={160}
                        height={60}
                        rx={8}
                        fill="white"
                        stroke="#e2e8f0"
                        strokeWidth={1}
                        opacity={0.95}
                      />
                      <text
                        x={node.x}
                        y={node.y - r - 55}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="bold"
                        fill="#333"
                      >
                        {node.name}
                      </text>
                      {node.beliefs
                        .filter((b) => b.infectionLevel >= 10)
                        .slice(0, 3)
                        .map((b, i) => {
                          const bd = getBeliefById(b.beliefId);
                          return (
                            <text
                              key={i}
                              x={node.x - 70}
                              y={node.y - r - 40 + i * 12}
                              fontSize="9"
                              fill={bd?.color || '#666'}
                            >
                              {bd?.icon} {bd?.name}: {b.infectionLevel}%
                            </text>
                          );
                        })}
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          <div className="flex flex-wrap gap-3 mt-3 px-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="w-3 h-0.5 bg-amber-600 inline-block" />
              贸易
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="w-3 h-0.5 bg-red-600 inline-block" style={{ borderTop: '2px dashed #D32F2F' }} />
              战争
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="w-3 h-0.5 bg-green-700 inline-block" />
              同盟
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="w-3 h-0.5 bg-gray-400 inline-block" />
              中立
            </div>
            <span className="text-xs text-slate-400">|</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
              信念流动
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="space-y-3">
            {dominantBeliefs.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">尚无信念传播发生</p>
            ) : (
              dominantBeliefs.map((db) => {
                const belief = getBeliefById(db.beliefId);
                if (!belief) return null;
                const maxInfection = worldState.civilizations
                  .filter((c) => c.territory.length > 0)
                  .reduce((max, c) => {
                    const inf = c.beliefs.find((b) => b.beliefId === db.beliefId);
                    return inf && inf.infectionLevel > max ? inf.infectionLevel : max;
                  }, 0);
                const isExpanding = maxInfection >= 30;
                const aliveCivCount = worldState.civilizations.filter(
                  (c) => c.territory.length > 0
                ).length;
                const spreadPercent = Math.round((db.civCount / aliveCivCount) * 100);

                return (
                  <div
                    key={db.beliefId}
                    className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{belief.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm">{belief.name}</span>
                            {isExpanding && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-0.5">
                                <TrendingUp className="w-3 h-3" />
                                扩张中
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">{belief.description}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-700">{db.civCount} 文明</div>
                        <div className="text-xs text-slate-500">覆盖 {spreadPercent}%</div>
                      </div>
                    </div>

                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${spreadPercent}%`,
                          backgroundColor: belief.color,
                        }}
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {worldState.civilizations
                        .filter((c) => c.territory.length > 0)
                        .map((civ) => {
                          const inf = civ.beliefs.find((b) => b.beliefId === db.beliefId);
                          if (!inf || inf.infectionLevel < 5) return null;
                          return (
                            <div
                              key={civ.id}
                              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                              style={{
                                backgroundColor: getInfectionColor(inf.infectionLevel) + '20',
                                color: getInfectionColor(inf.infectionLevel),
                              }}
                            >
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: civ.color }}
                              />
                              <span className="font-medium">{civ.name.slice(0, 4)}</span>
                              <span className="font-bold">{inf.infectionLevel}%</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl">
            <h4 className="text-xs font-semibold text-slate-600 mb-2">传播机制说明</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <span className="text-amber-600 font-bold">贸易</span>
                <span>→ 消费主义、世界主义易传播</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-red-600 font-bold">战争</span>
                <span>→ 军国主义、威权主义易传播</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-blue-600 font-bold">科技</span>
                <span>→ 科技乌托邦易传播</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-600 font-bold">人口流动</span>
                <span>→ 平等主义、孤立主义易传播</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
