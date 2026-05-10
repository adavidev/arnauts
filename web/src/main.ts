import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { HudScene } from './scenes/HudScene';
import { TestScene } from './scenes/TestScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 800,
  height: 600,
  backgroundColor: '#333333',
  pixelArt: true,
  scene: [BootScene, TestScene, HudScene],
  scale: {
    mode: Phaser.Scale.NONE,
  },
};

new Phaser.Game(config);
