import Phaser from 'phaser';
import { domKeyCodeToPhaserKeyCode } from './domKeyToPhaserKeyCode';
import type { InputAction, InputBindingsConfig } from './keyBindings';

export type RegisteredInputKeys = Record<InputAction, Phaser.Input.Keyboard.Key[]>;

export function registerInputBindings(
  kb: Phaser.Input.Keyboard.KeyboardPlugin,
  config: InputBindingsConfig,
): RegisteredInputKeys {
  const out = {} as RegisteredInputKeys;
  (Object.keys(config) as InputAction[]).forEach((action) => {
    const codes = config[action];
    out[action] = codes.map((code) => kb.addKey(domKeyCodeToPhaserKeyCode(code)));
  });
  return out;
}

export function anyKeysDown(keys: Phaser.Input.Keyboard.Key[]): boolean {
  return keys.some((k) => k.isDown);
}
