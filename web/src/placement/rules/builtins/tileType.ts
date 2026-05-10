import { TileType } from '../../../ship/TileType';
import type { RuleContext } from '../../types';
import type { RuleResultJson } from '../../../persistence/types';

export function evaluateTileTypeRule(ctx: RuleContext): RuleResultJson {
  switch (ctx.intent.kind) {
    case 'place_hull':
      if (ctx.tileAt !== null) {
        return {
          ruleId: 'tile_type',
          passed: false,
          message: 'hull can only be placed on empty cells',
        };
      }
      return { ruleId: 'tile_type', passed: true };

    case 'place_ladder':
      if (ctx.tileAt === null || ctx.tileAt.type !== TileType.Walkable) {
        return {
          ruleId: 'tile_type',
          passed: false,
          message: 'ladder requires a walkable floor tile',
        };
      }
      return { ruleId: 'tile_type', passed: true };

    case 'place_terminal':
      if (ctx.tileAt === null || ctx.tileAt.type !== TileType.Hull) {
        return {
          ruleId: 'tile_type',
          passed: false,
          message: 'terminal must be placed on a hull tile',
        };
      }
      return { ruleId: 'tile_type', passed: true };

    case 'place_ring':
      return { ruleId: 'tile_type', passed: true };
  }
}
