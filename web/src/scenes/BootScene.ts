import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.image('wall', 'assets/simple/wall.png');
    this.load.image('floor', 'assets/simple/floor.png');
    this.load.image('cieling', 'assets/simple/cieling.png');
    this.load.image('wallr', 'assets/simple/wallr.png');
    this.load.image('walll', 'assets/simple/walll.png');
    this.load.image('terminal', 'assets/simple/terminal.png');

    this.load.image('hullT', 'assets/hullT.png');
    this.load.image('hullB', 'assets/hullB.png');
    this.load.image('hullL', 'assets/hullL.png');
    this.load.image('hullR', 'assets/hullR.png');
    this.load.image('hullTL', 'assets/hullTL.png');
    this.load.image('hullTR', 'assets/hullTR.png');
    this.load.image('hullBL', 'assets/hullBL.png');
    this.load.image('hullBR', 'assets/hullBR.png');
    this.load.image('hullEmpty', 'assets/hullEmpty.png');

    // tileset1.png: 650x500. Slicing as 25x50 gives a 26-col grid.
    // Ladder lives at pixel (200, 0, 25, 50) -> col 8, row 0 -> frame 8.
    this.load.spritesheet('tileset_25x50', 'assets/tileset1.png', {
      frameWidth: 25,
      frameHeight: 50,
    });

    // capt_all_anims.png: 1500x51, 30 frames at 50x51. Stand 0-13, walk 14-29.
    this.load.spritesheet('captain', 'assets/capt_all_anims.png', {
      frameWidth: 50,
      frameHeight: 51,
    });

    // hunter-running1.png: 400x50 (8 frames of 50x50). hunter-stand1.png: 450x50.
    this.load.spritesheet('hunter_run', 'assets/hunter-running1.png', {
      frameWidth: 50,
      frameHeight: 50,
    });
    this.load.spritesheet('hunter_stand', 'assets/hunter-stand1.png', {
      frameWidth: 50,
      frameHeight: 50,
    });

    // EngiDude.png: 200x200 (4x4 grid of 50x50). Stand frame at pixel (100,100) = frame 10.
    this.load.spritesheet('engineer', 'assets/EngiDude.png', {
      frameWidth: 50,
      frameHeight: 50,
    });
  }

  create(): void {
    const FPS = 10;

    this.anims.create({
      key: 'captain_stand',
      frames: this.anims.generateFrameNumbers('captain', { start: 0, end: 13 }),
      frameRate: FPS,
      repeat: -1,
    });
    this.anims.create({
      key: 'captain_run',
      frames: this.anims.generateFrameNumbers('captain', { start: 14, end: 29 }),
      frameRate: FPS,
      repeat: -1,
    });

    this.anims.create({
      key: 'hunter_run',
      frames: this.anims.generateFrameNumbers('hunter_run', { start: 0, end: 7 }),
      frameRate: FPS,
      repeat: -1,
    });
    this.anims.create({
      key: 'hunter_stand',
      frames: this.anims.generateFrameNumbers('hunter_stand', { start: 0, end: 0 }),
      frameRate: FPS,
      repeat: -1,
    });

    this.anims.create({
      key: 'engineer_run',
      frames: this.anims.generateFrameNumbers('engineer', { start: 0, end: 7 }),
      frameRate: FPS,
      repeat: -1,
    });
    this.anims.create({
      key: 'engineer_stand',
      frames: this.anims.generateFrameNumbers('engineer', { start: 10, end: 10 }),
      frameRate: FPS,
      repeat: -1,
    });

    this.scene.start('TestScene');
  }
}
