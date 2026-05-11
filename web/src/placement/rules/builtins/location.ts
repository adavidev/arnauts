import { topologyKey } from '../../../ship/topology';
import { TileType } from '../../../ship/TileType';

/** Hull tile must have at least one cardinal neighbor that is walkable interior deck. */
export function hullBordersInteriorWalkable(
  snapshot: ReadonlyMap<string, TileType>,
  x: number,
  y: number,
): boolean {
  const w = (dx: number, dy: number) =>
    snapshot.get(topologyKey(x + dx, y + dy)) === TileType.Walkable;
  return w(1, 0) || w(-1, 0) || w(0, 1) || w(0, -1);
}
