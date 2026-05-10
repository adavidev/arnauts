import Phaser from 'phaser';
import type { Tickable } from './Tickable';

export const TILE_W = 25;
export const TILE_H = 50;

/**
 * Base class for everything in the game tree.
 *
 * Wraps a Phaser Container and adds:
 *  - logical Y-up coordinates (lx/ly), which we mirror to Phaser's Y-down
 *    container coordinates so we can port the original libGDX math literally
 *  - a recursive tick() hook that walks GameNode descendants each frame
 */
export abstract class GameNode extends Phaser.GameObjects.Container implements Tickable {
  public lx = 0;
  public ly = 0;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    // Intentionally not calling scene.add.existing here. Top-level GameNodes
    // (e.g. Ship) should be added to the scene by their owner, child GameNodes
    // get added via Container.add(child) on their parent.
  }

  public setLogicalPos(lx: number, ly: number): this {
    this.lx = lx;
    this.ly = ly;
    this.x = lx;
    this.y = -ly;
    return this;
  }

  public addLogicalPos(dx: number, dy: number): this {
    return this.setLogicalPos(this.lx + dx, this.ly + dy);
  }

  public tick(time: number, deltaMs: number): void {
    for (const child of this.list) {
      if (child instanceof GameNode) {
        child.tick(time, deltaMs);
      }
    }
  }
}
