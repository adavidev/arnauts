import type { Tile } from '../ship/Tile';
import type { TileType } from '../ship/TileType';

export type PlacementIntent =
  | { kind: 'place_hull' }
  | { kind: 'place_ladder' }
  | { kind: 'place_terminal' }
  | {
      kind: 'place_ring';
      ax: number;
      ay: number;
      bx: number;
      by: number;
      sealOverWalkable: boolean;
    };

export interface RuleContext {
  snapshot: ReadonlyMap<string, TileType>;
  x: number;
  y: number;
  tileAt: Tile | null;
  intent: PlacementIntent;
}
