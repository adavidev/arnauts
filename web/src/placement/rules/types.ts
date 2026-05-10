import type { RuleResultJson } from '../../persistence/types';
import type { RuleContext } from '../types';

export interface PlacementRuleDefinition {
  readonly id: string;
  evaluate(ctx: RuleContext): RuleResultJson;
}
