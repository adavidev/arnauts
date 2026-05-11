import Phaser from 'phaser';
import { GameNode, TILE_W, TILE_H } from '../core/GameNode';
import { Tile } from './Tile';
import { TileType } from './TileType';
import { Corridor } from './Corridor';
import { Hull } from './Hull';
import { Interactable, type InteractableKind } from './Interactable';
import {
  analyzeShipTopology,
  parseTopologyKey,
  type ShipTopology,
} from './topology';
import type { GameCharacter } from '../characters/GameCharacter';

const NEIGHBOR_OFFSETS: Array<[number, number]> = [
  [+1, 0],
  [-1, 0],
  [0, +1],
  [0, -1],
  [+1, +1],
  [+1, -1],
  [-1, +1],
  [-1, -1],
];

const CARDINAL_OFFSETS: Array<[number, number]> = [
  [+1, 0],
  [-1, 0],
  [0, +1],
  [0, -1],
];

const EIGHT_NEIGHBOR_OFFSETS: Array<[number, number]> = [
  [+1, 0],
  [-1, 0],
  [0, +1],
  [0, -1],
  [+1, +1],
  [+1, -1],
  [-1, +1],
  [-1, -1],
];

export type AirtightMode = 'lenient' | 'strict';

/**
 * Concrete GameNode used purely as a parent container to enforce layer order
 * within the Ship. Order in Ship.list determines render order in Phaser; depth
 * cannot be controlled per-sprite once it lives inside a Container.
 */
class ShipLayer extends GameNode {}

export class Ship extends GameNode {
  private tiles = new Map<string, Tile>();
  private interactables: Interactable[] = [];

  /**
   * lenient (default): a hull is "airtight" if it has any wall or walkable
   * neighbor in its 8-neighborhood. Used during procedural / scripted level
   * generation so the seed map renders cleanly without flood-fill cost.
   *
   * strict: a hull is airtight only if every empty side is part of an enclosed
   * region (BFS through empty cells from the side cannot escape past the
   * tilemap bounding box). Used at runtime once the player can place/remove
   * walls so destroyed walls correctly drop the integrity skin from leaky
   * neighbors.
   */
  public airtightMode: AirtightMode = 'lenient';

  /** Layer containers, ordered low to high. Order in this.list IS the z-order. */
  private tileHullLayer: ShipLayer;
  /** Walkable / floor tiles above {@link tileHullLayer} so hull plating never covers deck. */
  private tileDeckLayer: ShipLayer;
  private shipEquipmentLayer: ShipLayer;
  private characterLayer: ShipLayer;
  private shipForegroundLayer: ShipLayer;
  /** Single stroke around the union of walkable tiles (not a per-cell grid). */
  private walkableOutlineGfx: Phaser.GameObjects.Graphics;
  /** Build-mode cell highlight under the pointer. */
  private tileHoverGfx: Phaser.GameObjects.Graphics;
  /** Optional 8-neighbor tint for rule debugging. */
  private neighborHighlightGfx: Phaser.GameObjects.Graphics;
  private hoverTile: { x: number; y: number } | null = null;
  /** Build-mode overlay: exterior vs interior hull (lazy). */
  private topologyDebugGfx: Phaser.GameObjects.Graphics | null = null;
  private topologyDebugEnabled = false;

  constructor(scene: Phaser.Scene) {
    super(scene);
    this.tileHullLayer = new ShipLayer(scene);
    this.tileDeckLayer = new ShipLayer(scene);
    this.shipEquipmentLayer = new ShipLayer(scene);
    this.characterLayer = new ShipLayer(scene);
    this.shipForegroundLayer = new ShipLayer(scene);
    this.walkableOutlineGfx = scene.add.graphics();
    this.tileHoverGfx = scene.add.graphics();
    this.neighborHighlightGfx = scene.add.graphics();
    this.add([
      this.tileHullLayer,
      this.tileDeckLayer,
      this.walkableOutlineGfx,
      this.tileHoverGfx,
      this.neighborHighlightGfx,
      this.shipEquipmentLayer,
      this.characterLayer,
      this.shipForegroundLayer,
    ]);
  }

