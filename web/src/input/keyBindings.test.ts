import { describe, expect, it } from 'vitest';
import { DEFAULT_BINDINGS, mergeWithDefaults } from './keyBindings';

describe('mergeWithDefaults', () => {
  it('fills missing actions from defaults when parsed empty', () => {
    const m = mergeWithDefaults({});
    expect(m.cameraPanLeft).toEqual(DEFAULT_BINDINGS.cameraPanLeft);
    expect(m.toggleTopologyDebug).toEqual(DEFAULT_BINDINGS.toggleTopologyDebug);
  });

  it('merges camera pan with defaults so custom keys add to arrows/WASD', () => {
    const m = mergeWithDefaults({
      cameraPanLeft: ['KeyH'],
    });
    expect(new Set(m.cameraPanLeft)).toEqual(
      new Set([...DEFAULT_BINDINGS.cameraPanLeft, 'KeyH']),
    );
    expect(m.cameraPanRight).toEqual(DEFAULT_BINDINGS.cameraPanRight);
  });

  it('ignores unknown keys on parsed object', () => {
    const m = mergeWithDefaults({
      unknownAction: ['KeyX'],
      cameraPanUp: ['KeyZ'],
    } as Record<string, unknown>);
    expect(new Set(m.cameraPanUp)).toEqual(
      new Set([...DEFAULT_BINDINGS.cameraPanUp, 'KeyZ']),
    );
    expect(m.cameraPanDown).toEqual(DEFAULT_BINDINGS.cameraPanDown);
  });

  it('ignores invalid arrays', () => {
    const m = mergeWithDefaults({
      rotateShipLeft: [123, null],
    });
    expect(m.rotateShipLeft).toEqual(DEFAULT_BINDINGS.rotateShipLeft);
  });

  it('round-trips defaults through JSON', () => {
    const json = JSON.stringify(DEFAULT_BINDINGS);
    const m = mergeWithDefaults(JSON.parse(json));
    expect(m).toEqual(DEFAULT_BINDINGS);
  });
});
