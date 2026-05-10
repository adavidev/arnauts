import { State } from './State';
import { RunningLeft } from './RunningLeft';
import { RunningRight } from './RunningRight';
import { ClimbingUp } from './ClimbingUp';
import { ClimbingDown } from './ClimbingDown';

export class Stand extends State {
  stand(): void {}
  runLeft(): void {
    this.character.fsm = new RunningLeft(this.character);
  }
  runRight(): void {
    this.character.fsm = new RunningRight(this.character);
  }
  walkLeft(): void {}
  walkRight(): void {}
  climbUp(): void {
    this.character.fsm = new ClimbingUp(this.character);
  }
  climbDown(): void {
    this.character.fsm = new ClimbingDown(this.character);
  }
}
