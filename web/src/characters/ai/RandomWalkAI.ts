import { AI } from './AI';
import { Astar } from './Astar';
import { Stand } from '../state/Stand';
import { Random } from '../../core/Random';
import type { GameCharacter } from '../GameCharacter';

export class RandomWalkAI extends AI {
  private checkTime = 3;
  private target: { x: number; y: number } | null = null;

  constructor(node: GameCharacter) {
    super(node);
  }

  override update(deltaSeconds: number): void {
    if (this.target === null) {
      this.target = this.node.basicCenter();
    }

    if (this.checkTime <= 0 && this.node.fsm instanceof Stand) {
      this.waitRandom();
      this.setTarget();
    }

    this.walkTo();
    this.checkTime -= deltaSeconds;
  }

  private setTarget(): void {
    try {
      const available = new Astar(this.node).available();
      if (available.length === 0) return;
      const pick = available[Random.rand(Date.now(), available.length)];
      this.target = pick.current.basicCenter();
    } catch {
      // Character not on a ship tile yet; will retry next frame.
    }
  }

  private waitRandom(): void {
    this.checkTime = Random.rand(Date.now(), 4) + 3;
  }

  private walkTo(): void {
    if (!this.target) return;
    const npos = this.node.basicCenter();
    if (this.target.x > npos.x + 1) {
      this.node.fsm.runRight();
    } else if (this.target.x < npos.x - 1) {
      this.node.fsm.runLeft();
    } else {
      this.node.fsm.stand();
    }
  }
}
