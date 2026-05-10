import Phaser from 'phaser';
import { GameNode, TILE_W, TILE_H } from '../core/GameNode';
import { TileType } from './TileType';
import type { Ship } from './Ship';

export abstract class Tile extends GameNode {
  public tileX = 0;
  public tileY = 0;
  public type: TileType = TileType.None;
  public ship: Ship | null = null;

  constructor(scene: Phaser.Scene) {
    super(scene);
  }

  public setShip(ship: Ship): void {
    this.ship = ship;
  }

  public setTileCoords(x: number, y: number): void {
    this.tileX = x;
    this.tileY = y;
    this.setLogicalPos(x * TILE_W, y * TILE_H);
  }

  /**
   * Re-evaluate any neighbor-aware sprites. Called by Ship after this tile or
   * one of its neighbors changes. Default is a no-op; Corridor/Hull override it.
   */
  public refreshSprites(): void {}

  /** Logical center of the tile in ship-local Y-up coordinates. */
  public basicCenter(): { x: number; y: number } {
    return { x: this.lx + TILE_W / 2, y: this.ly + TILE_H / 2 };
  }

  /**
   * Mirrors Tile.isType in Java: returns true if this tile (or its overlapping
   * interactable, e.g. a Ladder) matches the requested type.
   */
  public isType(check: TileType): boolean {
    if (this.ship !== null) {
      const i = this.ship.getInteractable(this.tileX, this.tileY);
      if (i !== null && i.type === check) return true;
    }
    return this.type === check;
  }
}
