import Phaser from 'phaser';
import { Ship } from '../ship/Ship';
import { Corridor } from '../ship/Corridor';
import { Hull } from '../ship/Hull';
import { Ladder } from '../ship/Ladder';
import { Terminal } from '../ship/Terminal';
import { SessionStore } from '../persistence/sessionStore';
import { PlacementCoordinator } from '../placement/PlacementCoordinator';
import { isArnautsMapExportV1 } from '../persistence/types';
import { Captain } from '../characters/Captain';
import { Hunter } from '../characters/Hunter';
import { Layer } from '../core/Layers';
import { GAME_HEIGHT, GAME_WIDTH, HOTBAR_HEIGHT, type PlaceableComponent } from './HudScene';
import { CameraRig } from '../camera/CameraRig';
import { loadInputBindings } from '../persistence/inputSettingsStore';
import { mergeWithDefaults } from '../input/keyBindings';
import {
  anyKeysDown,
  registerInputBindings,
  type RegisteredInputKeys,
} from '../input/registerBindings';
import {
  enabledRuleIdsFromPreset,
  mergeRulePresetsWithDefaults,
} from '../placement/rulePresets';
import {
  loadPlacementRulePresets,
  savePlacementRulePresets,
} from '../persistence/placementRulePresetsStore';
import { TileToolsPanel } from '../ui/TileToolsPanel';

const CAMERA_PAN_SPEED = 3;

