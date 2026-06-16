import type { WorldMap, MapTile, TileTerrain, AICivilization } from '../types';

const TERRAIN_WEIGHTS: Record<TileTerrain, number> = {
  plains: 35,
  forest: 25,
  mountain: 12,
  desert: 10,
  coast: 8,
  river: 5,
  tundra: 5,
};

const TERRAIN_RESOURCES: Record<TileTerrain, Partial<{ population: number; technology: number; culture: number; military: number; agriculture: number }>> = {
  plains: { agriculture: 3, population: 2 },
  forest: { agriculture: 1, technology: 1, military: 1 },
  mountain: { technology: 2, military: 1 },
  desert: { military: 1 },
  coast: { agriculture: 2, population: 1, trade: 2 } as any,
  river: { agriculture: 4, population: 3, culture: 1 },
  tundra: { military: 1 },
};

function weightedRandomTerrain(): TileTerrain {
  const total = Object.values(TERRAIN_WEIGHTS).reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  for (const [terrain, weight] of Object.entries(TERRAIN_WEIGHTS)) {
    random -= weight;
    if (random <= 0) return terrain as TileTerrain;
  }
  return 'plains';
}

function generateContinentTiles(width: number, height: number, count: number): string[][] {
  const tiles: string[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      tiles.push(`${x},${y}`);
    }
  }

  const shuffled = tiles.sort(() => Math.random() - 0.5);
  const continents: string[][] = [];
  const tilesPerContinent = Math.floor(shuffled.length / count);

  for (let i = 0; i < count; i++) {
    const start = i * tilesPerContinent;
    const end = i === count - 1 ? shuffled.length : start + tilesPerContinent;
    continents.push(shuffled.slice(start, end));
  }

  return continents;
}

export function generateWorldMap(width: number = 16, height: number = 10): WorldMap {
  const tiles: MapTile[] = [];
  const continentCount = 3;
  const continentNames = ['欧罗巴大陆', '亚细亚大陆', '阿非利加大陆'];

  const continents = generateContinentTiles(width, height, continentCount);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tileId = `${x},${y}`;
      const terrain = weightedRandomTerrain();
      const resources = TERRAIN_RESOURCES[terrain] || {};

      tiles.push({
        id: tileId,
        x,
        y,
        terrain,
        ownerId: null,
        population: 0,
        resources,
        isCapital: false,
      });
    }
  }

  const continentData = continents.map((tileIds, i) => ({
    id: `continent-${i}`,
    name: continentNames[i] || `大陆${i + 1}`,
    tileIds,
  }));

  return {
    width,
    height,
    tiles,
    continents: continentData,
  };
}

export function findStartPositions(map: WorldMap, civCount: number): string[] {
  const positions: string[] = [];
  const continents = [...map.continents].sort(() => Math.random() - 0.5);

  for (let i = 0; i < civCount; i++) {
    const continent = continents[i % continents.length];
    const availableTiles = continent.tileIds.filter(
      (tileId) => {
        const tile = map.tiles.find((t) => t.id === tileId);
        return tile && !tile.ownerId && (tile.terrain === 'plains' || tile.terrain === 'river' || tile.terrain === 'coast');
      }
    );

    if (availableTiles.length > 0) {
      const randomTile = availableTiles[Math.floor(Math.random() * availableTiles.length)];
      positions.push(randomTile);
    } else {
      const anyAvailable = map.tiles.find((t) => !t.ownerId && t.terrain !== 'mountain');
      if (anyAvailable) {
        positions.push(anyAvailable.id);
      }
    }
  }

  return positions;
}

export function getAdjacentTiles(map: WorldMap, tileId: string): string[] {
  const [x, y] = tileId.split(',').map(Number);
  const adjacent: string[] = [];
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [1, -1], [-1, 1], [1, 1],
  ];

  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && nx < map.width && ny >= 0 && ny < map.height) {
      adjacent.push(`${nx},${ny}`);
    }
  }

  return adjacent;
}

export function getExpandableTiles(map: WorldMap, civilization: AICivilization): string[] {
  const expandable: Set<string> = new Set();

  for (const tileId of civilization.territory) {
    const adjacent = getAdjacentTiles(map, tileId);
    for (const adjId of adjacent) {
      const adjTile = map.tiles.find((t) => t.id === adjId);
      if (adjTile && !adjTile.ownerId && adjTile.terrain !== 'mountain') {
        expandable.add(adjId);
      }
    }
  }

  return Array.from(expandable);
}
