import { State } from './State';
import { Stand } from './Stand';

export class RunningRight extends State {
  stand(): void {
    this.character.fsm = new Stand(this.character);
  }
  runLeft(): void {
    this.character.fsm = new Stand(this.character);
  }
  runRight(): void {
    this.character.addLogicalPos(this.character.walkSpeed, 0);
  }
  walkLeft(): void {}
  walkRight(): void {}
  climbUp(): void {}
  climbDown(): void {}
}
