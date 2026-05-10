import Phaser from 'phaser';
import { GameCharacter } from './GameCharacter';
import { RandomWalkAI } from './ai/RandomWalkAI';

export class Engineer extends GameCharacter {
  constructor(scene: Phaser.Scene) {
    super(scene, 'engineer', { stand: 'engineer_stand', run: 'engineer_run' });
    this.walkSpeed = 0.5;
    this.center = { x: 20, y: 20 };
    this.ai = new RandomWalkAI(this);
  }
}
