import type { Ship } from '../ship/Ship';
import type { PlacementToolKind } from './placementTools';
import type { PlacementIntent } from './types';
import type { RuleContext } from './types';

/**
 * Builds the same {@link RuleContext} used by placement for probe / dry-run UI.
 * Returns null for ring tool until the first ring corner is set.
 */
export function buildProbeRuleContext(
  ship: Ship,
  tool: PlacementToolKind,
  tx: number,
  ty: number,
  ringCorner: { x: number; y: number } | null,
  sealOverWalkable: boolean,
): RuleContext | null {
  const snapshot = ship.getTileTypeSnapshot();
  if (tool === 'ring') {
    if (ringCorner === null) return null;
    const intent: PlacementIntent = {
      kind: 'place_ring',
      ax: ringCorner.x,
      ay: ringCorner.y,
      bx: tx,
      by: ty,
      sealOverWalkable,
    };
    return {
      snapshot,
      x: tx,
      y: ty,
      tileAt: ship.getTile(tx, ty),
      intent,
    };
  }

  const tileAt = ship.getTile(tx, ty);
  let intent: PlacementIntent;
  switch (tool) {
    case 'hull':
      intent = { kind: 'place_hull' };
      break;
    case 'ladder':
      intent = { kind: 'place_ladder' };
      break;
    case 'terminal':
      intent = { kind: 'place_terminal' };
      break;
  }
  return { snapshot, x: tx, y: ty, tileAt, intent };
}
