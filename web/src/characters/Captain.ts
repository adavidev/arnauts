import Phaser from 'phaser';
import { GameCharacter } from './GameCharacter';
import { RandomTravelAI } from './ai/RandomTravelAI';

export class Captain extends GameCharacter {
  constructor(scene: Phaser.Scene) {
    super(scene, 'captain', { stand: 'captain_stand', run: 'captain_run' });
    this.walkSpeed = 0.3;
    this.center = { x: 20, y: 20 };
    this.ai = new RandomTravelAI(this);
  }
}
