import Phaser from 'phaser';
import type { Ship } from '../ship/Ship';
import {
  GAME_HEIGHT,
  HOTBAR_HEIGHT,
  type PlaceableComponent,
} from '../scenes/HudScene';
import type { PlacementToolKind } from '../placement/placementTools';
import type { PlacementRulePresetsConfig } from '../placement/rulePresets';
import { enabledRuleIdsFromPreset } from '../placement/rulePresets';
import { buildProbeRuleContext } from '../placement/probeContext';
import { evaluatePlacementRules, placementRuleUiMetas } from '../placement/rules/registry';
import { summarizeNeighborsCardinal } from '../placement/debugSnapshot';
const PANEL_W = 216;
const DEPTH_UI = 2600;
/** Scroll region for rule toggles (below header; keeps neighbor + actions reachable). */
const RULE_SCROLL_TOP = 74;
const RULE_VIEWPORT_H = 210;

function toolFromPlaceable(p: PlaceableComponent | null | undefined): PlacementToolKind | null {
  if (p == null) return null;
  return p;
}

export interface TileToolsPanelDeps {
  getShip: () => Ship;
  presetRef: { current: PlacementRulePresetsConfig };
  getTool: () => PlaceableComponent | null;
  getRingCorner: () => { x: number; y: number } | null;
  shiftSeal: () => boolean;
  onSavePresets: () => Promise<void>;
  importFile: (f: File) => Promise<void>;
  exportSqlite: () => Promise<void>;
  exportJson: () => Promise<void>;
  neighborRef: { current: boolean };
}

/**
 * Right-column authoring UI: rule toggles, import/save, placement probe.
 * Child coordinates are relative to the panel container (top-left of strip).
 */
export class TileToolsPanel {
  private readonly container: Phaser.GameObjects.Container;
  private readonly probeText: Phaser.GameObjects.Text;
  private readonly toolTitle: Phaser.GameObjects.Text;
  private readonly ruleBoxes = new Map<string, Phaser.GameObjects.Rectangle>();
  private readonly ruleDescriptionTexts = new Map<string, Phaser.GameObjects.Text>();
  private readonly neighborBox: Phaser.GameObjects.Rectangle;
  private readonly deps: TileToolsPanelDeps;
  private visible = false;
  private rulesScrollState: {
    root: Phaser.GameObjects.Container;
    maxScroll: number;
    scrollPos: number;
  } | null = null;
  private readonly rulesWheelHandler: (
    pointer: Phaser.Input.Pointer,
    gameObjects: Phaser.GameObjects.GameObject[],
    deltaX: number,
    deltaY: number,
    deltaZ: number,
    event: WheelEvent,
  ) => void;

  constructor(scene: Phaser.Scene, deps: TileToolsPanelDeps) {
    this.deps = deps;

    this.rulesWheelHandler = (pointer, _go, _dx, dy) => {
      if (!this.visible || !this.rulesScrollState) return;
      const st = this.rulesScrollState;
      if (st.maxScroll <= 0) return;
      const left = this.container.x;
      const px = pointer.x;
      const py = pointer.y;
      if (px < left || px > left + PANEL_W) return;
      if (py < RULE_SCROLL_TOP || py > RULE_SCROLL_TOP + RULE_VIEWPORT_H) return;
      st.scrollPos = Phaser.Math.Clamp(st.scrollPos + dy * 0.35, 0, st.maxScroll);
      st.root.y = RULE_SCROLL_TOP - st.scrollPos;
    };

    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(DEPTH_UI);
    this.container.setVisible(false);

    const bg = scene.add
      .rectangle(0, 0, PANEL_W, GAME_HEIGHT, 0x0d1117, 0.92)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x30363d);
    this.container.add(bg);

