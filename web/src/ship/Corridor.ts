import Phaser from 'phaser';
import { Tile } from './Tile';
import { TileType } from './TileType';

/** Walkable deck: wall.png + floor. Outer white frame is drawn once on the ship (see Ship.redrawWalkableOutline). */
export class Corridor extends Tile {
  constructor(scene: Phaser.Scene) {
    super(scene);
    this.type = TileType.Walkable;

    const back = scene.make.image({ x: 0, y: 0, key: 'wall' }).setOrigin(0, 0);
    this.add(back);
    const floor = scene.make.image({ x: 0, y: 0, key: 'floor' }).setOrigin(0, 0);
    this.add(floor);
  }
}