  /**
   * Highlights one deck cell in ship space for hover feedback (build mode).
   * Pass null to clear.
   */
  public setHoveredTile(tileX: number | null, tileY: number | null): void {
    if (tileX === null || tileY === null) {
      this.hoverTile = null;
      this.tileHoverGfx.clear();
      return;
    }
    if (this.hoverTile?.x === tileX && this.hoverTile?.y === tileY) return;
    this.hoverTile = { x: tileX, y: tileY };
    const g = this.tileHoverGfx;
    g.clear();
    const pxL = tileX * TILE_W;
    const pyTop = -tileY * TILE_H;
    g.fillStyle(0x88ccff, 0.28);
    g.fillRect(pxL, pyTop, TILE_W, TILE_H);
  }

  /**
   * When enabled, faint tint on the eight neighbors of (tileX, tileY) for adjacency debugging.
   */
  public setNeighborHighlight(
    tileX: number | null,
    tileY: number | null,
    enabled: boolean,
  ): void {
    const g = this.neighborHighlightGfx;
    g.clear();
    if (!enabled || tileX === null || tileY === null) return;
    for (const [dx, dy] of EIGHT_NEIGHBOR_OFFSETS) {
      const px = (tileX + dx) * TILE_W;
      const py = -(tileY + dy) * TILE_H;
      g.fillStyle(0xffaa44, 0.18);
      g.fillRect(px, py, TILE_W, TILE_H);
    }
  }

  private static key(x: number, y: number): string {
    return `${x},${y}`;
  }

  public addTile(tile: Tile, x: number, y: number): void {
    const existing = this.tiles.get(Ship.key(x, y));
    if (existing) existing.destroy();

    this.tiles.set(Ship.key(x, y), tile);
    tile.setShip(this);
    tile.setTileCoords(x, y);
    const deck =
      tile.type === TileType.Hull ? this.tileHullLayer : this.tileDeckLayer;
    deck.add(tile);

    tile.refreshSprites();
    for (const [dx, dy] of NEIGHBOR_OFFSETS) {
      this.tiles.get(Ship.key(x + dx, y + dy))?.refreshSprites();
    }
    this.redrawWalkableOutline();
    this.maybeRedrawTopologyDebug();
  }

  /** White border along the outer edge of all walkable cells (vs hull / void / non-walkable). */
  public redrawWalkableOutline(): void {
    const g = this.walkableOutlineGfx;
    g.clear();
    const isW = (tx: number, ty: number): boolean =>
      this.getTile(tx, ty)?.type === TileType.Walkable;

    g.lineStyle(2, 0xffffff, 1);

    for (const tile of this.tiles.values()) {
      if (tile.type !== TileType.Walkable) continue;
      const x = tile.tileX;
      const y = tile.tileY;
      const pxL = x * TILE_W;
      const pxR = (x + 1) * TILE_W;
      const pyTop = -y * TILE_H;
      const pyBot = -y * TILE_H + TILE_H;

      if (!isW(x - 1, y)) {
        g.beginPath();
        g.moveTo(pxL, pyTop);
        g.lineTo(pxL, pyBot);
        g.strokePath();
      }
      if (!isW(x + 1, y)) {
        g.beginPath();
        g.moveTo(pxR, pyTop);
        g.lineTo(pxR, pyBot);
        g.strokePath();
      }
      if (!isW(x, y - 1)) {
        g.beginPath();
        g.moveTo(pxL, pyBot);
        g.lineTo(pxR, pyBot);
        g.strokePath();
      }
      if (!isW(x, y + 1)) {
        g.beginPath();
        g.moveTo(pxL, pyTop);
        g.lineTo(pxR, pyTop);
        g.strokePath();
      }
    }
  }

  public getTile(x: number, y: number): Tile | null {
    return this.tiles.get(Ship.key(x, y)) ?? null;
  }

  /**
   * Interactables with a persistable kind (ladders, terminals) for SQLite export.
   */
  public getInteractablesSnapshot(): Array<{
    kind: InteractableKind;
    x: number;
    y: number;
  }> {
    const out: Array<{ kind: InteractableKind; x: number; y: number }> = [];
    for (const i of this.interactables) {
      if (i.interactableKind !== null) {
        out.push({ kind: i.interactableKind, x: i.tileX, y: i.tileY });
      }
    }
    return out;
  }

