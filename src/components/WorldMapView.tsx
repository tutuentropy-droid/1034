import { useMemo, useState, useEffect } from 'react';
import type { WorldState, MapTile, TileTerrain, AICivilization, TerritoryExpansion, EraStage } from '../types';
import { useWorldStore } from '../store/useWorldStore';
import { Users, FlaskConical, BookOpen, Sword, Wheat, Crown, Castle, Zap } from 'lucide-react';

const TERRAIN_COLORS: Record<TileTerrain, string> = {
  plains: '#8BC34A',
  forest: '#2E7D32',
  mountain: '#78909C',
  desert: '#FFE082',
  coast: '#4FC3F7',
  river: '#29B6F6',
  tundra: '#ECEFF1',
};

const TERRAIN_ICONS: Record<TileTerrain, string> = {
  plains: '🌾',
  forest: '🌲',
  mountain: '⛰️',
  desert: '🏜️',
  coast: '🌊',
  river: '💧',
  tundra: '❄️',
};

const ERA_COLORS: Record<EraStage, string> = {
  stoneAge: '#757575',
  agricultural: '#558B2F',
  imperial: '#4A148C',
  scientific: '#0D47A1',
};

interface WorldMapViewProps {
  worldState: WorldState;
}

export function WorldMapView({ worldState }: WorldMapViewProps) {
  const { selectCivilization, selectedCivilization } = useWorldStore();
  const [hoveredTile, setHoveredTile] = useState<MapTile | null>(null);
  const [animatingExpansions, setAnimatingExpansions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (worldState.recentExpansions.length > 0) {
      const newExpansionIds = new Set(worldState.recentExpansions.map(e => e.tileId));
      setAnimatingExpansions(newExpansionIds);
      const timer = setTimeout(() => {
        setAnimatingExpansions(new Set());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [worldState.turn]);

  const civColorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const civ of worldState.civilizations) {
      map.set(civ.id, civ.color);
    }
    return map;
  }, [worldState.civilizations]);

  const civNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const civ of worldState.civilizations) {
      map.set(civ.id, civ.name);
    }
    return map;
  }, [worldState.civilizations]);

  const civEraMap = useMemo(() => {
    const map = new Map<string, EraStage>();
    for (const civ of worldState.civilizations) {
      map.set(civ.id, civ.era);
    }
    return map;
  }, [worldState.civilizations]);

  const getCivById = (id: string): AICivilization | undefined => {
    return worldState.civilizations.find((c) => c.id === id);
  };

  const TILE_SIZE = 44;
  const GAP = 2;

  const mapWidth = worldState.map.width * (TILE_SIZE + GAP);
  const mapHeight = worldState.map.height * (TILE_SIZE + GAP);

  const playerCiv = worldState.civilizations.find(c => c.id === worldState.playerCivilizationId);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          🌍 世界地图
        </h3>
        <div className="text-sm text-slate-600">
          第 <span className="font-bold text-blue-600">{worldState.turn}</span> 回合
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        {worldState.civilizations
          .filter((c) => c.territory.length > 0)
          .sort((a, b) => {
            const aRank = worldState.rankings.find(r => r.civilizationId === a.id);
            const bRank = worldState.rankings.find(r => r.civilizationId === b.id);
            return (aRank?.rank || 99) - (bRank?.rank || 99);
          })
          .map((civ) => {
            const rank = worldState.rankings.find(r => r.civilizationId === civ.id);
            const isSelected = selectedCivilization?.id === civ.id;
            return (
              <button
                key={civ.id}
                onClick={() => selectCivilization(isSelected ? null : civ)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-slate-800 bg-slate-100 shadow-md'
                    : 'border-transparent hover:bg-slate-50'
                }`}
              >
                <span className="text-sm font-bold text-slate-400">
                  #{rank?.rank || '?'}
                </span>
                <span
                  className="w-4 h-4 rounded-full border border-slate-300"
                  style={{ backgroundColor: civ.color }}
                />
                <span className={`font-medium ${civ.id === worldState.playerCivilizationId ? 'text-blue-600' : 'text-slate-700'}`}>
                  {civ.name}
                  {civ.id === worldState.playerCivilizationId && ' (你)'}
                </span>
                <span className="text-slate-500">({civ.territory.length})</span>
                <span
                  className="px-1.5 py-0.5 rounded text-white text-xs font-medium"
                  style={{ backgroundColor: ERA_COLORS[civ.era], fontSize: '10px' }}
                >
                  {civ.era === 'stoneAge' ? '石器' : civ.era === 'agricultural' ? '农业' : civ.era === 'imperial' ? '帝国' : '科学'}
                </span>
              </button>
            );
          })}
      </div>

      <div className="overflow-auto pb-2">
        <svg
          width={mapWidth}
          height={mapHeight}
          className="mx-auto rounded-xl bg-slate-100"
          style={{ minWidth: mapWidth }}
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="expansionGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {worldState.map.tiles.map((tile) => {
            const ownerColor = tile.ownerId ? civColorMap.get(tile.ownerId) : null;
            const isSelected = selectedCivilization && tile.ownerId === selectedCivilization.id;
            const isPlayerOwned = tile.ownerId === worldState.playerCivilizationId;
            const isAnimating = animatingExpansions.has(tile.id);

            return (
              <g key={tile.id}>
                <rect
                  x={tile.x * (TILE_SIZE + GAP)}
                  y={tile.y * (TILE_SIZE + GAP)}
                  width={TILE_SIZE}
                  height={TILE_SIZE}
                  fill={ownerColor || TERRAIN_COLORS[tile.terrain]}
                  stroke={isSelected ? '#1E293B' : isPlayerOwned ? '#1E88E5' : 'transparent'}
                  strokeWidth={isSelected ? 3 : isPlayerOwned ? 2 : 0}
                  rx={4}
                  className="cursor-pointer transition-all duration-300"
                  opacity={ownerColor ? 0.85 : 0.7}
                  onMouseEnter={() => setHoveredTile(tile)}
                  onMouseLeave={() => setHoveredTile(null)}
                  onClick={() => {
                    if (tile.ownerId) {
                      const civ = getCivById(tile.ownerId);
                      if (civ) {
                        selectCivilization(selectedCivilization?.id === civ.id ? null : civ);
                      }
                    }
                  }}
                />

                {isAnimating && ownerColor && (
                  <>
                    <rect
                      x={tile.x * (TILE_SIZE + GAP) - 2}
                      y={tile.y * (TILE_SIZE + GAP) - 2}
                      width={TILE_SIZE + 4}
                      height={TILE_SIZE + 4}
                      fill="none"
                      stroke={ownerColor}
                      strokeWidth={3}
                      rx={6}
                      opacity={0.8}
                      filter="url(#expansionGlow)"
                    >
                      <animate
                        attributeName="opacity"
                        values="0.8;0.2;0.8"
                        dur="0.8s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="strokeWidth"
                        values="3;5;3"
                        dur="0.8s"
                        repeatCount="indefinite"
                      />
                    </rect>
                    <circle
                      cx={tile.x * (TILE_SIZE + GAP) + TILE_SIZE / 2}
                      cy={tile.y * (TILE_SIZE + GAP) + TILE_SIZE / 2}
                      r={TILE_SIZE / 2}
                      fill={ownerColor}
                      opacity={0.3}
                    >
                      <animate
                        attributeName="r"
                        values={`${TILE_SIZE / 2};${TILE_SIZE};${TILE_SIZE / 2}`}
                        dur="1.5s"
                        repeatCount="1"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.3;0;0"
                        dur="1.5s"
                        repeatCount="1"
                      />
                    </circle>
                  </>
                )}

                {tile.isCapital && (
                  <text
                    x={tile.x * (TILE_SIZE + GAP) + TILE_SIZE / 2}
                    y={tile.y * (TILE_SIZE + GAP) + TILE_SIZE / 2 + 4}
                    textAnchor="middle"
                    fontSize="18"
                    className="pointer-events-none"
                    filter="url(#glow)"
                  >
                    👑
                  </text>
                )}
                {!ownerColor && !tile.isCapital && (
                  <text
                    x={tile.x * (TILE_SIZE + GAP) + TILE_SIZE / 2}
                    y={tile.y * (TILE_SIZE + GAP) + TILE_SIZE / 2 + 4}
                    textAnchor="middle"
                    fontSize="14"
                    className="pointer-events-none opacity-50"
                  >
                    {TERRAIN_ICONS[tile.terrain]}
                  </text>
                )}
                {ownerColor && tile.population > 0 && !tile.isCapital && (
                  <text
                    x={tile.x * (TILE_SIZE + GAP) + TILE_SIZE / 2}
                    y={tile.y * (TILE_SIZE + GAP) + TILE_SIZE - 6}
                    textAnchor="middle"
                    fontSize="10"
                    fill="white"
                    fontWeight="bold"
                    className="pointer-events-none"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                  >
                    {tile.population}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {hoveredTile && (
        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-lg">{TERRAIN_ICONS[hoveredTile.terrain]}</span>
            <span className="font-medium text-slate-800">
              坐标 ({hoveredTile.x}, {hoveredTile.y})
            </span>
            {hoveredTile.ownerId && (
              <span className="text-sm text-slate-600">
                · 所属: {civNameMap.get(hoveredTile.ownerId)}
                {(() => {
                  const era = civEraMap.get(hoveredTile.ownerId);
                  return era ? ` (${era === 'stoneAge' ? '石器时代' : era === 'agricultural' ? '农业时代' : era === 'imperial' ? '帝国时代' : '科学时代'})` : '';
                })()}
              </span>
            )}
            {hoveredTile.isCapital && (
              <span className="text-amber-600 text-sm">· 首都</span>
            )}
            <span className="text-sm text-slate-500 ml-auto">
              人口: {hoveredTile.population}
            </span>
          </div>
          {hoveredTile.resources && Object.keys(hoveredTile.resources).length > 0 && (
            <div className="flex gap-3 mt-2 text-xs text-slate-600">
              {hoveredTile.resources.agriculture && (
                <span className="flex items-center gap-1">
                  <Wheat className="w-3 h-3 text-green-600" />
                  农业 +{hoveredTile.resources.agriculture}
                </span>
              )}
              {hoveredTile.resources.technology && (
                <span className="flex items-center gap-1">
                  <FlaskConical className="w-3 h-3 text-blue-600" />
                  科技 +{hoveredTile.resources.technology}
                </span>
              )}
              {hoveredTile.resources.culture && (
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-purple-600" />
                  文化 +{hoveredTile.resources.culture}
                </span>
              )}
              {hoveredTile.resources.population && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-amber-600" />
                  人口 +{hoveredTile.resources.population}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
        <div className="font-medium">地形图例:</div>
        {Object.entries(TERRAIN_ICONS).map(([terrain, icon]) => (
          <span key={terrain} className="flex items-center gap-1">
            <span
              className="w-4 h-4 rounded"
              style={{ backgroundColor: TERRAIN_COLORS[terrain as TileTerrain] }}
            />
            {icon}
          </span>
        ))}
        <span className="ml-2 font-medium">时代:</span>
        {Object.entries(ERA_COLORS).map(([era, color]) => (
          <span key={era} className="flex items-center gap-1">
            <span
              className="w-4 h-4 rounded"
              style={{ backgroundColor: color }}
            />
            {era === 'stoneAge' ? '石器' : era === 'agricultural' ? '农业' : era === 'imperial' ? '帝国' : '科学'}
          </span>
        ))}
      </div>
    </div>
  );
}
