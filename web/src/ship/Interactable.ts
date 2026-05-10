import Phaser from 'phaser';
import { GameNode, TILE_W, TILE_H } from '../core/GameNode';
import { TileType } from './TileType';
import type { Ship } from './Ship';

export interface TileCoord {
  x: number;
  y: number;
}

export type InteractableKind = 'ladder' | 'terminal';

export abstract class Interactable extends GameNode {
  /** Persistable category; null for placeholders like {@link NoInteraction}. */
  public readonly interactableKind: InteractableKind | null = null;
  public type: TileType = TileType.Climbable;
  public tileX = 0;
  public tileY = 0;
  public ship: Ship | null = null;

  /** Tile coordinates this interactable occupies (most are single-cell). */
  public coordinates: TileCoord[] = [];

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
    this.coordinates = [];
    this.addCoordinates();
  }

  protected abstract addCoordinates(): void;
}