  /** Remove all tiles and equipment; characters are left in place. */
  public clearTilesAndInteractables(): void {
    for (const t of this.tiles.values()) {
      t.destroy();
    }
    this.tiles.clear();
    for (const i of this.interactables) {
      i.destroy();
    }
    this.interactables.length = 0;
    this.redrawWalkableOutline();
    this.maybeRedrawTopologyDebug();
  }

  /**
   * Hull outlines leave null cells inside a closed ring — that reads as blue
   * vacuum between plating and walkable. Flood from outside the padded bbox;
   * any still-empty cell inside the tile hull bbox is trapped → Corridor.
   */
  public fillEnclosedEmptyWithCorridors(scene: Phaser.Scene): void {
    if (this.tiles.size === 0) return;

    const b = this.boundingBoxWithMargin(0);
    const pad = 3;
    const minX = b.minX - pad;
    const maxX = b.maxX + pad;
    const minY = b.minY - pad;
    const maxY = b.maxY + pad;

    const inR = (gx: number, gy: number): boolean =>
      gx >= minX && gx <= maxX && gy >= minY && gy <= maxY;

    const reachable = new Set<string>();
    const q: Array<[number, number]> = [];

    const trySeed = (gx: number, gy: number): void => {
      if (!inR(gx, gy)) return;
      if (this.getTile(gx, gy)?.type === TileType.Hull) return;
      const k = Ship.key(gx, gy);
      if (reachable.has(k)) return;
      reachable.add(k);
      q.push([gx, gy]);
    };

    for (let gx = minX; gx <= maxX; gx++) {
      trySeed(gx, minY);
      trySeed(gx, maxY);
    }
    for (let gy = minY; gy <= maxY; gy++) {
      trySeed(minX, gy);
      trySeed(maxX, gy);
    }

    while (q.length > 0) {
      const [gx, gy] = q.shift()!;
      for (const [dx, dy] of CARDINAL_OFFSETS) {
        const nx = gx + dx;
        const ny = gy + dy;
        if (!inR(nx, ny)) continue;
        if (this.getTile(nx, ny)?.type === TileType.Hull) continue;
        const k = Ship.key(nx, ny);
        if (reachable.has(k)) continue;
        reachable.add(k);
        q.push([nx, ny]);
      }
    }

    const toAdd: Array<[number, number]> = [];
    for (let gx = b.minX; gx <= b.maxX; gx++) {
      for (let gy = b.minY; gy <= b.maxY; gy++) {
        if (this.getTile(gx, gy) !== null) continue;
        if (reachable.has(Ship.key(gx, gy))) continue;
        toAdd.push([gx, gy]);
      }
    }

    for (const [gx, gy] of toAdd) {
      this.addTile(new Corridor(scene), gx, gy);
    }

    for (let i = 0; i < 64; i++) {
      if (this.clearHullSandwichedBetweenWalkable(scene) === 0) break;
    }

    for (let i = 0; i < 64; i++) {
      if (this.bridgeBetweenWalkableComponentsPass(scene) === 0) break;
    }

    for (let i = 0; i < 8; i++) {
      if (this.bridgeSandwichedNullRuns(scene) === 0) break;
    }

    this.maybeRedrawTopologyDebug();
  }

  /**
   * Hull cells that have walkable on **both** opposite cardinals are thin
   * interior partitions / “edge gutter” tiles between two deck regions. They
   * are not null, so gap-bridging never touched them — leaving twin white
   * outlines with hull in between.
   */
  private clearHullSandwichedBetweenWalkable(scene: Phaser.Scene): number {
    const toReplace: Array<[number, number]> = [];
    for (const tile of this.tiles.values()) {
      if (tile.type !== TileType.Hull) continue;
      const x = tile.tileX;
      const y = tile.tileY;
      const w = this.getTile(x - 1, y)?.type === TileType.Walkable;
      const e = this.getTile(x + 1, y)?.type === TileType.Walkable;
      const n = this.getTile(x, y - 1)?.type === TileType.Walkable;
      const s = this.getTile(x, y + 1)?.type === TileType.Walkable;
      if ((w && e) || (n && s)) {
        toReplace.push([x, y]);
      }
    }
    let count = 0;
    for (const [x, y] of toReplace) {
      if (this.getTile(x, y)?.type === TileType.Hull) {
        this.addTile(new Corridor(scene), x, y);
        count++;
      }
    }
    return count;
  }

