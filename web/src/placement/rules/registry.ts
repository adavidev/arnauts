import type { RuleResultJson } from '../../persistence/types';
import type { RuleContext } from '../types';
import { evaluateTileTypeRule } from './builtins/tileType';
import { evaluateLocationRule } from './builtins/location';
import type { PlacementRuleDefinition } from './types';

export function defaultPlacementRules(): PlacementRuleDefinition[] {
  return [
    { id: 'tile_type', evaluate: evaluateTileTypeRule },
    { id: 'location', evaluate: evaluateLocationRule },
  ];
}

export function runPlacementRules(ctx: RuleContext): RuleResultJson[] {
  return defaultPlacementRules().map((r) => r.evaluate(ctx));
}

export function allRulesPassed(results: RuleResultJson[]): boolean {
  return results.every((r) => r.passed);
}
