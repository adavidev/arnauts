import initSqlJs from 'sql.js';
import type { Database, SqlJsStatic } from 'sql.js';
import { MIGRATION_V1, MIGRATION_V2, SCHEMA_VERSION } from './schema';

import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

let sqlJsPromise: Promise<SqlJsStatic> | null = null;
let dbSingleton: Database | null = null;

/** Vitest / Node: load WASM from disk instead of `locateFile` (avoids fetch/file URLs). */
let sqlJsFactory: (() => Promise<SqlJsStatic>) | null = null;

export function setSqlJsFactoryForTests(factory: () => Promise<SqlJsStatic>): void {
  sqlJsFactory = factory;
  sqlJsPromise = null;
}

export function clearSqlJsFactoryForTests(): void {
  sqlJsFactory = null;
  sqlJsPromise = null;
}

async function loadSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJsPromise) {
    if (sqlJsFactory) {
      sqlJsPromise = sqlJsFactory();
    } else {
      sqlJsPromise = initSqlJs({
        locateFile: (file: string) =>
          file.endsWith('.wasm') ? sqlWasmUrl : file,
      });
    }
  }
  return sqlJsPromise;
}

export function runMigrations(db: Database): void {
  const rows = db.exec('PRAGMA user_version');
  const v =
    rows[0]?.values[0]?.[0] !== undefined
      ? Number(rows[0].values[0][0])
      : 0;
  if (v < 1) {
    db.run(MIGRATION_V1);
    db.run(`INSERT OR IGNORE INTO meta (key, value) VALUES ('schema_version', ?)`, [
      String(SCHEMA_VERSION),
    ]);
    db.run('PRAGMA user_version = 1');
  }
  if (v < 2) {
    db.run(MIGRATION_V2);
    db.run(`INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', ?)`, [
      String(SCHEMA_VERSION),
    ]);
    db.run('PRAGMA user_version = 2');
  }
}

/**
 * Lazily opens an in-memory SQLite database and applies migrations.
 */
export async function getDatabase(): Promise<Database> {
  if (!dbSingleton) {
    const SQL = await loadSqlJs();
    dbSingleton = new SQL.Database();
    runMigrations(dbSingleton);
  }
  return dbSingleton;
}

/**
 * Replace the singleton with a database loaded from bytes (import).
 */
export async function replaceDatabaseFromBuffer(data: Uint8Array): Promise<Database> {
  const SQL = await loadSqlJs();
  dbSingleton?.close();
  dbSingleton = new SQL.Database(data);
  runMigrations(dbSingleton);
  return dbSingleton;
}

export function exportDatabaseBuffer(): Uint8Array {
  if (!dbSingleton) throw new Error('No database open');
  return dbSingleton.export();
}

/** Reset open DB (tests and JSON import rebuild). */
export function resetDatabaseSingletonForTests(): void {
  dbSingleton?.close();
  dbSingleton = null;
}
