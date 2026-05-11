import Phaser from 'phaser';
import {
  DEFAULT_BINDINGS,
  INPUT_ACTIONS,
  type InputAction,
  type InputBindingsConfig,
  mergeWithDefaults,
} from '../input/keyBindings';
import {
  mergeRulePresetsWithDefaults,
  placementRuleIds,
  type PlacementRulePresetsConfig,
} from '../placement/rulePresets';
import { placementRuleUiMetas } from '../placement/rules/registry';
import { loadInputBindings, saveInputBindings } from '../persistence/inputSettingsStore';
import {
  loadPlacementRulePresets,
  savePlacementRulePresets,
} from '../persistence/placementRulePresetsStore';
import { GAME_HEIGHT, GAME_WIDTH } from './HudScene';

const ACTION_LABEL: Record<InputAction, string> = {
  cameraPanLeft: 'Pan left',
  cameraPanRight: 'Pan right',
  cameraPanUp: 'Pan up',
  cameraPanDown: 'Pan down',
  rotateShipLeft: 'Rotate ship left',
  rotateShipRight: 'Rotate ship right',
  toggleTopologyDebug: 'Topology debug',
  stripInteriorHull: 'Strip interior hull (with Shift)',
};

type OptionsView = 'hub' | 'keys' | 'tiles';

/**
 * Options hub from MenuScene: choose Key bindings or Tile mapping (placement presets).
 */
export class OptionsScene extends Phaser.Scene {
  private bindingsDraft!: InputBindingsConfig;
  private presetsDraft!: PlacementRulePresetsConfig;
  private captureAction: InputAction | null = null;
  private statusText!: Phaser.GameObjects.Text;
  private codeTexts = new Map<InputAction, Phaser.GameObjects.Text>();
  private presetBoxes = new Map<string, Phaser.GameObjects.Rectangle>();
  private domKeyHandler!: (e: KeyboardEvent) => void;
  /** Holds hub / keys / tiles UI (not global backdrop). */
  private contentRoot!: Phaser.GameObjects.Container;
  private view: OptionsView = 'hub';
  private tilesScrollState: {
    root: Phaser.GameObjects.Container;
    maxScroll: number;
    scrollPos: number;
    scrollTop: number;
    scrollBottom: number;
  } | null = null;
  private tilesWheelHandler:
    | ((
        pointer: Phaser.Input.Pointer,
        gameObjects: Phaser.GameObjects.GameObject[],
        deltaX: number,
        deltaY: number,
        deltaZ: number,
        event: WheelEvent,
      ) => void)
    | null = null;

  constructor() {
    super('OptionsScene');
  }

  create(): void {
    this.bindingsDraft = mergeWithDefaults({});
    this.presetsDraft = mergeRulePresetsWithDefaults({});

    this.cameras.main.setBackgroundColor('#0d1117');

    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0d1117, 0.97)
      .setDepth(0);