export class TestScene extends Phaser.Scene {
  private readonly authoringStore = new SessionStore();
  private placement!: PlacementCoordinator;
  /** Mutable rule preset map for SQLite + placement filtering. */
  private readonly presetRef = { current: mergeRulePresetsWithDefaults({}) };
  private readonly neighborRef = { current: false };
  private tileToolsPanel!: TileToolsPanel;
  private escKey!: Phaser.Input.Keyboard.Key;
  private panelToggleKey!: Phaser.Input.Keyboard.Key;
  private ship!: Ship;
  private cameraRig!: CameraRig;
  private boundKeys!: RegisteredInputKeys;
  private shiftKey!: Phaser.Input.Keyboard.Key;
  private topologyDebugOn = false;
  private ringCorner: { x: number; y: number } | null = null;
  private topologyHudText: Phaser.GameObjects.Text | null = null;
  private shipyardWarningText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super('TestScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    this.add
      .rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(Layer.SpaceBackground);

    this.ship = new Ship(this);
    this.add.existing(this.ship);
    this.ship.setDepth(Layer.ShipBackground);
    this.ship.x = 300;
    this.ship.y = 450;

    this.buildSeedShip();
    this.ship.fillEnclosedEmptyWithCorridors(this);

    this.ship.addInteractable(new Ladder(this), 3, 1);
    this.ship.addInteractable(new Ladder(this), 3, 2);

    this.placement = new PlacementCoordinator(
      this,
      this.ship,
      this.authoringStore,
      (_tool) => enabledRuleIdsFromPreset(this.presetRef.current.global),
    );
    void this.authoringStore.replaceSnapshotFromShip(this.ship);

    const hunter = new Hunter(this);
    hunter.setShip(this.ship);
    hunter.setLogicalPos(25, 50);
    this.ship.addCharacter(hunter);

    const captain = new Captain(this);
    captain.setShip(this.ship);
    captain.setLogicalPos(65, 100);
    this.ship.addCharacter(captain);

    const kb = this.input.keyboard;
    if (!kb) throw new Error('keyboard not available');
    this.shiftKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.escKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.panelToggleKey = kb.addKey(Phaser.Input.Keyboard.KeyCodes.BACKTICK);

    this.cameraRig = new CameraRig(this, this.cameras.main, CAMERA_PAN_SPEED);

    this.boundKeys = registerInputBindings(kb, mergeWithDefaults({}));
    void loadInputBindings().then((bindings) => {
      const keyboard = this.input.keyboard;
      if (!keyboard) return;
      this.boundKeys = registerInputBindings(keyboard, bindings);
    });

    this.tileToolsPanel = new TileToolsPanel(this, {
      getShip: () => this.ship,
      presetRef: this.presetRef,
      getTool: () => this.registry.get('selectedComponent') as PlaceableComponent | null,
      getRingCorner: () => this.ringCorner,
      shiftSeal: () => this.shiftKey.isDown,
      onSavePresets: async () => {
        await savePlacementRulePresets(this.presetRef.current);
      },
      importFile: async (file: File) => {
        await this.importAuthoringFile(file);
      },
      exportSqlite: async () => {
        await this.downloadAuthoringSqlite();
      },
      exportJson: async () => {
        await this.downloadAuthoringJson();
      },
      neighborRef: this.neighborRef,
    });
    this.tileToolsPanel.layoutRight(GAME_WIDTH);
    this.tileToolsPanel.refreshToolLabel();

    this.registry.events.on(
      'changedata-selectedComponent',
      (_parent: unknown, _key: string, value: PlaceableComponent | null) => {
        if (value !== 'ring') this.ringCorner = null;
        this.tileToolsPanel.refreshToolLabel();
      },
    );

    void loadPlacementRulePresets().then((p) => {
      this.presetRef.current = p;
      this.tileToolsPanel.refreshRuleBoxes();
    });

    this.toggleTopologyDebug(false);

    this.registry.events.on('authoring-export-sqlite', () =>
      void this.downloadAuthoringSqlite(),
    );
    this.registry.events.on('authoring-export-json', () =>
      void this.downloadAuthoringJson(),
    );
    this.registry.events.on('authoring-import-file', (file: File) =>
      void this.importAuthoringFile(file),
    );

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y >= GAME_HEIGHT - HOTBAR_HEIGHT) {
        this.ship.setHoveredTile(null, null);
      } else {
        const tile = this.ship.worldToTile(pointer.worldX, pointer.worldY);
        this.ship.setHoveredTile(tile.x, tile.y);
      }
      this.tileToolsPanel.updateProbe(pointer.y, pointer.worldX, pointer.worldY);
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.leftButtonDown()) return;
      if (pointer.y >= GAME_HEIGHT - HOTBAR_HEIGHT) return;

      const selected = this.registry.get('selectedComponent') as PlaceableComponent | null;
      if (selected === null) return;

      const { x, y } = this.ship.worldToTile(pointer.worldX, pointer.worldY);

      switch (selected) {
        case 'ring':
          if (this.ringCorner === null) {
            this.ringCorner = { x, y };
          } else {
            void this.placement
              .tryPlaceRing(
                this.ringCorner.x,
                this.ringCorner.y,
                x,
                y,
                this.shiftKey.isDown,
              )
              .then((ok) => {
                if (ok) this.updateInteriorHullWarning();
              });
            this.ringCorner = null;
          }
          break;
        case 'hull':
          void this.placement.tryPlaceHull(x, y).then((ok) => {
            if (ok) this.updateInteriorHullWarning();
          });
          break;
        case 'ladder':
          void this.placement.tryPlaceLadder(x, y);
          break;
        case 'terminal':
          void this.placement.tryPlaceTerminal(x, y);
          break;
      }
    });

    this.scene.launch('HudScene');

    // Stay in build mode (lenient) until the player explicitly leaves the
    // shipyard. Strict-airtight is reserved for runtime / combat.
  }

  /**
   * Two-deck ship with a complete hull ring. Every Hull placed here borders an
   * interior walkable tile or another Hull, so under both lenient and strict
   * airtight rules the ring is fully sealed and every wall renders its
   * appropriate integrity sprites.
   */
  private buildSeedShip(): void {
    const minX = 0;
    const maxX = 7;
    const lowerY = 1;
    const upperY = 2;
    const floorY = 0;
    const roofY = 3;

    const airlockX = minX + 4;
    for (let x = minX; x <= maxX; x++) {
      if (x !== airlockX) {
        this.ship.addTile(new Hull(this), x, floorY);
      }
      this.ship.addTile(new Hull(this), x, roofY);
    }
    this.ship.addTile(new Corridor(this), airlockX, floorY);
    this.ship.addTile(new Corridor(this), airlockX, floorY - 1);
    this.ship.addTile(new Hull(this), minX, lowerY);
    this.ship.addTile(new Hull(this), maxX, lowerY);
    this.ship.addTile(new Hull(this), minX, upperY);
    this.ship.addTile(new Hull(this), maxX, upperY);

    // Interior must be walkable Corridor on every cell: empty cells would make
    // hulls draw cardinal plating inward (wrong), and CleanCorridor skips the
    // interior wall sprites (walll/wallr) that belong against the hull ring.
    for (let x = minX + 1; x <= maxX - 1; x++) {
      this.ship.addTile(new Corridor(this), x, lowerY);
      this.ship.addTile(new Corridor(this), x, upperY);
    }
  }

  update(time: number, deltaMs: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.panelToggleKey)) {
      this.tileToolsPanel.setVisible(!this.tileToolsPanel.getVisible());
    }

    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      if (this.tileToolsPanel.getVisible()) {
        this.tileToolsPanel.setVisible(false);
      } else {
        this.scene.stop('HudScene');
        this.scene.start('MenuScene');
      }
    }

    const bk = this.boundKeys;
    this.cameraRig.updatePanAxes({
      left: bk.cameraPanLeft,
      right: bk.cameraPanRight,
      up: bk.cameraPanUp,
      down: bk.cameraPanDown,
    });

    if (anyKeysDown(bk.rotateShipRight)) this.ship.angle += 1;
    if (anyKeysDown(bk.rotateShipLeft)) this.ship.angle -= 1;

    if (bk.toggleTopologyDebug.some((k) => Phaser.Input.Keyboard.JustDown(k))) {
      this.toggleTopologyDebug(!this.topologyDebugOn);
    }

    if (
      this.shiftKey.isDown &&
      bk.stripInteriorHull.some((k) => Phaser.Input.Keyboard.JustDown(k))
    ) {
      const n = this.ship.stripInteriorHullToCorridor(this);
      if (n > 0) this.updateInteriorHullWarning();
    }

    if (this.topologyDebugOn) this.refreshTopologyHudCounts();

    this.ship.tick(time, deltaMs);
  }

  private triggerBrowserDownload(blob: Blob, filename: string): void {
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private async downloadAuthoringSqlite(): Promise<void> {
    const blob = await this.authoringStore.exportSqliteBlob();
    this.triggerBrowserDownload(blob, `arnauts-map-${Date.now()}.sqlite`);
  }

  private async downloadAuthoringJson(): Promise<void> {
    const text = await this.authoringStore.buildJsonExport();
    const blob = new Blob([text], { type: 'application/json' });
    this.triggerBrowserDownload(blob, `arnauts-map-${Date.now()}.json`);
  }

  private async importAuthoringFile(file: File): Promise<void> {
    const lower = file.name.toLowerCase();
    const buf = new Uint8Array(await file.arrayBuffer());
    if (lower.endsWith('.json')) {
      const text = new TextDecoder().decode(buf);
      const data: unknown = JSON.parse(text);
      if (!isArnautsMapExportV1(data)) {
        console.warn('Not a valid arnauts-map JSON export');
        return;
      }
      await this.authoringStore.importArnautsMapDocument(data);
    } else {
      await this.authoringStore.importDatabaseFromBuffer(buf);
    }
    await this.authoringStore.hydrateShipFromStore(this.ship, this);
    this.updateInteriorHullWarning();
  }

  private toggleTopologyDebug(on: boolean): void {
    this.topologyDebugOn = on;
    this.ship.setTopologyDebugVisible(on);
    if (on) {
      if (!this.topologyHudText) {
        this.topologyHudText = this.add
          .text(8, 8, '', {
            color: '#c8e8ff',
            fontFamily: 'monospace',
            fontSize: '12px',
            backgroundColor: '#0a1020',
            padding: { x: 6, y: 4 },
          })
          .setScrollFactor(0)
          .setDepth(Layer.SpaceBackground + 50);
      }
      this.topologyHudText.setVisible(true);
      this.refreshTopologyHudCounts();
    } else {
      this.topologyHudText?.setVisible(false);
    }
  }

  private refreshTopologyHudCounts(): void {
    if (!this.topologyHudText || !this.topologyDebugOn) return;
    const top = this.ship.getTopology();
    this.topologyHudText.setText(
      [
        'Topology debug (T)',
        `walkable ${top.walkableCount}  hull ${top.hullCount}  interiorHull ${top.interiorHullKeys.size}`,
        `exteriorHull ${top.exteriorHullKeys.size}  walkableCC ${top.walkableComponents}  enclosedVoid ${top.enclosedVoidCount}`,
      ].join('\n'),
    );
  }

  private updateInteriorHullWarning(): void {
    const top = this.ship.getTopology();
    if (top.interiorHullKeys.size === 0) {
      this.shipyardWarningText?.destroy();
      this.shipyardWarningText = null;
      return;
    }
    const msg =
      'Interior hull detected; walkable pocket may be smaller than the outer ring.';
    if (!this.shipyardWarningText) {
      this.shipyardWarningText = this.add
        .text(GAME_WIDTH / 2, 28, msg, {
          color: '#ffb84d',
          fontFamily: 'monospace',
          fontSize: '13px',
          align: 'center',
          wordWrap: { width: GAME_WIDTH - 24 },
        })
        .setOrigin(0.5, 0)
        .setScrollFactor(0)
        .setDepth(Layer.SpaceBackground + 100);
    } else {
      this.shipyardWarningText.setText(msg);
    }
  }
}
