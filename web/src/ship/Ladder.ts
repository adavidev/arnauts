import Phaser from 'phaser';
import { Interactable } from './Interactable';
import { TileType } from './TileType';

export class Ladder extends Interactable {
  public override readonly interactableKind = 'ladder' as const;

  constructor(scene: Phaser.Scene) {
    super(scene);
    this.type = TileType.Climbable;
    const sprite = scene.make
      .image({ x: 0, y: 0, key: 'tileset_25x50', frame: 8 })
      .setOrigin(0, 0);
    this.add(sprite);
  }

  protected override addCoordinates(): void {
    this.coordinates.push({ x: this.tileX, y: this.tileY });
  }
}
