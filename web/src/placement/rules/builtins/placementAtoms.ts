import type { RuleResultJson } from '../../../persistence/types';
import { TileType } from '../../../ship/TileType';
import type { RuleContext } from '../../types';

/** Hull tile may only be placed on cells that have no tile yet. */
export function evaluateHullEmptyCell(ctx: RuleContext): RuleResultJson {
  if (ctx.intent.kind !== 'place_hull') {
    return { ruleId: 'hull_empty_cell', passed: true };
  }
  if (ctx.tileAt !== null) {
    return {
      ruleId: 'hull_empty_cell',
      passed: false,
      message: 'Hull can only be placed on empty cells.',
    };
  }
  return { ruleId: 'hull_empty_cell', passed: true };
}

/** Ladder and terminal use the same rule: base cell must be walkable deck/corridor. */
export function evaluateLadderWalkableFloor(ctx: RuleContext): RuleResultJson {
  if (ctx.intent.kind !== 'place_ladder' && ctx.intent.kind !== 'place_terminal') {
    return { ruleId: 'ladder_walkable_floor', passed: true };
  }
  if (ctx.tileAt === null || ctx.tileAt.type !== TileType.Walkable) {
    return {
      ruleId: 'ladder_walkable_floor',
      passed: false,
      message: 'Walkable deck/corridor required.',
    };
  }
  return { ruleId: 'ladder_walkable_floor', passed: true };
}
