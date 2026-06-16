import { useState, useMemo, useRef } from 'react';
import { useEncyclopediaStore } from '../store/useEncyclopediaStore';
import type { GraphNode, GraphEdge } from '../types';

export function KnowledgeGraph() {
  const { graph, nodes, loadNode, goBack } = useEncyclopediaStore();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const viewBox = useMemo(() => {
    if (!graph) return '0 0 800 500';
    const xs = graph.nodes.map(n => n.x);
    const ys = graph.nodes.map(n => n.y);
    const minX = Math.min(...xs) - 50;
    const maxX = Math.max(...xs) + 50;
    const minY = Math.min(...ys) - 50;
    const maxY = Math.max(...ys) + 50;
    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  }, [graph]);

  const nodeMap = useMemo(() => {
    if (!graph) return new Map<string, GraphNode>();
    return new Map(graph.nodes.map(n => [n.id, n]));
  }, [graph]);

  const fullNodeMap = useMemo(() => {
    return new Map(nodes.map(n => [n.id, n]));
  }, [nodes]);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
    loadNode(nodeId);
  };

  if (!graph) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full" />
      </div>
    );
  }

  const getNodeDetail = (nodeId: string) => {
    return fullNodeMap.get(nodeId);
  };

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
          返回
        </button>
        <h2 className="text-2xl font-bold text-slate-800">🕸️ 知识关系图谱</h2>
        <div className="w-24" />
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
        <div className="flex items-center justify-center gap-6 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#757575' }} />
            <span className="text-slate-600">认知革命</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#558B2F' }} />
            <span className="text-slate-600">农业革命</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#4A148C' }} />
            <span className="text-slate-600">帝国时代</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#0D47A1' }} />
            <span className="text-slate-600">科学革命</span>
          </div>
        </div>

        <svg
          viewBox={viewBox}
          className="w-full h-[500px] cursor-move"
          style={{ touchAction: 'none' }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#94A3B8" />
            </marker>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3" />
            </filter>
          </defs>

          {graph.edges.map((edge: GraphEdge, index: number) => {
            const source = nodeMap.get(edge.source);
            const target = nodeMap.get(edge.target);
            if (!source || !target) return null;

            const isHighlighted =
              (hoveredNode && (edge.source === hoveredNode || edge.target === hoveredNode)) ||
              (selectedNode && (edge.source === selectedNode || edge.target === selectedNode));

            return (
              <g key={`edge-${index}`}>
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={isHighlighted ? '#1E293B' : '#CBD5E1'}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  opacity={hoveredNode || selectedNode ? (isHighlighted ? 1 : 0.3) : 1}
                  className="transition-all duration-300"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            );
          })}

          {graph.nodes.map((node: GraphNode) => {
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode === node.id;
            const hasRelation = hoveredNode && graph.edges.some(
              e => (e.source === hoveredNode && e.target === node.id) ||
                   (e.target === hoveredNode && e.source === node.id)
            );
            const shouldShow = !hoveredNode || isHovered || hasRelation;

            const handleMouseEnter = () => {
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
              }
              setHoveredNode(node.id);
            };

            const handleMouseLeave = () => {
              hoverTimeoutRef.current = setTimeout(() => {
                setHoveredNode(null);
              }, 200);
            };

            const handlePopupMouseEnter = () => {
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
              }
            };

            const handlePopupMouseLeave = () => {
              setHoveredNode(null);
            };

            return (
              <g
                key={node.id}
                className="cursor-pointer"
                onClick={() => handleNodeClick(node.id)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{
                  opacity: shouldShow ? 1 : 0.3,
                  transition: 'all 0.3s ease',
                }}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHovered || isSelected ? node.size + 4 : node.size}
                  fill={node.color}
                  filter="url(#shadow)"
                  className="transition-all duration-300"
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  stroke="#000"
                  strokeWidth="0.5"
                  paintOrder="stroke"
                  fontSize={isHovered || isSelected ? 11 : 10}
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {node.label}
                </text>

                {isHovered && (
                  <g
                    onMouseEnter={handlePopupMouseEnter}
                    onMouseLeave={handlePopupMouseLeave}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNodeClick(node.id);
                    }}
                    className="cursor-pointer"
                  >
                    <rect
                      x={node.x - 90}
                      y={node.y + node.size + 10}
                      width="180"
                      height="50"
                      rx="8"
                      fill="white"
                      stroke="#E2E8F0"
                      strokeWidth="1"
                      filter="url(#shadow)"
                    />
                    <text
                      x={node.x}
                      y={node.y + node.size + 30}
                      textAnchor="middle"
                      fill="#1E293B"
                      fontSize="12"
                      fontWeight="600"
                    >
                      {getNodeDetail(node.id)?.title || node.id}
                    </text>
                    <text
                      x={node.x}
                      y={node.y + node.size + 48}
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize="10"
                    >
                      点击查看详情 →
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-amber-800 text-sm">
          💡 <strong>提示：</strong>将鼠标悬停在节点上可以看到详情，点击节点可以跳转到对应的知识页面。
          连线表示概念之间的关联关系，节点大小表示该知识点的关联度。
        </p>
      </div>
    </div>
  );
}
