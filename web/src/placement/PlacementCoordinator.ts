import Phaser from 'phaser';
import type { Ship } from '../ship/Ship';
import { Hull } from '../ship/Hull';
import { Ladder } from '../ship/Ladder';
import { Terminal } from '../ship/Terminal';
import type { SessionStore } from '../persistence/sessionStore';
import { evaluatePlacementRules } from './rules/registry';
import type { PlacementToolKind } from './placementTools';
import type { PlacementIntent } from './types';
import type { RuleContext } from './types';

export type GetEnabledRuleIds = (tool: PlacementToolKind) => Set<string>;

export class PlacementCoordinator {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly ship: Ship,
    private readonly sessions: SessionStore,
    private readonly getEnabledRuleIds: GetEnabledRuleIds,
  ) {}

  async tryPlaceHull(tileX: number, tileY: number): Promise<boolean> {
    const tileAt = this.ship.getTile(tileX, tileY);
    const snapshot = this.ship.getTileTypeSnapshot();
    const intent: PlacementIntent = { kind: 'place_hull' };
    const ctx: RuleContext = { snapshot, x: tileX, y: tileY, tileAt, intent };
    const enabled = this.getEnabledRuleIds('hull');
    const { ruleResults, ok } = evaluatePlacementRules(ctx, enabled);
    await this.sessions.appendPlacementEvent({
      actionKind: 'place_hull',
      payload: { x: tileX, y: tileY },
      outcome: ok ? 'accepted' : 'rejected',
      ruleResults,
    });
    if (!ok) return false;
    this.ship.addTile(new Hull(this.scene), tileX, tileY);
    this.ship.fillEnclosedEmptyWithCorridors(this.scene);
    await this.sessions.replaceSnapshotFromShip(this.ship);
    return true;
  }

  async tryPlaceLadder(tileX: number, tileY: number): Promise<boolean> {
    const tileAt = this.ship.getTile(tileX, tileY);
    const snapshot = this.ship.getTileTypeSnapshot();
    const intent: PlacementIntent = { kind: 'place_ladder' };
    const ctx: RuleContext = { snapshot, x: tileX, y: tileY, tileAt, intent };
    const enabled = this.getEnabledRuleIds('ladder');
    const { ruleResults, ok } = evaluatePlacementRules(ctx, enabled);
    await this.sessions.appendPlacementEvent({
      actionKind: 'place_ladder',
      payload: { x: tileX, y: tileY },
      outcome: ok ? 'accepted' : 'rejected',
      ruleResults,
    });
    if (!ok) return false;
    this.ship.addInteractable(new Ladder(this.scene), tileX, tileY);
    await this.sessions.replaceSnapshotFromShip(this.ship);
    return true;
  }

  async tryPlaceTerminal(tileX: number, tileY: number): Promise<boolean> {
    const tileAt = this.ship.getTile(tileX, tileY);
    const snapshot = this.ship.getTileTypeSnapshot();
    const intent: PlacementIntent = { kind: 'place_terminal' };
    const ctx: RuleContext = { snapshot, x: tileX, y: tileY, tileAt, intent };
    const enabled = this.getEnabledRuleIds('terminal');
    const { ruleResults, ok } = evaluatePlacementRules(ctx, enabled);
    await this.sessions.appendPlacementEvent({
      actionKind: 'place_terminal',
      payload: { x: tileX, y: tileY },
      outcome: ok ? 'accepted' : 'rejected',
      ruleResults,
    });
    if (!ok) return false;
    this.ship.addInteractable(new Terminal(this.scene), tileX, tileY);
    await this.sessions.replaceSnapshotFromShip(this.ship);
    return true;
  }

  async tryPlaceRing(
    ax: number,
    ay: number,
    bx: number,
    by: number,
    sealOverWalkable: boolean,
  ): Promise<boolean> {
    const snapshot = this.ship.getTileTypeSnapshot();
    const intent: PlacementIntent = {
      kind: 'place_ring',
      ax,
      ay,
      bx,
      by,
      sealOverWalkable,
    };
    const ctx: RuleContext = {
      snapshot,
      x: bx,
      y: by,
      tileAt: this.ship.getTile(bx, by),
      intent,
    };
    const enabled = this.getEnabledRuleIds('ring');
    const { ruleResults, ok } = evaluatePlacementRules(ctx, enabled);
    await this.sessions.appendPlacementEvent({
      actionKind: 'place_ring',
      payload: { ax, ay, bx, by, sealOverWalkable },
      outcome: ok ? 'accepted' : 'rejected',
      ruleResults,
    });
    if (!ok) return false;
    this.ship.placeHullRingAndFill(this.scene, ax, ay, bx, by, {
      sealOverWalkable,
    });
    await this.sessions.replaceSnapshotFromShip(this.ship);
    return true;
  }
}
