import type { Database } from 'sql.js';
import type { ArnautsMapExportV1, RuleResultJson } from './types';

export function buildMapExportJson(
  db: Database,
  sessionId: number,
): ArnautsMapExportV1 {
  const sessionRows = db.exec(
    `SELECT id, label, created_at_ms FROM sessions WHERE id = ${sessionId}`,
  );
  const s0 = sessionRows[0]?.values[0];
  if (!s0)
    throw new Error(`Session ${sessionId} not found`);

  const tileRows = db.exec(
    `SELECT x, y, tile_type FROM tiles WHERE session_id = ${sessionId} ORDER BY y, x`,
  );
  const tiles: ArnautsMapExportV1['tiles'] = [];
  if (tileRows[0]) {
    for (const row of tileRows[0].values) {
      tiles.push({
        x: Number(row[0]),
        y: Number(row[1]),
        tileType: String(row[2]),
      });
    }
  }

  const intRows = db.exec(
    `SELECT kind, x, y FROM interactables WHERE session_id = ${sessionId} ORDER BY y, x`,
  );
  const interactables: ArnautsMapExportV1['interactables'] = [];
  if (intRows[0]) {
    for (const row of intRows[0].values) {
      interactables.push({
        kind: row[0] === 'terminal' ? 'terminal' : 'ladder',
        x: Number(row[1]),
        y: Number(row[2]),
      });
    }
  }

  const evRows = db.exec(
    `SELECT seq, timestamp_ms, action_kind, payload_json, outcome, rule_results_json
     FROM placement_events WHERE session_id = ${sessionId} ORDER BY seq`,
  );
  const placementEvents: ArnautsMapExportV1['placementEvents'] = [];
  if (evRows[0]) {
    for (const row of evRows[0].values) {
      const ruleResults = JSON.parse(String(row[5])) as RuleResultJson[];
      placementEvents.push({
        seq: Number(row[0]),
        timestampMs: Number(row[1]),
        actionKind: String(row[2]),
        payload: JSON.parse(String(row[3])) as unknown,
        outcome: row[4] === 'rejected' ? 'rejected' : 'accepted',
        ruleResults,
      });
    }
  }

  return {
    format: 'arnauts-map',
    version: 1,
    exportedAtMs: Date.now(),
    session: {
      id: Number(s0[0]),
      label: String(s0[1]),
      createdAtMs: Number(s0[2]),
    },
    tiles,
    interactables,
    placementEvents,
  };
}