  private labelWalkableComponents(): Map<string, number> {
    const comp = new Map<string, number>();
    let nextId = 0;
    for (const tile of this.tiles.values()) {
      if (tile.type !== TileType.Walkable) continue;
      const k = Ship.key(tile.tileX, tile.tileY);
      if (comp.has(k)) continue;
      const id = nextId++;
      const q: Array<[number, number]> = [[tile.tileX, tile.tileY]];
      while (q.length > 0) {
        const [x, y] = q.shift()!;
        const k2 = Ship.key(x, y);
        if (comp.has(k2)) continue;
        const t = this.getTile(x, y);
        if (!t || t.type !== TileType.Walkable) continue;
        comp.set(k2, id);
        for (const [dx, dy] of CARDINAL_OFFSETS) {
          q.push([x + dx, y + dy]);
        }
      }
    }
    return comp;
  }

  private walkableCompId(
    comp: Map<string, number>,
    gx: number,
    gy: number,
  ): number | null {
    return comp.get(Ship.key(gx, gy)) ?? null;
  }

  /**
   * Turn a null into deck when **8-neighbors** include walkable tiles from **≥2**
   * distinct components. Opposite-cardinals-only missed misaligned rooms (logs:
   * walkableCompsBefore 3, mergedByComponent 0).
   */
  private bridgeBetweenWalkableComponentsPass(scene: Phaser.Scene): number {
    const comp = this.labelWalkableComponents();
    if (comp.size === 0) return 0;
    const b = this.boundingBoxWithMargin(2);
    const toAdd: Array<[number, number]> = [];
    for (let gx = b.minX; gx <= b.maxX; gx++) {
      for (let gy = b.minY; gy <= b.maxY; gy++) {
        if (this.getTile(gx, gy) !== null) continue;
        const ids = new Set<number>();
        for (const [dx, dy] of EIGHT_NEIGHBOR_OFFSETS) {
          const id = this.walkableCompId(comp, gx + dx, gy + dy);
          if (id !== null) ids.add(id);
        }
        if (ids.size >= 2) toAdd.push([gx, gy]);
      }
    }
    let added = 0;
    for (const [gx, gy] of toAdd) {
      if (this.getTile(gx, gy) === null) {
        this.addTile(new Corridor(scene), gx, gy);
        added++;
      }
    }
    return added;
  }

  /**
   * Fill short runs of empty cells on the same row/column bounded by hull or
   * walkable on both ends. Does not paint a sea of exterior corridors (unlike
   * cardinal dilation), which left sealed hulls visually “trapped” next to fake
   * walkable space.
   */
  private bridgeSandwichedNullRuns(scene: Phaser.Scene): number {
    if (this.tiles.size === 0) return 0;
    const MAX_RUN = 8;
    const b = this.boundingBoxWithMargin(2);
    const solid = (gx: number, gy: number): boolean => {
      const t = this.getTile(gx, gy);
      return (
        t !== null &&
        (t.type === TileType.Hull || t.type === TileType.Walkable)
      );
    };

    const toAdd: Array<[number, number]> = [];

    for (let gy = b.minY; gy <= b.maxY; gy++) {
      let gx = b.minX;
      while (gx <= b.maxX) {
        while (gx <= b.maxX && this.getTile(gx, gy) !== null) gx++;
        if (gx > b.maxX) break;
        const runStart = gx;
        while (gx <= b.maxX && this.getTile(gx, gy) === null) gx++;
        const runEnd = gx - 1;
        const len = runEnd - runStart + 1;
        if (len > MAX_RUN) continue;
        if (solid(runStart - 1, gy) && solid(runEnd + 1, gy)) {
          for (let x = runStart; x <= runEnd; x++) toAdd.push([x, gy]);
        }
      }
    }

    for (let gx = b.minX; gx <= b.maxX; gx++) {
      let gy = b.minY;
      while (gy <= b.maxY) {
        while (gy <= b.maxY && this.getTile(gx, gy) !== null) gy++;
        if (gy > b.maxY) break;
        const runStart = gy;
        while (gy <= b.maxY && this.getTile(gx, gy) === null) gy++;
        const runEnd = gy - 1;
        const len = runEnd - runStart + 1;
        if (len > MAX_RUN) continue;
        if (solid(gx, runStart - 1) && solid(gx, runEnd + 1)) {
          for (let y = runStart; y <= runEnd; y++) toAdd.push([gx, y]);
        }
      }
    }

    const seen = new Set<string>();
    let n = 0;
    for (const [gx, gy] of toAdd) {
      const k = Ship.key(gx, gy);
      if (seen.has(k)) continue;
      seen.add(k);
      if (this.getTile(gx, gy) === null) {
        this.addTile(new Corridor(scene), gx, gy);
        n++;
      }
    }
    return n;
  }

