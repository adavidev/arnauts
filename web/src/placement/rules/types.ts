import type { RuleResultJson } from '../../persistence/types';
import type { PlacementToolKind } from '../placementTools';
import type { RuleContext } from '../types';

export interface PlacementRuleDefinition {
  readonly id: string;
  /** Short title for Options / tile-tools UI */
  readonly label?: string;
  /** One-line explanation shown under the title */
  readonly description?: string;
  /**
   * Hotbar tools where this rule performs a real check (not an intent no-op).
   * Used for **default presets** (on for those tools, off otherwise); UI still lists every rule for every tool.
   */
  readonly appliesToTools: readonly PlacementToolKind[];
  evaluate(ctx: RuleContext): RuleResultJson;
}
