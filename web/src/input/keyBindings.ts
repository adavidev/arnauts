/**
 * Logical actions bound to physical KeyboardEvent.code strings for persistence and SQLite export.
 */
export type InputAction =
  | 'cameraPanLeft'
  | 'cameraPanRight'
  | 'cameraPanUp'
  | 'cameraPanDown'
  | 'rotateShipLeft'
  | 'rotateShipRight'
  | 'toggleTopologyDebug'
  | 'stripInteriorHull';

export type InputBindingsConfig = Record<InputAction, string[]>;

export const INPUT_ACTIONS: InputAction[] = [
  'cameraPanLeft',
  'cameraPanRight',
  'cameraPanUp',
  'cameraPanDown',
  'rotateShipLeft',
  'rotateShipRight',
  'toggleTopologyDebug',
  'stripInteriorHull',
];

/** Camera pan bindings always union with defaults so arrows + WASD stay available alongside custom keys. */
const CAMERA_PAN_ACTIONS = new Set<InputAction>([
  'cameraPanLeft',
  'cameraPanRight',
  'cameraPanUp',
  'cameraPanDown',
]);

export const DEFAULT_BINDINGS: InputBindingsConfig = {
  cameraPanLeft: ['ArrowLeft', 'KeyA'],
  cameraPanRight: ['ArrowRight', 'KeyD'],
  cameraPanUp: ['ArrowUp', 'KeyW'],
  cameraPanDown: ['ArrowDown', 'KeyS'],
  rotateShipLeft: ['KeyQ'],
  rotateShipRight: ['KeyE'],
  toggleTopologyDebug: ['KeyT'],
  stripInteriorHull: ['KeyI'],
};

export function mergeWithDefaults(parsed: unknown): InputBindingsConfig {
  const base: InputBindingsConfig = {
    cameraPanLeft: [...DEFAULT_BINDINGS.cameraPanLeft],
    cameraPanRight: [...DEFAULT_BINDINGS.cameraPanRight],
    cameraPanUp: [...DEFAULT_BINDINGS.cameraPanUp],
    cameraPanDown: [...DEFAULT_BINDINGS.cameraPanDown],
    rotateShipLeft: [...DEFAULT_BINDINGS.rotateShipLeft],
    rotateShipRight: [...DEFAULT_BINDINGS.rotateShipRight],
    toggleTopologyDebug: [...DEFAULT_BINDINGS.toggleTopologyDebug],
    stripInteriorHull: [...DEFAULT_BINDINGS.stripInteriorHull],
  };

  if (typeof parsed !== 'object' || parsed === null) return base;

  const o = parsed as Record<string, unknown>;
  for (const action of INPUT_ACTIONS) {
    const v = o[action];
    if (CAMERA_PAN_ACTIONS.has(action)) {
      if (Array.isArray(v) && v.every((x) => typeof x === 'string' && x.length > 0)) {
        base[action] = [...new Set([...DEFAULT_BINDINGS[action], ...v])];
      }
      continue;
    }
    if (
      Array.isArray(v) &&
      v.length > 0 &&
      v.every((x) => typeof x === 'string' && x.length > 0)
    ) {
      base[action] = [...v];
    }
  }
  return base;
}
