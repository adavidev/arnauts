import type { GameCharacter } from '../GameCharacter';

export abstract class AI {
  protected node: GameCharacter;

  constructor(node: GameCharacter) {
    this.node = node;
  }

  abstract update(deltaSeconds: number): void;
}
