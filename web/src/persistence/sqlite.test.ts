import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import initSqlJs from 'sql.js';
import {
  clearSqlJsFactoryForTests,
  exportDatabaseBuffer,
  getDatabase,
  replaceDatabaseFromBuffer,
  resetDatabaseSingletonForTests,
  setSqlJsFactoryForTests,
} from './sqlite';

beforeAll(async () => {
  const wasmPath = join(
    dirname(fileURLToPath(import.meta.url)),
    '../../node_modules/sql.js/dist/sql-wasm.wasm',
  );
  const fileBuf = readFileSync(wasmPath);
  const wasmBinary = fileBuf.buffer.slice(
    fileBuf.byteOffset,
    fileBuf.byteOffset + fileBuf.byteLength,
  ) as ArrayBuffer;
  setSqlJsFactoryForTests(() => initSqlJs({ wasmBinary }));
});

afterAll(() => {
  clearSqlJsFactoryForTests();
  resetDatabaseSingletonForTests();
});

describe('sql.js persistence', () => {
  it('exports and reopens database preserving tiles row', async () => {
    resetDatabaseSingletonForTests();
    const db = await getDatabase();
    db.run(`INSERT INTO sessions (label, created_at_ms) VALUES ('test', 42)`);
    const sid = db.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0];
    expect(typeof sid).toBe('number');
    db.run(`INSERT INTO tiles (session_id, x, y, tile_type) VALUES (?, 2, 3, 'Walkable')`, [
      sid,
    ]);

    const bytes = exportDatabaseBuffer();
    resetDatabaseSingletonForTests();

    await replaceDatabaseFromBuffer(bytes);
    const db2 = await getDatabase();
    const rows = db2.exec(`SELECT x, y, tile_type FROM tiles`);
    expect(rows[0]?.values[0]).toEqual([2, 3, 'Walkable']);
  });

  it('applies migrations so core tables exist', async () => {
    resetDatabaseSingletonForTests();
    const db = await getDatabase();
    const meta = db.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`);
    const names = meta[0]?.values.flat().map(String) ?? [];
    expect(names).toContain('tiles');
    expect(names).toContain('placement_events');
    expect(names).toContain('sessions');
    expect(names).toContain('user_settings');
  });
});
