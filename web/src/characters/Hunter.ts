import Phaser from 'phaser';
import { GameCharacter } from './GameCharacter';
import { RandomTravelAI } from './ai/RandomTravelAI';

export class Hunter extends GameCharacter {
  constructor(scene: Phaser.Scene) {
    super(scene, 'hunter_run', { stand: 'hunter_stand', run: 'hunter_run' });
    this.walkSpeed = 1.6;
    this.climbSpeed = 0.6;
    this.center = { x: 20, y: 20 };
    this.ai = new RandomTravelAI(this);
  }
}
