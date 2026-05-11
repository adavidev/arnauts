import { describe, expect, it } from 'vitest';
import { TileType } from '../../ship/TileType';
import type { Tile } from '../../ship/Tile';
import type { RuleContext } from '../types';
import { evaluateHullEmptyCell, evaluateLadderWalkableFloor } from './builtins/placementAtoms';
import { hullBordersInteriorWalkable } from './builtins/location';
import { topologyKey } from '../../ship/topology';
import {
  allRulesPassed,
  evaluatePlacementRules,
  enabledRuleIdsForIntent,
  runPlacementRules,
} from './registry';

describe('hull_empty_cell', () => {
  it('accepts hull on empty cell', () => {
    const snap = new Map<string, TileType>();
    const ctx: RuleContext = {
      snapshot: snap,
      x: 0,
      y: 0,
      tileAt: null,
      intent: { kind: 'place_hull' },
    };
    expect(evaluateHullEmptyCell(ctx).passed).toBe(true);
  });

  it('rejects hull when occupied', () => {
    const snap = new Map<string, TileType>();
    snap.set(topologyKey(0, 0), TileType.Hull);
    const ctx: RuleContext = {
      snapshot: snap,
      x: 0,
      y: 0,
      tileAt: { type: TileType.Hull } as Tile,
      intent: { kind: 'place_hull' },
    };
    expect(evaluateHullEmptyCell(ctx).passed).toBe(false);
  });
});

describe('ladder_walkable_floor', () => {
  it('accepts ladder on walkable', () => {
    const snap = new Map<string, TileType>();
    snap.set(topologyKey(1, 1), TileType.Walkable);
    const ctx: RuleContext = {
      snapshot: snap,
      x: 1,
      y: 1,
      tileAt: { type: TileType.Walkable } as Tile,
      intent: { kind: 'place_ladder' },
    };
    expect(evaluateLadderWalkableFloor(ctx).passed).toBe(true);
  });

  it('applies same walkable check for terminal as ladder', () => {
    const snap = new Map<string, TileType>();
    snap.set(topologyKey(2, 2), TileType.Walkable);
    const ctx: RuleContext = {
      snapshot: snap,
      x: 2,
      y: 2,
      tileAt: { type: TileType.Walkable } as Tile,
      intent: { kind: 'place_terminal' },
    };
    expect(evaluateLadderWalkableFloor(ctx).passed).toBe(true);
  });
});

describe('hullBordersInteriorWalkable', () => {
  it('detects cardinal walkable', () => {
    const snap = new Map<string, TileType>();
    snap.set(topologyKey(0, 0), TileType.Hull);
    snap.set(topologyKey(1, 0), TileType.Walkable);
    expect(hullBordersInteriorWalkable(snap, 0, 0)).toBe(true);
  });
});

describe('intent-scoped preset filtering', () => {
  it('terminal intent uses same applicable rules as ladder', () => {
    const ladderIds = enabledRuleIdsForIntent(
      new Set(['ladder_walkable_floor', 'hull_empty_cell']),
      { kind: 'place_ladder' },
    );
    const terminalIds = enabledRuleIdsForIntent(
      new Set(['ladder_walkable_floor', 'hull_empty_cell']),
      { kind: 'place_terminal' },
    );
    expect([...ladderIds].sort()).toEqual(['ladder_walkable_floor']);
    expect([...terminalIds].sort()).toEqual(['ladder_walkable_floor']);
  });

  it('evaluatePlacementRules accepts terminal on walkable when walkable rule enabled', () => {
    const snap = new Map<string, TileType>();
    snap.set(topologyKey(0, 0), TileType.Walkable);
    const ctx: RuleContext = {
      snapshot: snap,
      x: 0,
      y: 0,
      tileAt: { type: TileType.Walkable } as Tile,
      intent: { kind: 'place_terminal' },
    };
    const r = evaluatePlacementRules(ctx, new Set(['ladder_walkable_floor']));
    expect(r.ruleResults.map((x) => x.ruleId).sort()).toEqual(['ladder_walkable_floor']);
    expect(r.ok).toBe(true);
  });

  it('evaluatePlacementRules rejects terminal on non-walkable when only walkable rule is on', () => {
    const ctx: RuleContext = {
      snapshot: new Map(),
      x: 0,
      y: 0,
      tileAt: { type: TileType.Hull } as Tile,
      intent: { kind: 'place_terminal' },
    };
    const r = evaluatePlacementRules(ctx, new Set(['ladder_walkable_floor']));
    expect(r.ok).toBe(false);
    expect(r.ruleResults[0]?.ruleId).toBe('ladder_walkable_floor');
  });

  it('evaluatePlacementRules rejects terminal when preset has no applicable rules', () => {
    const ctx: RuleContext = {
      snapshot: new Map(),
      x: 0,
      y: 0,
      tileAt: { type: TileType.Walkable } as Tile,
      intent: { kind: 'place_terminal' },
    };
    const r = evaluatePlacementRules(ctx, new Set<string>());
    expect(r.ruleResults).toHaveLength(0);
    expect(r.ok).toBe(false);
  });

  it('evaluatePlacementRules rejects hull placement when only walkable rule is enabled', () => {
    const ctx: RuleContext = {
      snapshot: new Map(),
      x: 0,
      y: 0,
      tileAt: null,
      intent: { kind: 'place_hull' },
    };
    expect(evaluatePlacementRules(ctx, new Set(['ladder_walkable_floor'])).ok).toBe(false);
  });

  it('evaluatePlacementRules allows ring without tile checklist enabled', () => {
    const ctx: RuleContext = {
      snapshot: new Map(),
      x: 0,
      y: 0,
      tileAt: null,
      intent: {
        kind: 'place_ring',
        ax: 0,
        ay: 0,
        bx: 1,
        by: 1,
        sealOverWalkable: false,
      },
    };
    expect(evaluatePlacementRules(ctx, new Set(['hull_empty_cell'])).ok).toBe(true);
  });
});

describe('registry filtered rules', () => {
  it('runs subset by rule id', () => {
    const snap = new Map<string, TileType>();
    const ctx: RuleContext = {
      snapshot: snap,
      x: 0,
      y: 0,
      tileAt: null,
      intent: { kind: 'place_hull' },
    };
    const onlyHull = runPlacementRules(ctx, new Set(['hull_empty_cell']));
    expect(onlyHull).toHaveLength(1);
    expect(onlyHull[0].ruleId).toBe('hull_empty_cell');
  });

  it('allRulesPassed is true when no results (no rules enabled / vacuous pass)', () => {
    expect(allRulesPassed([])).toBe(true);
  });
});
