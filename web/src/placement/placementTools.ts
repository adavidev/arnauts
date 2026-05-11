/** Aligns with {@link PlaceableComponent} in HudScene — kept here to avoid placement importing scenes. */
export type PlacementToolKind = 'hull' | 'ladder' | 'terminal' | 'ring';

export const PLACEMENT_TOOL_KINDS: PlacementToolKind[] = [
  'hull',
  'ladder',
  'terminal',
  'ring',
];

/** Short labels for Options / tile-tools UI (avoid duplicating in scenes). */
export const PLACEMENT_TOOL_LABEL: Record<PlacementToolKind, string> = {
  hull: 'Hull',
  ladder: 'Ladder',
  terminal: 'Terminal',
  ring: 'Ring',
};
