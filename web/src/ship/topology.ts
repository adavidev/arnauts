import { TileType } from './TileType';

const CARDINALS: Array<[number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export function topologyKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function parseTopologyKey(k: string): { x: number; y: number } {
  const [x, y] = k.split(',').map(Number);
  return { x, y };
}

export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface ShipTopology {
  bbox: BoundingBox;
  walkableCount: number;
  hullCount: number;
  walkableComponents: number;
  /** Hull with at least one cardinal neighbor that is empty (vacuum-facing). */
  exteriorHullKeys: ReadonlySet<string>;
  /** Hull tiles that are not exterior (e.g. inner ring / bulkheads fully inside the shell). */
  interiorHullKeys: ReadonlySet<string>;
  /** Null cells inside bbox that cannot reach the padded exterior without crossing hull. */
  enclosedVoidCount: number;
}

function computeBbox(snapshot: ReadonlyMap<string, TileType>): BoundingBox | null {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const k of snapshot.keys()) {
    const { x, y } = parseTopologyKey(k);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  if (minX === Infinity) return null;
  return { minX, maxX, minY, maxY };
}

function getKind(snapshot: ReadonlyMap<string, TileType>, x: number, y: number): 'empty' | 'hull' | 'walkable' {
  const t = snapshot.get(topologyKey(x, y));
  if (t === undefined) return 'empty';
  if (t === TileType.Hull) return 'hull';
  if (t === TileType.Walkable) return 'walkable';
  return 'empty';
}

/**
 * Pure read model: classify hull / walkable / enclosed voids from a tile-type snapshot.
 * Empty cells are absent from the map or implied outside occupied cells.
 */
export function analyzeShipTopology(snapshot: ReadonlyMap<string, TileType>): ShipTopology {
  const bbox = computeBbox(snapshot);
  if (bbox === null) {
    return {
      bbox: { minX: 0, maxX: -1, minY: 0, maxY: -1 },
      walkableCount: 0,
      hullCount: 0,
      walkableComponents: 0,
      exteriorHullKeys: new Set(),
      interiorHullKeys: new Set(),
      enclosedVoidCount: 0,
    };
  }

  let walkableCount = 0;
  let hullCount = 0;
  for (const t of snapshot.values()) {
    if (t === TileType.Walkable) walkableCount++;
    else if (t === TileType.Hull) hullCount++;
  }

  const exterior = new Set<string>();
  const interior = new Set<string>();

  for (const k of snapshot.keys()) {
    if (snapshot.get(k) !== TileType.Hull) continue;
    const { x, y } = parseTopologyKey(k);
    let facesVacuum = false;
    for (const [dx, dy] of CARDINALS) {
      if (getKind(snapshot, x + dx, y + dy) === 'empty') {
        facesVacuum = true;
        break;
      }
    }
    if (facesVacuum) exterior.add(k);
    else interior.add(k);
  }

  const pad = 3;
  const minX = bbox.minX - pad;
  const maxX = bbox.maxX + pad;
  const minY = bbox.minY - pad;
  const maxY = bbox.maxY + pad;
  const inR = (gx: number, gy: number): boolean =>
    gx >= minX && gx <= maxX && gy >= minY && gy <= maxY;

  const reachable = new Set<string>();
  const q: Array<[number, number]> = [];

  const trySeed = (gx: number, gy: number): void => {
    if (!inR(gx, gy)) return;
    if (getKind(snapshot, gx, gy) === 'hull') return;
    const key = topologyKey(gx, gy);
    if (reachable.has(key)) return;
    reachable.add(key);
    q.push([gx, gy]);
  };

  for (let gx = minX; gx <= maxX; gx++) {
    trySeed(gx, minY);
    trySeed(gx, maxY);
  }
  for (let gy = minY; gy <= maxY; gy++) {
    trySeed(minX, gy);
    trySeed(maxX, gy);
  }

  while (q.length > 0) {
    const [gx, gy] = q.shift()!;
    for (const [dx, dy] of CARDINALS) {
      const nx = gx + dx;
      const ny = gy + dy;
      if (!inR(nx, ny)) continue;
      if (getKind(snapshot, nx, ny) === 'hull') continue;
      const nk = topologyKey(nx, ny);
      if (reachable.has(nk)) continue;
      reachable.add(nk);
      q.push([nx, ny]);
    }
  }

  let enclosedVoidCount = 0;
  for (let gx = bbox.minX; gx <= bbox.maxX; gx++) {
    for (let gy = bbox.minY; gy <= bbox.maxY; gy++) {
      if (getKind(snapshot, gx, gy) !== 'empty') continue;
      if (reachable.has(topologyKey(gx, gy))) continue;
      enclosedVoidCount++;
    }
  }

  const visited = new Set<string>();
  let walkableComponents = 0;
  for (const k of snapshot.keys()) {
    if (snapshot.get(k) !== TileType.Walkable) continue;
    if (visited.has(k)) continue;
    walkableComponents++;
    const bfs: string[] = [k];
    visited.add(k);
    while (bfs.length > 0) {
      const cur = bfs.pop()!;
      const { x, y } = parseTopologyKey(cur);
      for (const [dx, dy] of CARDINALS) {
        const nk = topologyKey(x + dx, y + dy);
        if (visited.has(nk)) continue;
        if (snapshot.get(nk) !== TileType.Walkable) continue;
        visited.add(nk);
        bfs.push(nk);
      }
    }
  }

  return {
    bbox,
    walkableCount,
    hullCount,
    walkableComponents,
    exteriorHullKeys: exterior,
    interiorHullKeys: interior,
    enclosedVoidCount,
  };
}