  /** Snapshot of occupied cells for pure topology analysis (empty = absent key). */
  public getTileTypeSnapshot(): Map<string, TileType> {
    const m = new Map<string, TileType>();
    for (const tile of this.tiles.values()) {
      m.set(Ship.key(tile.tileX, tile.tileY), tile.type);
    }
    return m;
  }

  public getTopology(): ShipTopology {
    return analyzeShipTopology(this.getTileTypeSnapshot());
  }

  /**
   * Axis-aligned hull ring on the rectangle perimeter, then flood trapped voids
   * with corridors (same semantics as manual hull + fill).
   *
   * @param options.sealOverWalkable When true, hull is placed on every ring cell
   *   including those that were walkable. That closes a **watertight** shell so
   *   `fillEnclosedEmptyWithCorridors` can flood interior void (e.g. join distant
   *   platforms). When false, walkable ring cells are left alone; any gap leaks
   *   the flood-fill so void between islands may stay empty.
   */
  public placeHullRingAndFill(
    scene: Phaser.Scene,
    ax: number,
    ay: number,
    bx: number,
    by: number,
    options?: { sealOverWalkable?: boolean },
  ): void {
    const minX = Math.min(ax, bx);
    const maxX = Math.max(ax, bx);
    const minY = Math.min(ay, by);
    const maxY = Math.max(ay, by);
    const sealOverWalkable = options?.sealOverWalkable === true;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const edge = x === minX || x === maxX || y === minY || y === maxY;
        if (!edge) continue;
        const here = this.getTile(x, y);
        if (here?.type === TileType.Walkable && !sealOverWalkable) continue;
        this.addTile(new Hull(scene), x, y);
      }
    }
    this.fillEnclosedEmptyWithCorridors(scene);
  }

  /**
   * Opt-in repair: convert topology-classified interior hull to walkable corridors.
   * Dangerous if misclassified; use only when you intend to remove inner rings.
   */
  public stripInteriorHullToCorridor(scene: Phaser.Scene): number {
    const top = this.getTopology();
    let n = 0;
    for (const k of top.interiorHullKeys) {
      const { x, y } = parseTopologyKey(k);
      this.addTile(new Corridor(scene), x, y);
      n++;
    }
    return n;
  }

  public setTopologyDebugVisible(enabled: boolean): void {
    this.topologyDebugEnabled = enabled;
    if (enabled) {
      if (!this.topologyDebugGfx) {
        this.topologyDebugGfx = this.scene.add.graphics();
        this.addAt(this.topologyDebugGfx, 2);
      }
      this.topologyDebugGfx.setVisible(true);
    } else if (this.topologyDebugGfx) {
      this.topologyDebugGfx.setVisible(false);
    }
    this.redrawTopologyDebug();
  }

  private maybeRedrawTopologyDebug(): void {
    if (this.topologyDebugEnabled) this.redrawTopologyDebug();
  }

  private redrawTopologyDebug(): void {
    if (!this.topologyDebugEnabled || !this.topologyDebugGfx) return;
    const g = this.topologyDebugGfx;
    g.clear();
    const top = analyzeShipTopology(this.getTileTypeSnapshot());
    for (const k of top.exteriorHullKeys) {
      const { x, y } = parseTopologyKey(k);
      const pxL = x * TILE_W;
      const pyTop = -y * TILE_H;
      g.fillStyle(0x00ffff, 0.28);
      g.fillRect(pxL, pyTop, TILE_W, TILE_H);
    }
    for (const k of top.interiorHullKeys) {
      const { x, y } = parseTopologyKey(k);
      const pxL = x * TILE_W;
      const pyTop = -y * TILE_H;
      g.fillStyle(0xff00ff, 0.4);
      g.fillRect(pxL, pyTop, TILE_W, TILE_H);
    }
  }

  public addInteractable(interactable: Interactable, x: number, y: number): void {
    interactable.setShip(this);
    interactable.setTileCoords(x, y);
    this.interactables.push(interactable);
    this.shipEquipmentLayer.add(interactable);
  }

  public getInteractable(x: number, y: number): Interactable | null {
    for (const i of this.interactables) {
      for (const c of i.coordinates) {
        if (c.x === x && c.y === y) return i;
      }
    }
    return null;
  }

  public addCharacter(character: GameCharacter): void {
    this.characterLayer.add(character);
  }

  /** Flip airtight mode and force every tile to re-evaluate its sprites. */
  public setAirtightMode(mode: AirtightMode): void {
    if (this.airtightMode === mode) return;
    this.airtightMode = mode;
    for (const tile of this.tiles.values()) tile.refreshSprites();
  }

  /**
   * True when the hull at (x, y) should display its integrity skin. Behavior
   * depends on this.airtightMode; see field doc. Lenient (build) mode trusts
   * the player and treats every hull as airtight so freshly placed walls are
   * immediately visible; strict mode runs the flood-fill enclosure check.
   */
  public isAirtight(x: number, y: number): boolean {
    if (this.airtightMode === 'lenient') return true;
    return this.isStrictlyAirtight(x, y);
  }

  /**
   * Strict mode: a hull is airtight iff at least one of its non-hull cardinal
   * neighbors sits in a region (walkable + empty cells, hull tiles act as
   * walls) that does not escape the tilemap bbox. In other words: this hull
   * borders an enclosed pocket of interior somewhere.
   */
  private isStrictlyAirtight(x: number, y: number): boolean {
    const bounds = this.boundingBoxWithMargin(1);
    for (const [dx, dy] of CARDINAL_OFFSETS) {
      const sx = x + dx;
      const sy = y + dy;
      const neighbor = this.tiles.get(Ship.key(sx, sy));
      if (neighbor && neighbor.type === TileType.Hull) continue;
      if (!this.bfsEscapes(sx, sy, bounds)) return true;
    }
    return false;
  }

  private boundingBoxWithMargin(margin: number): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const tile of this.tiles.values()) {
      if (tile.tileX < minX) minX = tile.tileX;
      if (tile.tileX > maxX) maxX = tile.tileX;
      if (tile.tileY < minY) minY = tile.tileY;
      if (tile.tileY > maxY) maxY = tile.tileY;
    }
    return {
      minX: minX - margin,
      maxX: maxX + margin,
      minY: minY - margin,
      maxY: maxY + margin,
    };
  }

  /**
   * BFS through interior cells (empty + walkable; hull tiles act as walls).
   * Returns true if BFS reaches a cell outside the bbox (region escapes to
   * "space"), false if it stays bounded by hulls / bbox edges.
   */
  private bfsEscapes(
    sx: number,
    sy: number,
    bbox: { minX: number; maxX: number; minY: number; maxY: number },
  ): boolean {
    const visited = new Set<string>();
    const queue: Array<[number, number]> = [[sx, sy]];
    visited.add(Ship.key(sx, sy));

    while (queue.length > 0) {
      const [cx, cy] = queue.shift()!;
      if (cx < bbox.minX || cx > bbox.maxX || cy < bbox.minY || cy > bbox.maxY) {
        return true;
      }
      for (const [dx, dy] of CARDINAL_OFFSETS) {
        const nx = cx + dx;
        const ny = cy + dy;
        const k = Ship.key(nx, ny);
        if (visited.has(k)) continue;
        const neighbor = this.tiles.get(k);
        if (neighbor && neighbor.type === TileType.Hull) continue;
        visited.add(k);
        queue.push([nx, ny]);
      }
    }
    return false;
  }

  /** Convert a world (screen-space) point to a tile coordinate on this ship. */
  public worldToTile(worldX: number, worldY: number): { x: number; y: number } {
    const local = this.localPoint(worldX, worldY);
    return {
      x: Math.floor(local.x / TILE_W),
      y: Math.ceil(-local.y / TILE_H),
    };
  }

  private localPoint(worldX: number, worldY: number): Phaser.Math.Vector2 {
    const m = this.getWorldTransformMatrix().invert();
    const out = new Phaser.Math.Vector2();
    m.transformPoint(worldX, worldY, out);
    return out;
  }
}
