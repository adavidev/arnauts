/**
 * Maps DOM {@link KeyboardEvent}.`code` strings to values understood by
 * {@link Phaser.Input.Keyboard.KeyboardPlugin#addKey} (numeric key codes match
 * {@link Phaser.Input.Keyboard.KeyCodes}).
 *
 * Phaser resolves string arguments only via `KeyCodes[name.toUpperCase()]`.
 * Names like `KEYW` or `ARROWUP` are not in that table, so `KeyW` / `ArrowUp`
 * from the DOM must be translated here.
 */
export function domKeyCodeToPhaserKeyCode(code: string): string | number {
  switch (code) {
    case 'ArrowUp':
      return 38; // UP
    case 'ArrowDown':
      return 40; // DOWN
    case 'ArrowLeft':
      return 37; // LEFT
    case 'ArrowRight':
      return 39; // RIGHT
    case 'Backquote':
      return 192; // BACKTICK
    default:
      break;
  }

  const letter = /^Key([A-Z])$/i.exec(code);
  if (letter) {
    const ch = letter[1].toUpperCase();
    const ascii = ch.charCodeAt(0);
    if (ascii >= 65 && ascii <= 90) return ascii;
  }

  if (code.length === 1) {
    const u = code.toUpperCase();
    const ascii = u.charCodeAt(0);
    if (ascii >= 65 && ascii <= 90) return ascii;
  }

  const singleLetterAliases: Record<string, number> = {
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    BACKTICK: 192,
  };
  const alias = singleLetterAliases[code.toUpperCase()];
  if (alias !== undefined) return alias;

  return code;
}
