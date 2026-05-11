import { TileType } from '../../ship/TileType';
import type { Ship } from '../../ship/Ship';
import type { Tile } from '../../ship/Tile';
import type { GameCharacter } from '../GameCharacter';

export interface ANode {
  current: Tile;
  previous: ANode | null;
  type: TileType;
}

const MAX_BUILD_ITERATIONS = 256;

/**
 * Tile-graph flood fill / pathfinder. Reachable set = walkable tiles connected
 * via walkable neighbors, plus climbable tiles reachable through climbable
 * connections (ladders). Mirrors Astar.java.
 */
export class Astar {
  public ship: Ship;
  public character: GameCharacter;
  public nodeList: ANode[] = [];
  public target: ANode | null = null;

  constructor(character: GameCharacter) {
    const tile = character.currentTile();
    if (!tile || !tile.ship) {
      throw new Error('Astar: character is not on a ship tile');
    }
    this.character = character;
    this.ship = tile.ship;
  }

  public available(): ANode[] {
    const cur = this.character.currentTile()!;
    this.nodeList = [{ current: cur, previous: null, type: cur.type }];
    return this.build(this.nodeList);
  }

  public findTarget(tile: Tile): ANode[] {
    this.target = { current: tile, previous: null, type: tile.type };
    const cur = this.character.currentTile()!;
    this.nodeList = [{ current: cur, previous: null, type: cur.type }];
    this.build(this.nodeList);

    const idx = this.indexOfTile(this.nodeList, tile);
    if (idx < 0) return [];
    return this.createPath(this.nodeList[idx]);
  }

  private build(searchList: ANode[]): ANode[] {
    for (let iter = 0; iter < MAX_BUILD_ITERATIONS; iter++) {
      const start = this.character.currentTile();
      if (
        start &&
        !start.isType(TileType.Walkable) &&
        !start.isType(TileType.Climbable)
      ) {
        return searchList;
      }

      const toAdd: ANode[] = [];
      for (const tile of searchList) {
        const x = tile.current.tileX;
        const y = tile.current.tileY;

        const upTile = this.ship.getTile(x, y + 1);
        const downTile = this.ship.getTile(x, y - 1);
        const leftTile = this.ship.getTile(x - 1, y);
        const rightTile = this.ship.getTile(x + 1, y);

        if (
          leftTile &&
          leftTile.isType(TileType.Walkable) &&
          !this.containsTile(searchList, leftTile)
        ) {
          toAdd.push({ current: leftTile, previous: tile, type: leftTile.type });
        }
        if (
          rightTile &&
          rightTile.isType(TileType.Walkable) &&
          !this.containsTile(searchList, rightTile)
        ) {
          toAdd.push({ current: rightTile, previous: tile, type: rightTile.type });
        }
        if (
          upTile &&
          upTile.isType(TileType.Climbable) &&
          tile.current.isType(TileType.Climbable) &&
          !this.containsTile(searchList, upTile)
        ) {
          toAdd.push({ current: upTile, previous: tile, type: TileType.Climbable });
        }
        if (
          downTile &&
          downTile.isType(TileType.Climbable) &&
          tile.current.isType(TileType.Climbable) &&
          !this.containsTile(searchList, downTile)
        ) {
          toAdd.push({ current: downTile, previous: tile, type: TileType.Climbable });
        }
      }

      const targetReached =
        this.target !== null && this.containsTile(searchList, this.target.current);
      if (toAdd.length === 0 || targetReached) return searchList;

      searchList.push(...toAdd);
    }
    return searchList;
  }

  private createPath(found: ANode): ANode[] {
    const path: ANode[] = [];
    let current: ANode | null = found;
    while (current !== null) {
      path.unshift(current);
      current = current.previous;
    }
    return path;
  }

  private containsTile(list: ANode[], tile: Tile): boolean {
    for (const n of list) if (n.current === tile) return true;
    return false;
  }

  private indexOfTile(list: ANode[], tile: Tile): number {
    for (let i = 0; i < list.length; i++) if (list[i].current === tile) return i;
    return -1;
  }
}
