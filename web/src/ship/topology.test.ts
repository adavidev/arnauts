import { describe, expect, it } from 'vitest';
import { TileType } from './TileType';
import { analyzeShipTopology, topologyKey } from './topology';

/** Post-fill seed ship from TestScene.buildSeedShip: 6×2 interior, 8×4 outer ring. */
function seedShipSnapshot(): Map<string, TileType> {
  const m = new Map<string, TileType>();
  const minX = 0;
  const maxX = 7;
  const lowerY = 1;
  const upperY = 2;
  const floorY = 0;
  const roofY = 3;

  for (let x = minX; x <= maxX; x++) {
    m.set(topologyKey(x, floorY), TileType.Hull);
    m.set(topologyKey(x, roofY), TileType.Hull);
  }
  m.set(topologyKey(minX, lowerY), TileType.Hull);
  m.set(topologyKey(maxX, lowerY), TileType.Hull);
  m.set(topologyKey(minX, upperY), TileType.Hull);
  m.set(topologyKey(maxX, upperY), TileType.Hull);

  for (let x = minX + 1; x <= maxX - 1; x++) {
    m.set(topologyKey(x, lowerY), TileType.Walkable);
    m.set(topologyKey(x, upperY), TileType.Walkable);
  }
  return m;
}

/** Outer ring on [0,4]×[0,4] plus a 2×2 inner hull block (no vacuum-facing cardinals). */
function doubleRingSnapshot(): Map<string, TileType> {
  const m = new Map<string, TileType>();
  const max = 4;
  for (let y = 0; y <= max; y++) {
    for (let x = 0; x <= max; x++) {
      const edge = x === 0 || x === max || y === 0 || y === max;
      if (edge) m.set(topologyKey(x, y), TileType.Hull);
    }
  }
  for (const x of [2, 3]) {
    for (const y of [2, 3]) {
      m.set(topologyKey(x, y), TileType.Hull);
    }
  }
  for (const k of [
    topologyKey(1, 1),
    topologyKey(1, 2),
    topologyKey(1, 3),
    topologyKey(2, 1),
    topologyKey(3, 1),
  ]) {
    m.set(k, TileType.Walkable);
  }
  return m;
}

describe('analyzeShipTopology', () => {
  it('seed layout: 12 walkable, 20 hull, no interior hull, single walkable component', () => {
    const top = analyzeShipTopology(seedShipSnapshot());
    expect(top.walkableCount).toBe(12);
    expect(top.hullCount).toBe(20);
    expect(top.interiorHullKeys.size).toBe(0);
    expect(top.exteriorHullKeys.size).toBe(20);
    expect(top.walkableComponents).toBe(1);
    expect(top.enclosedVoidCount).toBe(0);
  });

  it('double ring: non-zero interior hull', () => {
    const top = analyzeShipTopology(doubleRingSnapshot());
    expect(top.interiorHullKeys.size).toBeGreaterThan(0);
    expect(top.exteriorHullKeys.size).toBeGreaterThan(0);
    for (const k of top.interiorHullKeys) {
      expect(top.exteriorHullKeys.has(k)).toBe(false);
    }
  });

  it('empty snapshot', () => {
    const top = analyzeShipTopology(new Map());
    expect(top.walkableCount).toBe(0);
    expect(top.hullCount).toBe(0);
    expect(top.walkableComponents).toBe(0);
  });
});
