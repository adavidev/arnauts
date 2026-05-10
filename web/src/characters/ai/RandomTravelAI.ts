import { AI } from './AI';
import { Astar, type ANode } from './Astar';
import { Stand } from '../state/Stand';
import { TileType } from '../../ship/TileType';
import { Random } from '../../core/Random';
import type { GameCharacter } from '../GameCharacter';

export class RandomTravelAI extends AI {
  private checkTime = 3;
  private target: { x: number; y: number } | null = null;
  private path: ANode[] = [];

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

    this.travelTo();
    this.checkTime -= deltaSeconds;
  }

  private setTarget(): void {
    try {
      const astar = new Astar(this.node);
      const available = astar.available();
      if (available.length === 0) return;
      const pick = available[Random.rand(Date.now(), available.length)];
      this.path = astar.findTarget(pick.current);
      if (this.path.length > 0) this.target = this.path[0].current.basicCenter();
    } catch {
      // Character not on a ship tile yet; will retry next frame.
    }
  }

  private waitRandom(): void {
    this.checkTime = Random.rand(Date.now(), 4) + 3;
  }

  private travelTo(): void {
    if (this.path.length === 0) return;
    const head = this.path[0];
    if (head.type === TileType.Walkable) {
      this.walkTo();
    } else if (head.type === TileType.Climbable) {
      this.climbTo();
    }
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
      this.advancePath();
    }
  }

  private climbTo(): void {
    if (!this.target) return;
    const npos = this.node.basicCenter();
    if (this.target.y > npos.y + 6) {
      this.node.fsm.climbUp();
    } else if (this.target.y < npos.y + 8) {
      this.node.fsm.climbDown();
    } else {
      this.node.fsm.stand();
      this.advancePath();
    }
  }

  private advancePath(): void {
    this.path.shift();
    if (this.path.length > 0) {
      this.target = this.path[0].current.basicCenter();
    }
  }
}
