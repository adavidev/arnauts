import { topologyKey } from '../ship/topology';
import { TileType } from '../ship/TileType';

export type CellKind = 'empty' | 'hull' | 'walkable' | 'other';

export function cellKindAt(
  snapshot: ReadonlyMap<string, TileType>,
  x: number,
  y: number,
): CellKind {
  const t = snapshot.get(topologyKey(x, y));
  if (t === undefined) return 'empty';
  if (t === TileType.Hull) return 'hull';
  if (t === TileType.Walkable) return 'walkable';
  return 'other';
}

/** Cardinal directions for compact debug labels. */
export function summarizeNeighborsCardinal(
  snapshot: ReadonlyMap<string, TileType>,
  x: number,
  y: number,
): string {
  const n = cellKindAt(snapshot, x, y - 1);
  const e = cellKindAt(snapshot, x + 1, y);
  const s = cellKindAt(snapshot, x, y + 1);
  const w = cellKindAt(snapshot, x - 1, y);
  return `N:${n} E:${e} S:${s} W:${w}`;
}
