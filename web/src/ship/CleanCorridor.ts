import Phaser from 'phaser';
import { Tile } from './Tile';
import { TileType } from './TileType';

/** Same as Corridor (floor-only deck). */
export class CleanCorridor extends Tile {
  constructor(scene: Phaser.Scene) {
    super(scene);
    this.type = TileType.Walkable;

    const floor = scene.make.image({ x: 0, y: 0, key: 'floor' }).setOrigin(0, 0);
    this.add(floor);
  }
}
