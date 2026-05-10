import Phaser from 'phaser';
import { GameNode, TILE_W, TILE_H } from '../core/GameNode';
import type { Ship } from '../ship/Ship';
import type { Tile } from '../ship/Tile';
import { TileType } from '../ship/TileType';
import { State } from './state/State';
import { Stand } from './state/Stand';
import { RunningLeft } from './state/RunningLeft';
import { RunningRight } from './state/RunningRight';
import type { AI } from './ai/AI';

export interface CharacterAnims {
  stand: string;
  run: string;
}

const SPRITE_SIZE = 45;

export abstract class GameCharacter extends GameNode {
  public ship: Ship | null = null;
  public walkSpeed = 0.5;
  public climbSpeed = 0.3;
  public center = { x: 20, y: 20 };
  public fsm: State;
  public ai: AI | null = null;

  protected sprite: Phaser.GameObjects.Sprite;
  protected anims: CharacterAnims;

  constructor(scene: Phaser.Scene, textureKey: string, anims: CharacterAnims) {
    super(scene);
    this.anims = anims;
    this.fsm = new Stand(this);

    this.sprite = scene.make.sprite({ x: 0, y: 0, key: textureKey }).setOrigin(0, 0);
    this.sprite.setDisplaySize(SPRITE_SIZE, SPRITE_SIZE);
    this.add(this.sprite);
    this.sprite.play(anims.stand);
  }

  public setShip(ship: Ship): void {
    this.ship = ship;
  }

  public basicCenter(): { x: number; y: number } {
    return { x: this.lx + this.center.x, y: this.ly + this.center.y };
  }

  public currentTile(): Tile | null {
    if (!this.ship) return null;
    const c = this.basicCenter();
    return this.ship.getTile(Math.floor(c.x / TILE_W), Math.floor(c.y / TILE_H));
  }

  public at(typeOrTile: TileType | Tile): boolean {
    const t = this.currentTile();
    if (!t) return false;
    if (typeof typeOrTile === 'string') return t.type === typeOrTile;
    return t === typeOrTile;
  }

  override tick(time: number, deltaMs: number): void {
    this.ai?.update(deltaMs / 1000);
    this.syncSprite();
    super.tick(time, deltaMs);
  }

  private syncSprite(): void {
    if (this.fsm instanceof RunningLeft) {
      this.playIfDifferent(this.anims.run);
      this.sprite.flipX = true;
    } else if (this.fsm instanceof RunningRight) {
      this.playIfDifferent(this.anims.run);
      this.sprite.flipX = false;
    } else {
      this.playIfDifferent(this.anims.stand);
    }
  }

  private playIfDifferent(key: string): void {
    if (this.sprite.anims.currentAnim?.key !== key) {
      this.sprite.play(key);
    }
  }
}
