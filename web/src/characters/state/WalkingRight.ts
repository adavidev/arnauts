import { State } from './State';
import { Stand } from './Stand';

export class WalkingRight extends State {
  stand(): void {
    this.character.fsm = new Stand(this.character);
  }
  runLeft(): void {}
  runRight(): void {}
  walkLeft(): void {}
  walkRight(): void {}
  climbUp(): void {}
  climbDown(): void {}
}
