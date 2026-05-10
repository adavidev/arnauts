import Phaser from 'phaser';
import type { Ship } from '../ship/Ship';
import { Hull } from '../ship/Hull';
import { Corridor } from '../ship/Corridor';
import { Ladder } from '../ship/Ladder';
import { Terminal } from '../ship/Terminal';
import { TileType } from '../ship/TileType';
import type { Tile } from '../ship/Tile';

function createTileForType(scene: Phaser.Scene, tt: TileType): Tile {
  switch (tt) {
    case TileType.Hull:
      return new Hull(scene);
    case TileType.Walkable:
      return new Corridor(scene);
    default:
      return new Corridor(scene);
  }
}

function parseExportedTileType(s: string): TileType {
  const values = Object.values(TileType) as string[];
  if (values.includes(s)) return s as TileType;
  return TileType.Walkable;
}

/**
 * Replace ship tiles and interactables from exported SQLite / JSON rows (no procedural fill).
 */
export function hydrateShipLayout(
  scene: Phaser.Scene,
  ship: Ship,
  tiles: Array<{ x: number; y: number; tileType: string }>,
  interactables: Array<{ kind: 'ladder' | 'terminal'; x: number; y: number }>,
): void {
  ship.clearTilesAndInteractables();
  for (const row of tiles) {
    const tt = parseExportedTileType(row.tileType);
    ship.addTile(createTileForType(scene, tt), row.x, row.y);
  }
  for (const row of interactables) {
    if (row.kind === 'ladder') {
      ship.addInteractable(new Ladder(scene), row.x, row.y);
    } else {
      ship.addInteractable(new Terminal(scene), row.x, row.y);
    }
  }
  ship.redrawWalkableOutline();
}