    this.statusText = this.add
      .text(24, GAME_HEIGHT - 36, '', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#58a6ff',
      })
      .setDepth(20);

    this.contentRoot = this.add.container(0, 0).setDepth(10);

    this.domKeyHandler = (e: KeyboardEvent) => {
      if (this.captureAction === null || this.view !== 'keys') return;
      e.preventDefault();
      e.stopPropagation();
      if (e.code === 'Escape') {
        this.captureAction = null;
        this.statusText.setText('Capture cancelled.');
        return;
      }
      const action = this.captureAction;
      const cur = [...this.bindingsDraft[action]];
      if (!cur.includes(e.code)) cur.push(e.code);
      this.bindingsDraft[action] = cur;
      this.captureAction = null;
      this.refreshCodesText(action);
      this.statusText.setText(`Added ${e.code} to ${ACTION_LABEL[action]}`);
    };
    window.addEventListener('keydown', this.domKeyHandler, true);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('keydown', this.domKeyHandler, true);
    });

    this.showHub();
  }

  private clearContent(): void {
    this.captureAction = null;
    this.codeTexts.clear();
    this.presetBoxes.clear();
    if (this.tilesWheelHandler) {
      this.input.off('wheel', this.tilesWheelHandler);
      this.tilesWheelHandler = null;
    }
    this.tilesScrollState = null;
    this.contentRoot.removeAll(true);
  }

  private showHub(): void {
    this.clearContent();
    this.view = 'hub';
    this.statusText.setText('');

    this.addTopBar('Options', () => {
      this.scene.resume('MenuScene');
      this.scene.stop('OptionsScene');
    });

    this.contentRoot.add(
      this.add
        .text(GAME_WIDTH / 2, 120, 'Choose a category', {
          fontFamily: 'monospace',
          fontSize: '13px',
          color: '#8b949e',
        })
        .setOrigin(0.5, 0.5),
    );

    this.makeHubMenuButton(GAME_WIDTH / 2, 220, 'Key bindings', () => void this.showKeys());
    this.makeHubMenuButton(GAME_WIDTH / 2, 300, 'Tile mapping', () => void this.showTiles());

    this.contentRoot.add(
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT - 90, 'Back returns to the main menu.', {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#8b949e',
        })
        .setOrigin(0.5, 0.5),
    );
  }

  private addTopBar(title: string, onBack: () => void): void {
    const titleTx = this.add
      .text(24, 20, title, {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#e6edf3',
      })
      .setDepth(11);
    const back = this.add
      .rectangle(GAME_WIDTH - 100, 36, 88, 36, 0x21262d)
      .setStrokeStyle(2, 0x30363d)
      .setInteractive({ useHandCursor: true })
      .setDepth(11);
    const backTx = this.add
      .text(GAME_WIDTH - 100, 36, 'Back', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#f0f6fc',
      })
      .setOrigin(0.5, 0.5)
      .setDepth(12);
    back.on('pointerdown', onBack);
    this.contentRoot.add([titleTx, back, backTx]);
  }

  private makeHubMenuButton(x: number, y: number, label: string, onClick: () => void): void {
    const bg = this.add
      .rectangle(x, y, 260, 44, 0x21262d)
      .setStrokeStyle(2, 0x30363d)
      .setInteractive({ useHandCursor: true })
      .setDepth(11);
    const tx = this.add
      .text(x, y, label, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#f0f6fc',
      })
      .setOrigin(0.5, 0.5)
      .setDepth(12);
    bg.on('pointerover', () => bg.setFillStyle(0x30363d));
    bg.on('pointerout', () => bg.setFillStyle(0x21262d));
    bg.on('pointerdown', onClick);
    this.contentRoot.add([bg, tx]);
  }

  private async showKeys(): Promise<void> {
    this.clearContent();
    this.view = 'keys';

    this.addTopBar('Key bindings', () => this.showHub());

    this.contentRoot.add(
      this.add
        .text(GAME_WIDTH / 2, 52, 'Key changes apply when you start or restart the game.', {
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#8b949e',
        })
        .setOrigin(0.5, 0.5),
    );

    const loaded = mergeWithDefaults(await loadInputBindings());
    this.bindingsDraft = loaded;

    let y = 80;
    for (const action of INPUT_ACTIONS) {
      this.addKeyRow(action, y);
      y += 46;
    }

    this.makeWideButton(GAME_WIDTH / 2, GAME_HEIGHT - 86, 'Apply & save keys to database', () => {
      void saveInputBindings(this.bindingsDraft);
      this.statusText.setText('Keys saved. Restart or start game to use them.');
    });

    this.makeWideButton(GAME_WIDTH / 2, GAME_HEIGHT - 44, 'Reset all keys to defaults', () => {
      this.bindingsDraft = mergeWithDefaults({});
      for (const action of INPUT_ACTIONS) {
        this.refreshCodesText(action);
      }
      void saveInputBindings(this.bindingsDraft);
      this.statusText.setText('Keys reset and saved.');
    });
  }

  private async showTiles(): Promise<void> {
    this.clearContent();
    this.view = 'tiles';

    this.addTopBar('Tile mapping', () => this.showHub());

    this.contentRoot.add(
      this.add
        .text(
          GAME_WIDTH / 2,
          52,
          [
            'One checklist for all shipyard placement (hull, ladder, terminal, ring).',
            'Each rule runs only when it applies to what you are placing (see each line).',
            'These are shipyard placement checks, not crew walkability.',
            'Applied when you start the shipyard.',
          ].join(' '),
          {
            fontFamily: 'monospace',
            fontSize: '10px',
            color: '#8b949e',
            align: 'center',
            wordWrap: { width: GAME_WIDTH - 48 },
          },
        )
        .setOrigin(0.5, 0.5),
    );

    this.presetsDraft = mergeRulePresetsWithDefaults(await loadPlacementRulePresets());

    /** Scroll region: below helper text, above footer buttons. */
    const SCROLL_TOP = 78;
    const SCROLL_BOTTOM = GAME_HEIGHT - 98;
    const VIEWPORT_H = SCROLL_BOTTOM - SCROLL_TOP;

    const tilesScrollRoot = this.add.container(0, SCROLL_TOP);
    this.contentRoot.add(tilesScrollRoot);

    let y = 0;
    const rowGap = (hasDesc: boolean): number => (hasDesc ? 34 : 22);
    const metas = placementRuleUiMetas();

    const sec = this.add
      .text(28, y, 'Placement rules', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#f0f6fc',
      })
      .setOrigin(0, 0);
    tilesScrollRoot.add(sec);
    y += 22;

    for (const meta of metas) {
      const rid = meta.id;
      const descText = meta.description ?? '';
      const hasDesc = Boolean(descText);
      const midY = y + (hasDesc ? 14 : 9);
      const box = this.add
        .rectangle(36, midY, 14, 14, this.presetOn(rid) ? 0x238636 : 0x484f58)
        .setStrokeStyle(1, 0xffffff)
        .setInteractive({ useHandCursor: true })
        .setOrigin(0.5, 0.5);
      box.on('pointerdown', () => {
        this.presetsDraft.global[rid] = !this.presetsDraft.global[rid];
        box.setFillStyle(this.presetOn(rid) ? 0x238636 : 0x484f58);
      });
      this.presetBoxes.set(rid, box);
      tilesScrollRoot.add(box);

      const titleTx = this.add
        .text(54, y, meta.label, {
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#c9d1d9',
          wordWrap: { width: GAME_WIDTH - 90 },
        })
        .setOrigin(0, 0);
      tilesScrollRoot.add(titleTx);

      if (hasDesc) {
        const descTx = this.add.text(54, y + 14, descText, {
          fontFamily: 'monospace',
          fontSize: '10px',
          color: '#8b949e',
          wordWrap: { width: GAME_WIDTH - 90 },
        });
        tilesScrollRoot.add(descTx);
      }

      y += rowGap(hasDesc);
    }

    const contentHeight = y;
    const maxScroll = Math.max(0, contentHeight - VIEWPORT_H);

    const maskGfx = this.add.graphics();
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(0, SCROLL_TOP, GAME_WIDTH, VIEWPORT_H);
    maskGfx.setVisible(false);
    tilesScrollRoot.setMask(maskGfx.createGeometryMask());
    this.contentRoot.add(maskGfx);

    this.tilesScrollState = {
      root: tilesScrollRoot,
      maxScroll,
      scrollPos: 0,
      scrollTop: SCROLL_TOP,
      scrollBottom: SCROLL_BOTTOM,
    };

    this.tilesWheelHandler = (pointer, _go, _dx, dy) => {
      if (this.view !== 'tiles' || !this.tilesScrollState) return;
      const st = this.tilesScrollState;
      if (st.maxScroll <= 0) return;
      if (pointer.y < st.scrollTop || pointer.y > st.scrollBottom) return;
      st.scrollPos = Phaser.Math.Clamp(st.scrollPos + dy * 0.35, 0, st.maxScroll);
      st.root.y = st.scrollTop - st.scrollPos;
    };
    this.input.on('wheel', this.tilesWheelHandler);

    this.makeWideButton(GAME_WIDTH / 2, GAME_HEIGHT - 86, 'Apply & save placement presets', () => {
      void savePlacementRulePresets(this.presetsDraft);
      this.statusText.setText('Placement presets saved. Start game to use them.');
    });

    this.makeWideButton(GAME_WIDTH / 2, GAME_HEIGHT - 44, 'Reset placement presets to defaults', () => {
      this.presetsDraft = mergeRulePresetsWithDefaults({});
      for (const rid of placementRuleIds()) {
        const box = this.presetBoxes.get(rid);
        if (box) box.setFillStyle(this.presetOn(rid) ? 0x238636 : 0x484f58);
      }
      void savePlacementRulePresets(this.presetsDraft);
      this.statusText.setText('Placement presets reset and saved.');
    });
  }

  private presetOn(rid: string): boolean {
    return this.presetsDraft.global[rid];
  }

  private addKeyRow(action: InputAction, y: number): void {
    const label = this.add
      .text(24, y, ACTION_LABEL[action], {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#c9d1d9',
        wordWrap: { width: 200 },
      })
      .setOrigin(0, 0)
      .setDepth(11);
    const codes = this.add
      .text(240, y, this.codesLine(action), {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#8b949e',
        wordWrap: { width: 280 },
      })
      .setOrigin(0, 0)
      .setDepth(11);
    this.codeTexts.set(action, codes);

    const bx = 540;
    this.contentRoot.add([label, codes]);
    this.makeSmallButton(bx, y + 8, 'Add key', () => {
      this.captureAction = action;
      this.statusText.setText(`Press a key for "${ACTION_LABEL[action]}" (Esc to cancel)`);
    });
    this.makeSmallButton(bx + 78, y + 8, 'Clear', () => {
      this.bindingsDraft[action] = [];
      this.refreshCodesText(action);
    });
    this.makeSmallButton(bx + 148, y + 8, 'Row reset', () => {
      this.bindingsDraft[action] = [...DEFAULT_BINDINGS[action]];
      this.refreshCodesText(action);
    });
  }

  private codesLine(action: InputAction): string {
    return this.bindingsDraft[action].join(', ') || '(none)';
  }

  private refreshCodesText(action: InputAction): void {
    const t = this.codeTexts.get(action);
    if (t) t.setText(this.codesLine(action));
  }

  private makeSmallButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ): void {
    const bg = this.add
      .rectangle(x, y, 72, 26, 0x21262d)
      .setStrokeStyle(1, 0x30363d)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0, 0.5)
      .setDepth(11);
    const tx = this.add
      .text(x + 36, y, label, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#f0f6fc',
      })
      .setOrigin(0.5, 0.5)
      .setDepth(12);
    bg.on('pointerdown', onClick);
    this.contentRoot.add([bg, tx]);
  }

  private makeWideButton(x: number, y: number, label: string, onClick: () => void): void {
    const bg = this.add
      .rectangle(x, y, 420, 34, 0x238636)
      .setInteractive({ useHandCursor: true })
      .setDepth(11);
    const tx = this.add
      .text(x, y, label, {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#ffffff',
      })
      .setOrigin(0.5, 0.5)
      .setDepth(12);
    bg.on('pointerdown', onClick);
    this.contentRoot.add([bg, tx]);
  }
}
