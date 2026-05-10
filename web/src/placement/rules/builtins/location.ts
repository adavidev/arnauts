import { topologyKey } from '../../../ship/topology';
import { TileType } from '../../../ship/TileType';
import type { RuleContext } from '../../types';
import type { RuleResultJson } from '../../../persistence/types';

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

export function evaluateLocationRule(ctx: RuleContext): RuleResultJson {
  switch (ctx.intent.kind) {
    case 'place_terminal': {
      if (!hullBordersInteriorWalkable(ctx.snapshot, ctx.x, ctx.y)) {
        return {
          ruleId: 'location',
          passed: false,
          message: 'terminal requires a hull tile adjacent to interior walkable deck',
        };
      }
      return { ruleId: 'location', passed: true };
    }
    case 'place_hull':
    case 'place_ladder':
    case 'place_ring':
      return { ruleId: 'location', passed: true };
  }
}
