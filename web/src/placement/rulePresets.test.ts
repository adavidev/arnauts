import { describe, expect, it } from 'vitest';
import {
  defaultGlobalPlacementRuleFlags,
  defaultPlacementRulePresets,
  enabledRuleIdsFromPreset,
  mergeRulePresetsWithDefaults,
  placementRuleIds,
} from './rulePresets';

describe('mergeRulePresetsWithDefaults', () => {
  it('uses defaults for empty input', () => {
    const m = mergeRulePresetsWithDefaults({});
    for (const id of placementRuleIds()) {
      expect(m.global[id]).toBe(true);
    }
  });

  it('merges global object', () => {
    const m = mergeRulePresetsWithDefaults({
      global: { hull_empty_cell: false, ladder_walkable_floor: true },
    } as Record<string, unknown>);
    expect(m.global.hull_empty_cell).toBe(false);
    expect(m.global.ladder_walkable_floor).toBe(true);
  });

  it('migrates legacy per-tool rows with OR across tools', () => {
    const m = mergeRulePresetsWithDefaults({
      hull: { hull_empty_cell: true, ladder_walkable_floor: false },
      ladder: { hull_empty_cell: false, ladder_walkable_floor: true },
      terminal: { terminal_on_hull_tile: true },
      ring: {},
    } as Record<string, unknown>);
    expect(m.global.hull_empty_cell).toBe(true);
    expect(m.global.ladder_walkable_floor).toBe(true);
  });

  it('migrates legacy tile_type and location keys inside a tool row', () => {
    const m = mergeRulePresetsWithDefaults({
      hull: { tile_type: false, location: true },
    } as Record<string, unknown>);
    expect(m.global.hull_empty_cell).toBe(false);
    expect(m.global.ladder_walkable_floor).toBe(true);
  });

  it('all-false legacy rows fall back to defaults', () => {
    const m = mergeRulePresetsWithDefaults({
      hull: { hull_empty_cell: false, ladder_walkable_floor: false },
      ladder: { hull_empty_cell: false, ladder_walkable_floor: false },
      terminal: {
        terminal_on_hull_tile: false,
        terminal_adjacent_interior_walkable: false,
      },
      ring: {},
    } as Record<string, unknown>);
    for (const id of placementRuleIds()) {
      expect(m.global[id]).toBe(true);
    }
  });
});

describe('enabledRuleIdsFromPreset', () => {
  it('omits disabled rules', () => {
    const f = defaultGlobalPlacementRuleFlags();
    f.hull_empty_cell = false;
    f.ladder_walkable_floor = true;
    const s = enabledRuleIdsFromPreset(f);
    expect(s.has('hull_empty_cell')).toBe(false);
    expect(s.has('ladder_walkable_floor')).toBe(true);
  });
});

describe('defaultPlacementRulePresets', () => {
  it('exposes global flags', () => {
    const p = defaultPlacementRulePresets();
    expect(p.global).toEqual(defaultGlobalPlacementRuleFlags());
  });
});
