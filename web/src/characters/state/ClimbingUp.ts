import { State } from './State';
import { Stand } from './Stand';

const CLIMB_SPEED = 0.3;

export class ClimbingUp extends State {
  stand(): void {
    this.character.fsm = new Stand(this.character);
  }
  runLeft(): void {}
  runRight(): void {}
  walkLeft(): void {}
  walkRight(): void {}
  climbUp(): void {
    this.character.addLogicalPos(0, CLIMB_SPEED);
  }
  climbDown(): void {
    this.character.fsm = new Stand(this.character);
  }
}