    this.container.add(
      scene.add.text(10, 12, 'Tile tools', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#f0f6fc',
      }),
    );

    this.toolTitle = scene.add.text(10, 34, 'Tool: —', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#8b949e',
      wordWrap: { width: PANEL_W - 20 },
    });
    this.container.add(this.toolTitle);

    this.container.add(
      scene.add.text(10, 58, 'Placement rules', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#8b949e',
      }),
    );

    const rulesScrollRoot = scene.add.container(0, RULE_SCROLL_TOP);
    let ry = 0;
    for (const meta of placementRuleUiMetas()) {
      const rid = meta.id;
      const title = scene.add.text(28, ry, meta.label, {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#c9d1d9',
        wordWrap: { width: PANEL_W - 44 },
      });
      const box = scene.add
        .rectangle(14, ry + 6, 12, 12, 0x238636)
        .setStrokeStyle(1, 0xffffff)
        .setInteractive({ useHandCursor: true });
      box.on('pointerdown', () => this.toggleRule(rid));
      this.ruleBoxes.set(rid, box);
      rulesScrollRoot.add([title, box]);
      let step = 22;
      if (meta.description) {
        const descStr = meta.description;
        const desc = scene.add.text(28, ry + 14, descStr, {
          fontFamily: 'monospace',
          fontSize: '9px',
          color: '#8b949e',
          wordWrap: { width: PANEL_W - 36 },
        });
        rulesScrollRoot.add(desc);
        this.ruleDescriptionTexts.set(rid, desc);
        step = 36;
      }
      ry += step;
    }

    const rulesContentH = ry;
    const rulesMaxScroll = Math.max(0, rulesContentH - RULE_VIEWPORT_H);

    const maskGfx = scene.add.graphics();
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(0, RULE_SCROLL_TOP, PANEL_W, RULE_VIEWPORT_H);
    maskGfx.setVisible(false);
    rulesScrollRoot.setMask(maskGfx.createGeometryMask());
    this.container.add([rulesScrollRoot, maskGfx]);

    this.rulesScrollState = {
      root: rulesScrollRoot,
      maxScroll: rulesMaxScroll,
      scrollPos: 0,
    };

    scene.input.on('wheel', this.rulesWheelHandler);

    let ny = RULE_SCROLL_TOP + RULE_VIEWPORT_H + 10;
    this.container.add(
      scene.add.text(28, ny, '8-neighbor highlight', {
        fontFamily: 'monospace',
        fontSize: '11px',
        color: '#c9d1d9',
      }),
    );
    this.neighborBox = scene.add
      .rectangle(14, ny + 6, 12, 12, 0x30363d)
      .setStrokeStyle(1, 0xffffff)
      .setInteractive({ useHandCursor: true });
    this.neighborBox.on('pointerdown', () => {
      deps.neighborRef.current = !deps.neighborRef.current;
      this.refreshNeighborBox();
      const ship = deps.getShip();
      ship.setNeighborHighlight(null, null, false);
    });
    this.container.add(this.neighborBox);

    ny += 36;
    this.addRowButton(scene, 10, ny, 'Import map…', () => {
      document.getElementById('tile-tools-import')?.click();
    });
    ny += 34;
    this.addRowButton(scene, 10, ny, 'Save rule presets', () => void deps.onSavePresets());
    ny += 34;
    this.addRowButton(scene, 10, ny, 'Export SQLite', () => void deps.exportSqlite());
    ny += 34;
    this.addRowButton(scene, 10, ny, 'Export JSON', () => void deps.exportJson());
    ny += 34;

    const probeY = Math.min(ny + 12, GAME_HEIGHT - HOTBAR_HEIGHT - 16);
    this.probeText = scene.add.text(10, probeY, '', {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#8b949e',
      wordWrap: { width: PANEL_W - 16 },
    });
    this.container.add(this.probeText);

    const input = document.createElement('input');
    input.type = 'file';
    input.id = 'tile-tools-import';
    input.accept = '.sqlite,.sqlite3,.json,application/x-sqlite3';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.addEventListener('change', () => {
      const f = input.files?.[0];
      if (f) void deps.importFile(f);
      input.value = '';
    });

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.input.off('wheel', this.rulesWheelHandler);
      input.remove();
    });

    this.refreshToolLabel();
  }

  /** Position the strip at the right edge of the canvas (call after create). */
  layoutRight(gameWidth: number): void {
    this.container.setX(gameWidth - PANEL_W);
  }

  private addRowButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ): void {
    const bg = scene.add
      .rectangle(x + 94, y + 13, 188, 26, 0x21262d)
      .setStrokeStyle(1, 0x30363d)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5, 0.5);
    const tx = scene.add.text(x + 94, y + 13, label, {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#f0f6fc',
    }).setOrigin(0.5, 0.5);
    bg.on('pointerdown', onClick);
    this.container.add([bg, tx]);
  }

  setVisible(v: boolean): void {
    this.visible = v;
    this.container.setVisible(v);
    if (!v) {
      this.deps.neighborRef.current = false;
      this.refreshNeighborBox();
      this.deps.getShip().setNeighborHighlight(null, null, false);
    }
  }

  getVisible(): boolean {
    return this.visible;
  }

  refreshToolLabel(): void {
    const t = this.deps.getTool();
    this.toolTitle.setText(`Tool: ${t ?? '— (use hotbar)'}`);
    this.refreshRuleDescriptionCopy();
    this.refreshRuleBoxes();
  }

  private refreshRuleDescriptionCopy(): void {
    for (const meta of placementRuleUiMetas()) {
      const tx = this.ruleDescriptionTexts.get(meta.id);
      if (!tx || !meta.description) continue;
      tx.setText(meta.description);
    }
  }

  refreshRuleBoxes(): void {
    const tool = toolFromPlaceable(this.deps.getTool());
    for (const rid of this.ruleBoxes.keys()) {
      const box = this.ruleBoxes.get(rid);
      if (!box) continue;
      if (tool === null) {
        box.setFillStyle(0x30363d);
        continue;
      }
      const on = this.deps.presetRef.current.global[rid];
      box.setFillStyle(on ? 0x238636 : 0x484f58);
    }
  }

  private toggleRule(rid: string): void {
    const tool = toolFromPlaceable(this.deps.getTool());
    if (tool === null) return;
    this.deps.presetRef.current.global[rid] = !this.deps.presetRef.current.global[rid];
    this.refreshRuleBoxes();
  }

  private refreshNeighborBox(): void {
    this.neighborBox.setFillStyle(this.deps.neighborRef.current ? 0x238636 : 0x30363d);
  }

  updateProbe(pointerScreenY: number, worldX: number, worldY: number): void {
    if (!this.visible) return;

    const ship = this.deps.getShip();

    if (pointerScreenY >= GAME_HEIGHT - HOTBAR_HEIGHT) {
      this.probeText.setText('');
      ship.setNeighborHighlight(null, null, false);
      return;
    }

    const tool = toolFromPlaceable(this.deps.getTool());
    const { x: tx, y: ty } = ship.worldToTile(worldX, worldY);
    const snap = ship.getTileTypeSnapshot();
    const neigh = summarizeNeighborsCardinal(snap, tx, ty);
    const tile = ship.getTile(tx, ty);

    if (this.deps.neighborRef.current) {
      ship.setNeighborHighlight(tx, ty, true);
    } else {
      ship.setNeighborHighlight(null, null, false);
    }

    if (tool === null) {
      this.probeText.setText(`Cell (${tx},${ty})\nTile: ${tile?.type ?? 'empty'}\n${neigh}`);
      return;
    }

    const ctx = buildProbeRuleContext(
      ship,
      tool,
      tx,
      ty,
      this.deps.getRingCorner(),
      this.deps.shiftSeal(),
    );

    if (ctx === null) {
      this.probeText.setText(
        [`Cell (${tx},${ty})`, `Tile: ${tile?.type ?? 'empty'}`, neigh, '', 'Ring: click first corner, then hover second.'].join(
          '\n',
        ),
      );
      return;
    }

    const enabled = enabledRuleIdsFromPreset(this.deps.presetRef.current.global);
    const { ruleResults, ok } = evaluatePlacementRules(ctx, enabled);
    const ruleLines = ruleResults.map(
      (r) => `${r.ruleId}: ${r.passed ? 'ok' : 'FAIL'} ${r.message ?? ''}`,
    );

    const blockedNoApplicable =
      !ok && ruleResults.length === 0 ? ['Turn on rules that apply to this placement (Options → Tile mapping).'] : [];

    this.probeText.setText(
      [
        `Cell (${tx},${ty})`,
        `Tile: ${tile?.type ?? 'empty'}`,
        neigh,
        '— rules —',
        ...(ruleResults.length > 0 ? ruleLines : ok ? ['(none — ring / unconstrained)'] : blockedNoApplicable),
        ok ? 'Probe: ok' : 'Probe: rejected',
      ].join('\n'),
    );
  }
}
