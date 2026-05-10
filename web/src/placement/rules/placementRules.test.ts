import { describe, expect, it } from 'vitest';
import { TileType } from '../../ship/TileType';
import type { Tile } from '../../ship/Tile';
import type { RuleContext } from '../types';
import { evaluateTileTypeRule } from './builtins/tileType';
import {
  evaluateLocationRule,
  hullBordersInteriorWalkable,
} from './builtins/location';
import { topologyKey } from '../../ship/topology';

describe('tile_type rule', () => {
  it('accepts hull on empty cell', () => {
    const snap = new Map<string, TileType>();
    const ctx: RuleContext = {
      snapshot: snap,
      x: 0,
      y: 0,
      tileAt: null,
      intent: { kind: 'place_hull' },
    };
    expect(evaluateTileTypeRule(ctx).passed).toBe(true);
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
    expect(evaluateTileTypeRule(ctx).passed).toBe(false);
  });

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
    expect(evaluateTileTypeRule(ctx).passed).toBe(true);
  });

  it('accepts terminal on hull with adjacent walkable (tile_type only)', () => {
    const snap = new Map<string, TileType>();
    snap.set(topologyKey(5, 5), TileType.Hull);
    snap.set(topologyKey(6, 5), TileType.Walkable);
    const ctx: RuleContext = {
      snapshot: snap,
      x: 5,
      y: 5,
      tileAt: { type: TileType.Hull } as Tile,
      intent: { kind: 'place_terminal' },
    };
    expect(evaluateTileTypeRule(ctx).passed).toBe(true);
  });
});

describe('location rule', () => {
  it('hullBordersInteriorWalkable detects cardinal walkable', () => {
    const snap = new Map<string, TileType>();
    snap.set(topologyKey(0, 0), TileType.Hull);
    snap.set(topologyKey(1, 0), TileType.Walkable);
    expect(hullBordersInteriorWalkable(snap, 0, 0)).toBe(true);
  });

  it('rejects terminal with no interior-adjacent walkable', () => {
    const snap = new Map<string, TileType>();
    snap.set(topologyKey(2, 2), TileType.Hull);
    const ctx: RuleContext = {
      snapshot: snap,
      x: 2,
      y: 2,
      tileAt: { type: TileType.Hull } as Tile,
      intent: { kind: 'place_terminal' },
    };
    expect(evaluateLocationRule(ctx).passed).toBe(false);
  });

  it('accepts terminal when walkable is north', () => {
    const snap = new Map<string, TileType>();
    snap.set(topologyKey(2, 2), TileType.Hull);
    snap.set(topologyKey(2, 1), TileType.Walkable);
    const ctx: RuleContext = {
      snapshot: snap,
      x: 2,
      y: 2,
      tileAt: { type: TileType.Hull } as Tile,
      intent: { kind: 'place_terminal' },
    };
    expect(evaluateLocationRule(ctx).passed).toBe(true);
  });
});
