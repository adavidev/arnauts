import Phaser from 'phaser';
import { Interactable } from './Interactable';
import { TileType } from './TileType';

export class Terminal extends Interactable {
  public override readonly interactableKind = 'terminal' as const;

  constructor(scene: Phaser.Scene) {
    super(scene);
    this.type = TileType.None;

    const sprite = scene.make.image({ x: 0, y: 0, key: 'terminal' }).setOrigin(0, 0);
    this.add(sprite);
  }

  protected override addCoordinates(): void {
    this.coordinates.push({ x: this.tileX, y: this.tileY });
  }
}
