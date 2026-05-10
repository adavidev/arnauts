import Phaser from 'phaser';
import { TILE_W, TILE_H } from '../core/GameNode';
import { Tile } from './Tile';
import { TileType } from './TileType';

/**
 * 8 sides of a hull tile that can independently take damage. Cardinal sides
 * face into adjacent walkable interior; corner sides wrap an outside corner of
 * the ship's outer shell.
 */
export type HullSide = 'T' | 'B' | 'L' | 'R' | 'TL' | 'TR' | 'BL' | 'BR';

const SIDE_TEXTURE: Record<HullSide, string> = {
  T: 'hullT',
  B: 'hullB',
  L: 'hullL',
  R: 'hullR',
  TL: 'hullTL',
  TR: 'hullTR',
  BL: 'hullBL',
  BR: 'hullBR',
};


export class Hull extends Tile {
  public integrity: Record<HullSide, number> = {
    T: 100,
    B: 100,
    L: 100,
    R: 100,
    TL: 100,
    TR: 100,
    BL: 100,
    BR: 100,
  };

  private skinSprites: Phaser.GameObjects.Image[] = [];

  constructor(scene: Phaser.Scene) {
    super(scene);
    this.type = TileType.Hull;
  }

  override refreshSprites(): void {
    for (const s of this.skinSprites) s.destroy();
    this.skinSprites = [];
    if (!this.ship) return;

    const ship = this.ship;
    const x = this.tileX;
    const y = this.tileY;

    const isEmpty = (dx: number, dy: number): boolean =>
      ship.getTile(x + dx, y + dy) === null;
    const isHull = (dx: number, dy: number): boolean =>
      ship.getTile(x + dx, y + dy)?.type === TileType.Hull;
    const isWalkable = (dx: number, dy: number): boolean =>
      ship.getTile(x + dx, y + dy)?.type === TileType.Walkable;

    if (isWalkable(-1, 0) && this.integrity.L > 0) this.drawPlate('R', 0, 0);
    if (isWalkable(+1, 0) && this.integrity.R > 0) this.drawPlate('L', 0, 0);
    if (isWalkable(0, +1) && this.integrity.T > 0) this.drawPlate('B', 0, 0);
    if (isWalkable(0, -1) && this.integrity.B > 0) this.drawPlate('T', 0, 0);

    if (isEmpty(-1, +1) && !isHull(-1, 0) && !isHull(0, +1) && this.integrity.TL > 0) {
      this.drawPlate('TL', 0, 0, 0, 0);
    }
    if (isEmpty(+1, +1) && !isHull(+1, 0) && !isHull(0, +1) && this.integrity.TR > 0) {
      this.drawPlate('TR', TILE_W, 0, 1, 0);
    }
    if (isEmpty(-1, -1) && !isHull(-1, 0) && !isHull(0, -1) && this.integrity.BL > 0) {
      this.drawPlate('BL', 0, TILE_H, 0, 1);
    }
    if (isEmpty(+1, -1) && !isHull(+1, 0) && !isHull(0, -1) && this.integrity.BR > 0) {
      this.drawPlate('BR', TILE_W, TILE_H, 1, 1);
    }
  }

  private drawPlate(
    side: HullSide,
    offsetX: number,
    offsetY: number,
    originX = 0,
    originY = 0,
  ): void {
    const sprite = this.scene.make
      .image({ x: offsetX, y: offsetY, key: SIDE_TEXTURE[side] })
      .setOrigin(originX, originY);
    this.add(sprite);
    this.skinSprites.push(sprite);
  }
}
