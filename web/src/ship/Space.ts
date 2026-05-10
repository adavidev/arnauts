import Phaser from 'phaser';
import { Tile } from './Tile';
import { TileType } from './TileType';

/** Empty / non-existent tile. Returned for off-grid lookups. */
export class Space extends Tile {
  constructor(scene: Phaser.Scene) {
    super(scene);
    this.type = TileType.None;
  }
}
