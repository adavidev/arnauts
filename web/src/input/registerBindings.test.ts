import { describe, expect, it } from 'vitest';
import { domKeyCodeToPhaserKeyCode } from './domKeyToPhaserKeyCode';

const KC = {
  W: 87,
  A: 65,
  UP: 38,
  LEFT: 37,
  BACKTICK: 192,
} as const;

describe('domKeyCodeToPhaserKeyCode', () => {
  it('maps DOM .code strings to Phaser key codes', () => {
    expect(domKeyCodeToPhaserKeyCode('KeyW')).toBe(KC.W);
    expect(domKeyCodeToPhaserKeyCode('KeyA')).toBe(KC.A);
    expect(domKeyCodeToPhaserKeyCode('ArrowUp')).toBe(KC.UP);
    expect(domKeyCodeToPhaserKeyCode('ArrowLeft')).toBe(KC.LEFT);
    expect(domKeyCodeToPhaserKeyCode('Backquote')).toBe(KC.BACKTICK);
  });

  it('accepts letter and UP/DOWN/LEFT/RIGHT aliases', () => {
    expect(domKeyCodeToPhaserKeyCode('W')).toBe(KC.W);
    expect(domKeyCodeToPhaserKeyCode('UP')).toBe(KC.UP);
  });
});
