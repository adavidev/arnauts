/**
 * Single source of truth for rendering layers.
 *
 * Ordering (ascending = closer to viewer):
 *   1. SpaceBackground  - tiling outer space backdrop
 *   2. SpaceForeground  - planets, asteroids, decorative space objects
 *   3. ShipBackground   - floors, wall bases, hull-integrity skin sprites
 *   4. ShipEquipment    - ladders, terminals, anything placed inside the ship
 *   5. Character        - all character sprites
 *   6. ShipForeground   - canopy, smoke, lighting, post-ship FX
 *
 * Top-level scene objects (the space backdrop and the Ship itself) use these
 * values via setDepth(). Within the Ship, layer ordering is enforced by the
 * order of nested layer-containers in the Ship's child list (Phaser silently
 * ignores setDepth on objects that are inside a parent Container, so depth
 * within the ship cannot be controlled per-sprite).
 */
export const Layer = {
  SpaceBackground: 100,
  SpaceForeground: 200,
  ShipBackground: 300,
  ShipEquipment: 400,
  Character: 500,
  ShipForeground: 600,
} as const;

export type LayerName = keyof typeof Layer;
