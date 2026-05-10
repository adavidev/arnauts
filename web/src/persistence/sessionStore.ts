import type { Database } from 'sql.js';
import type { Scene } from 'phaser';
import type { Ship } from '../ship/Ship';
import { hydrateShipLayout } from '../placement/hydrateShipLayout';
import type { ArnautsMapExportV1, RuleResultJson } from './types';
import {
  exportDatabaseBuffer,
  getDatabase,
  replaceDatabaseFromBuffer,
  resetDatabaseSingletonForTests,
} from './sqlite';
import { buildMapExportJson } from './exportJson';

export class SessionStore {
  private sessionId: number | null = null;

  async ensureSession(label = 'default'): Promise<number> {
    if (this.sessionId !== null) return this.sessionId;
    const db = await getDatabase();
    db.run(`INSERT INTO sessions (label, created_at_ms) VALUES (?, ?)`, [
      label,
      Date.now(),
    ]);
    const row = db.exec('SELECT last_insert_rowid()');
    const id = row[0]?.values[0]?.[0];
    if (id === undefined || typeof id !== 'number')
      throw new Error('Failed to create session');
    this.sessionId = id;
    return this.sessionId;
  }

  setSessionIdForTests(id: number): void {
    this.sessionId = id;
  }

  getSessionId(): number | null {
    return this.sessionId;
  }

  async appendPlacementEvent(params: {
    actionKind: string;
    payload: unknown;
    outcome: 'accepted' | 'rejected';
    ruleResults: RuleResultJson[];
  }): Promise<void> {
    const db = await getDatabase();
    const sessionId = await this.ensureSession();
    const seqStmt = db.prepare(
      'SELECT COALESCE(MAX(seq), 0) + 1 FROM placement_events WHERE session_id = ?',
    );
    seqStmt.bind([sessionId]);
    seqStmt.step();
    const seqRow = seqStmt.get();
    seqStmt.free();
    const seq = seqRow?.[0];
    if (seq === undefined || typeof seq !== 'number')
      throw new Error('Failed to compute placement seq');
    const payloadJson = JSON.stringify(params.payload);
    const ruleJson = JSON.stringify(params.ruleResults);
    db.run(
      `INSERT INTO placement_events (session_id, seq, timestamp_ms, action_kind, payload_json, outcome, rule_results_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionId,
        seq,
        Date.now(),
        params.actionKind,
        payloadJson,
        params.outcome,
        ruleJson,
      ],
    );
  }

  async replaceSnapshotFromShip(ship: Ship): Promise<void> {
    const db = await getDatabase();
    const sessionId = await this.ensureSession();
    db.run('BEGIN');
    try {
      db.run('DELETE FROM tiles WHERE session_id = ?', [sessionId]);
      db.run('DELETE FROM interactables WHERE session_id = ?', [sessionId]);

      const snap = ship.getTileTypeSnapshot();
      for (const [key, tileType] of snap) {
        const [x, y] = key.split(',').map(Number);
        db.run(
          `INSERT INTO tiles (session_id, x, y, tile_type) VALUES (?, ?, ?, ?)`,
          [sessionId, x, y, String(tileType)],
        );
      }

      for (const row of ship.getInteractablesSnapshot()) {
        db.run(
          `INSERT INTO interactables (session_id, kind, x, y) VALUES (?, ?, ?, ?)`,
          [sessionId, row.kind, row.x, row.y],
        );
      }
      db.run('COMMIT');
    } catch (e) {
      db.run('ROLLBACK');
      throw e;
    }
  }

  async exportSqliteBlob(): Promise<Blob> {
    await this.ensureSession();
    const bytes = exportDatabaseBuffer();
    return new Blob([new Uint8Array(bytes)], { type: 'application/x-sqlite3' });
  }

  async buildJsonExport(): Promise<string> {
    const db = await getDatabase();
    const sessionId = await this.ensureSession();
    const doc = buildMapExportJson(db, sessionId);
    return JSON.stringify(doc, null, 2);
  }

  async importDatabaseFromBuffer(data: Uint8Array): Promise<void> {
    await replaceDatabaseFromBuffer(data);
    const db = await getDatabase();
    const rows = db.exec('SELECT id FROM sessions ORDER BY id DESC LIMIT 1');
    const id = rows[0]?.values[0]?.[0];
    this.sessionId =
      id !== undefined && typeof id === 'number' ? id : null;
    if (this.sessionId === null) {
      await this.ensureSession('imported');
    }
  }

  /**
   * Rebuild the in-memory DB from a JSON export (full fidelity including placement log).
   */
  async importArnautsMapDocument(doc: ArnautsMapExportV1): Promise<void> {
    resetDatabaseSingletonForTests();
    this.sessionId = null;
    const db = await getDatabase();
    db.run('BEGIN');
    try {
      db.run(`INSERT INTO sessions (id, label, created_at_ms) VALUES (?, ?, ?)`, [
        doc.session.id,
        doc.session.label,
        doc.session.createdAtMs,
      ]);
      for (const t of doc.tiles) {
        db.run(
          `INSERT INTO tiles (session_id, x, y, tile_type) VALUES (?, ?, ?, ?)`,
          [doc.session.id, t.x, t.y, t.tileType],
        );
      }
      for (const i of doc.interactables) {
        db.run(
          `INSERT INTO interactables (session_id, kind, x, y) VALUES (?, ?, ?, ?)`,
          [doc.session.id, i.kind, i.x, i.y],
        );
      }
      for (const e of doc.placementEvents) {
        db.run(
          `INSERT INTO placement_events (session_id, seq, timestamp_ms, action_kind, payload_json, outcome, rule_results_json)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            doc.session.id,
            e.seq,
            e.timestampMs,
            e.actionKind,
            JSON.stringify(e.payload),
            e.outcome,
            JSON.stringify(e.ruleResults),
          ],
        );
      }
      db.run('COMMIT');
    } catch (e) {
      db.run('ROLLBACK');
      throw e;
    }
    this.sessionId = doc.session.id;
  }

  async hydrateShipFromStore(ship: Ship, scene: Scene): Promise<void> {
    const db = await getDatabase();
    const sid = this.sessionId;
    if (sid === null) throw new Error('No active session to hydrate');
    const doc = buildMapExportJson(db, sid);
    hydrateShipLayout(scene, ship, doc.tiles, doc.interactables);
  }
}

/** For tests: run SQL against the active DB. */
export async function queryDatabase<T>(
  fn: (db: Database) => T,
): Promise<T> {
  const db = await getDatabase();
  return fn(db);
}
