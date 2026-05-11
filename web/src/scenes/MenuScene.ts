import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from './HudScene';

/**
 * Main menu after BootScene preload.
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0d1117');

    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0d1117)
      .setDepth(0);

    this.add
      .text(GAME_WIDTH / 2, 72, 'Aronauts', {
        fontFamily: 'monospace',
        fontSize: '36px',
        color: '#e6edf3',
      })
      .setOrigin(0.5, 0.5)
      .setDepth(1);

    this.add
      .text(GAME_WIDTH / 2, 130, 'Space RTS — shipyard', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#8b949e',
      })
      .setOrigin(0.5, 0.5)
      .setDepth(1);

    this.makeMenuButton(GAME_WIDTH / 2, 220, 'Start game', () => {
      this.scene.start('TestScene');
    });

    this.makeMenuButton(GAME_WIDTH / 2, 290, 'Options', () => {
      this.scene.pause('MenuScene');
      this.scene.launch('OptionsScene');
    });

    this.makeMenuButton(GAME_WIDTH / 2, 360, 'Quit', () => {
      window.close();
    });
  }

  private makeMenuButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ): void {
    const bg = this.add
      .rectangle(x, y, 260, 44, 0x21262d)
      .setStrokeStyle(2, 0x30363d)
      .setInteractive({ useHandCursor: true })
      .setDepth(1);

    this.add
      .text(x, y, label, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#f0f6fc',
      })
      .setOrigin(0.5, 0.5)
      .setDepth(2);

    bg.on('pointerover', () => bg.setFillStyle(0x30363d));
    bg.on('pointerout', () => bg.setFillStyle(0x21262d));
    bg.on('pointerdown', onClick);
  }
}
