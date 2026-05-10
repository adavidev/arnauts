import { State } from './State';
import { Stand } from './Stand';

const CLIMB_SPEED = 0.3;

export class ClimbingDown extends State {
  stand(): void {
    this.character.fsm = new Stand(this.character);
  }
  runLeft(): void {}
  runRight(): void {}
  walkLeft(): void {}
  walkRight(): void {}
  climbUp(): void {
    this.character.fsm = new Stand(this.character);
  }
  climbDown(): void {
    this.character.addLogicalPos(0, -CLIMB_SPEED);
  }
}
