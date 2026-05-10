import { State } from './State';
import { Stand } from './Stand';

export class RunningLeft extends State {
  stand(): void {
    this.character.fsm = new Stand(this.character);
  }
  runLeft(): void {
    this.character.addLogicalPos(-this.character.walkSpeed, 0);
  }
  runRight(): void {
    this.character.fsm = new Stand(this.character);
  }
  walkLeft(): void {}
  walkRight(): void {}
  climbUp(): void {}
  climbDown(): void {}
}
