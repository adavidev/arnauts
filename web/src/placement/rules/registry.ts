import type { RuleResultJson } from '../../persistence/types';
import type { PlacementToolKind } from '../placementTools';
import { PLACEMENT_TOOL_LABEL } from '../placementTools';
import type { PlacementIntent, RuleContext } from '../types';
import {
  evaluateHullEmptyCell,
  evaluateLadderWalkableFloor,
} from './builtins/placementAtoms';
import type { PlacementRuleDefinition } from './types';

/**
 * Placement checklist entries. {@link PlacementRuleDefinition.appliesToTools} is used for
 * copy in tools that reference per-tool descriptions; shipyard placement uses one global preset.
 */
export function defaultPlacementRules(): PlacementRuleDefinition[] {
  return [
    {
      id: 'hull_empty_cell',
      label: 'Empty cell',
      description: 'Hull placement: cell must have no tile yet.',
      appliesToTools: ['hull'],
      evaluate: evaluateHullEmptyCell,
    },
    {
      id: 'ladder_walkable_floor',
      label: 'Walkable floor',
      description: 'Ladder and terminal: cell must be walkable deck/corridor.',
      appliesToTools: ['ladder', 'terminal'],
      evaluate: evaluateLadderWalkableFloor,
    },
  ];
}

/** Full list — ids match persisted preset keys. */
export function placementRuleUiMetas(): ReadonlyArray<{
  id: string;
  label: string;
  description?: string;
}> {
  return defaultPlacementRules().map((d) => ({
    id: d.id,
    label: d.label ?? d.id,
    description: d.description,
  }));
}

/**
 * Same rule row under different tools shows different copy when using per-tool descriptions.
 */
export function placementRuleDescriptionForTool(
  tool: PlacementToolKind,
  ruleId: string,
): string {
  const def = defaultPlacementRules().find((d) => d.id === ruleId);
  if (!def?.description) return '';
  if (def.appliesToTools.includes(tool)) return def.description;
  const names = def.appliesToTools.map((t) => PLACEMENT_TOOL_LABEL[t]).join(', ');
  return `Not used when placing ${PLACEMENT_TOOL_LABEL[tool]} — only when placing ${names}.`;
}

/**
 * @param enabledRuleIds when omitted, all registered rules run. When provided, only those ids run;
 * an empty set yields no results — {@link allRulesPassed} treats that as success (no constraints).
 */
export function runPlacementRules(
  ctx: RuleContext,
  enabledRuleIds?: Set<string>,
): RuleResultJson[] {
  const defs = defaultPlacementRules();
  const list =
    enabledRuleIds === undefined
      ? defs
      : defs.filter((d) => enabledRuleIds.has(d.id));
  return list.map((r) => r.evaluate(ctx));
}

export function allRulesPassed(results: RuleResultJson[]): boolean {
  if (results.length === 0) return true;
  return results.every((r) => r.passed);
}

/** Rule ids whose evaluator can fail for this intent (excludes intent no-ops). */
export function ruleIdsApplicableToIntent(intent: PlacementIntent): ReadonlySet<string> {
  switch (intent.kind) {
    case 'place_hull':
      return new Set(['hull_empty_cell']);
    case 'place_ladder':
    case 'place_terminal':
      return new Set(['ladder_walkable_floor']);
    case 'place_ring':
      return new Set();
  }
}

/**
 * Only rules applicable to the **current placement intent** participate in evaluation.
 */
export function enabledRuleIdsForIntent(
  presetEnabled: ReadonlySet<string>,
  intent: PlacementIntent,
): Set<string> {
  const applicable = ruleIdsApplicableToIntent(intent);
  return new Set([...presetEnabled].filter((id) => applicable.has(id)));
}

/**
 * Runs checklist rules for one placement attempt: filters preset toggles by intent,
 * rejects hull/ladder/terminal when nothing applicable is enabled, leaves ring unconstrained.
 */
export function evaluatePlacementRules(
  ctx: RuleContext,
  presetEnabled: ReadonlySet<string>,
): { ruleResults: RuleResultJson[]; ok: boolean } {
  const filtered = enabledRuleIdsForIntent(presetEnabled, ctx.intent);

  const kind = ctx.intent.kind;
  const requiresApplicableTileRule =
    kind === 'place_hull' || kind === 'place_ladder' || kind === 'place_terminal';

  if (requiresApplicableTileRule && filtered.size === 0) {
    return { ruleResults: [], ok: false };
  }

  const ruleResults = runPlacementRules(ctx, filtered);
  const ok = allRulesPassed(ruleResults);
  return { ruleResults, ok };
}
