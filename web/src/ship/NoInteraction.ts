import Phaser from 'phaser';
import { Interactable } from './Interactable';
import { TileType } from './TileType';

/** Sentinel "no interactable here" value, mirroring NoInteraction.java. */
export class NoInteraction extends Interactable {
  constructor(scene: Phaser.Scene) {
    super(scene);
    this.type = TileType.None;
  }

  protected override addCoordinates(): void {}
}
