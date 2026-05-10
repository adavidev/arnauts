import type { GameCharacter } from '../GameCharacter';

export abstract class State {
  public readonly character: GameCharacter;

  constructor(character: GameCharacter) {
    this.character = character;
  }

  abstract stand(): void;
  abstract runLeft(): void;
  abstract runRight(): void;
  abstract walkLeft(): void;
  abstract walkRight(): void;
  abstract climbUp(): void;
  abstract climbDown(): void;
}
