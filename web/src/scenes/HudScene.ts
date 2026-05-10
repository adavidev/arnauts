import Phaser from 'phaser';

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const HOTBAR_HEIGHT = 70;

export type PlaceableComponent = 'hull' | 'ladder' | 'terminal' | 'ring';

interface HotbarSlot {
  number: number;
  component: PlaceableComponent | null;
  label: string;
  textureKey: string | null;
  frame?: number;
}

const SLOT_SIZE = 54;
const SLOT_GAP = 8;
const HOTBAR_Y = GAME_HEIGHT - HOTBAR_HEIGHT;

const HOTBAR_SLOTS: HotbarSlot[] = [
  { number: 1, component: 'hull', label: 'Hull', textureKey: 'wall' },
  { number: 2, component: 'ladder', label: 'Ladder', textureKey: 'tileset_25x50', frame: 8 },
  { number: 3, component: 'terminal', label: 'Term', textureKey: 'terminal' },
  { number: 4, component: 'ring', label: 'Ring ⇧ seal', textureKey: 'wall' },
  { number: 5, component: null, label: '', textureKey: null },
  { number: 6, component: null, label: '', textureKey: null },
  { number: 7, component: null, label: '', textureKey: null },
  { number: 8, component: null, label: '', textureKey: null },
  { number: 9, component: null, label: '', textureKey: null },
];

const KEY_EVENTS = [
  'keydown-ONE',
  'keydown-TWO',
  'keydown-THREE',
  'keydown-FOUR',
  'keydown-FIVE',
  'keydown-SIX',
  'keydown-SEVEN',
  'keydown-EIGHT',
  'keydown-NINE',
];

export class HudScene extends Phaser.Scene {
  private slotBackgrounds = new Map<number, Phaser.GameObjects.Rectangle>();

  constructor() {
    super('HudScene');
  }

  create(): void {
    this.registry.set('selectedComponent', null);

    this.add
      .rectangle(0, HOTBAR_Y, GAME_WIDTH, HOTBAR_HEIGHT, 0x05070f, 0.94)
      .setOrigin(0, 0)
      .setDepth(1000);

    const totalWidth = HOTBAR_SLOTS.length * SLOT_SIZE + (HOTBAR_SLOTS.length - 1) * SLOT_GAP;
    const startX = (GAME_WIDTH - totalWidth) / 2;
    const y = HOTBAR_Y + (HOTBAR_HEIGHT - SLOT_SIZE) / 2;

    for (const slot of HOTBAR_SLOTS) {
      this.createSlot(slot, startX + (slot.number - 1) * (SLOT_SIZE + SLOT_GAP), y);
      const eventName = KEY_EVENTS[slot.number - 1];
      this.input.keyboard?.on(eventName, () => this.selectSlot(slot));
    }

    this.registry.events.on('changedata-selectedComponent', this.updateSelection, this);
    this.updateSelection();

    const pick = document.createElement('input');
    pick.type = 'file';
    pick.accept = '.sqlite,.sqlite3,.json,application/x-sqlite3';
    pick.style.display = 'none';
    document.body.appendChild(pick);
    pick.addEventListener('change', () => {
      const f = pick.files?.[0];
      if (f) this.registry.events.emit('authoring-import-file', f);
      pick.value = '';
    });

    const btnStyle = {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#e8f0ff',
      backgroundColor: '#1a2540',
      padding: { x: 6, y: 4 },
    };
    const depth = 2002;
    let authY = 8;
    this.add
      .text(8, authY, 'Export SQLite', btnStyle)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(depth)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () =>
        this.registry.events.emit('authoring-export-sqlite'),
      );
    authY += 22;
    this.add
      .text(8, authY, 'Export JSON', btnStyle)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(depth)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.registry.events.emit('authoring-export-json'));
    authY += 22;
    this.add
      .text(8, authY, 'Import map…', btnStyle)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(depth)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => pick.click());
  }

  private createSlot(slot: HotbarSlot, x: number, y: number): void {
    const container = this.add.container(x, y).setDepth(1001);
    const bg = this.add
      .rectangle(0, 0, SLOT_SIZE, SLOT_SIZE, 0x111827, 0.98)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x5f6f8f, slot.component === null ? 0.3 : 1);
    container.add(bg);
    this.slotBackgrounds.set(slot.number, bg);

    this.add
      .text(x + 5, y + 4, String(slot.number), {
        color: slot.component === null ? '#677089' : '#ffffff',
        fontFamily: 'monospace',
        fontSize: '12px',
      })
      .setDepth(1002);

    if (slot.textureKey !== null) {
      const icon = this.add
        .image(x + SLOT_SIZE / 2, y + 24, slot.textureKey, slot.frame)
        .setDisplaySize(25, 42)
        .setDepth(1002);
      container.add(icon);

      this.add
        .text(x + SLOT_SIZE / 2, y + SLOT_SIZE - 13, slot.label, {
          align: 'center',
          color: '#ffffff',
          fontFamily: 'monospace',
          fontSize: '10px',
        })
        .setOrigin(0.5, 0.5)
        .setDepth(1002);
    }

    bg.setInteractive({ useHandCursor: slot.component !== null });
    bg.on('pointerdown', () => this.selectSlot(slot));
    bg.on('pointerover', () => {
      if (slot.component !== null) bg.setStrokeStyle(2, 0xdce8ff, 1);
    });
    bg.on('pointerout', () => this.updateSelection());
  }

  private selectSlot(slot: HotbarSlot): void {
    this.registry.set('selectedComponent', slot.component);
  }

  private updateSelection(): void {
    const selected = this.registry.get('selectedComponent') as PlaceableComponent | null;
    for (const slot of HOTBAR_SLOTS) {
      const bg = this.slotBackgrounds.get(slot.number);
      if (!bg) continue;

      const isSelected = slot.component !== null && slot.component === selected;
      bg.setFillStyle(isSelected ? 0x2f5fb3 : 0x111827, slot.component === null ? 0.45 : 0.98);
      bg.setStrokeStyle(isSelected ? 4 : 2, isSelected ? 0xffdd66 : 0x5f6f8f, slot.component === null ? 0.3 : 1);
    }
  }
}
