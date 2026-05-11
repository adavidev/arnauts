import type { PlacementToolKind } from './placementTools';
import { PLACEMENT_TOOL_KINDS } from './placementTools';
import { defaultPlacementRules } from './rules/registry';

/** All rule ids currently registered — keep in sync by editing {@link defaultPlacementRules} only. */
const PLACEMENT_RULE_IDS_CACHE: readonly string[] = Object.freeze(
  defaultPlacementRules().map((d) => d.id),
);

export function placementRuleIds(): readonly string[] {
  return PLACEMENT_RULE_IDS_CACHE;
}

/** Alias for iterating rule ids in UI — same as placementRuleIds(). */
export const PLACEMENT_RULE_IDS = PLACEMENT_RULE_IDS_CACHE;

export type PlacementRuleId = string;

export type RuleFlags = Record<string, boolean>;

/**
 * One shared checklist for all shipyard placement (hull, ladder, terminal, ring).
 * Persisted as `{ "global": { ...ruleId: boolean } }`. Legacy saves used per-tool rows;
 * {@link mergeRulePresetsWithDefaults} ORs those rows into `global` on first read.
 */
export type PlacementRulePresetsConfig = {
  global: RuleFlags;
};

function emptyRuleFlags(): RuleFlags {
  const o: RuleFlags = {};
  for (const id of placementRuleIds()) {
    o[id] = false;
  }
  return o;
}

/** Defaults: every registered rule enabled (turn off in Options / tile tools if you want lenient authoring). */
export function defaultGlobalPlacementRuleFlags(): RuleFlags {
  const o = emptyRuleFlags();
  for (const def of defaultPlacementRules()) {
    o[def.id] = true;
  }
  return o;
}

export function defaultPlacementRulePresets(): PlacementRulePresetsConfig {
  return { global: defaultGlobalPlacementRuleFlags() };
}

function isRuleFlagsRow(row: unknown): row is Record<string, unknown> {
  return typeof row === 'object' && row !== null;
}

/**
 * Legacy v1: `{ hull: {...}, ladder: {...}, terminal: {...}, ring: {...} }` per-tool rows.
 * Returns OR across tools (any row enabling a rule enables it globally). All-false → defaults.
 */
function globalFromLegacyPerToolRows(o: Record<string, unknown>): RuleFlags {
  const ids = placementRuleIds();
  const merged: RuleFlags = emptyRuleFlags();

  for (const tool of PLACEMENT_TOOL_KINDS) {
    const row = o[tool];
    if (!isRuleFlagsRow(row)) continue;
    const r = row;

    const hasNewKey = ids.some((id) => typeof r[id] === 'boolean');
    const hasLegacy =
      typeof r.tile_type === 'boolean' || typeof r.location === 'boolean';

    if (hasLegacy && !hasNewKey) {
      const tt =
        typeof r.tile_type === 'boolean' ? r.tile_type === true : true;
      const loc =
        typeof r.location === 'boolean' ? r.location === true : true;
      if (tt) {
        merged.hull_empty_cell = true;
        merged.ladder_walkable_floor = true;
      }
      if (loc) merged.ladder_walkable_floor = true;
      continue;
    }

    for (const ruleId of ids) {
      const v = r[ruleId];
      if (v === true) merged[ruleId] = true;
    }
  }

  const anyOn = ids.some((id) => merged[id] === true);
  if (!anyOn) return defaultGlobalPlacementRuleFlags();
  return merged;
}

export function mergeRulePresetsWithDefaults(parsed: unknown): PlacementRulePresetsConfig {
  const base = defaultPlacementRulePresets();
  if (typeof parsed !== 'object' || parsed === null) return base;
  const o = parsed as Record<string, unknown>;

  const g = o.global;
  if (isRuleFlagsRow(g)) {
    for (const id of placementRuleIds()) {
      const v = g[id];
      if (typeof v === 'boolean') {
        base.global[id] = v;
      }
    }
    return base;
  }

  const hasLegacyToolKey = PLACEMENT_TOOL_KINDS.some((t) => isRuleFlagsRow(o[t]));
  if (hasLegacyToolKey) {
    base.global = globalFromLegacyPerToolRows(o);
    return base;
  }

  return base;
}

/** Empty set means no rules apply (placement should fail where intent requires checks). */
export function enabledRuleIdsFromPreset(flags: RuleFlags): Set<string> {
  const s = new Set<string>();
  for (const id of placementRuleIds()) {
    if (flags[id]) s.add(id);
  }
  return s;
}
