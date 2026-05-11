/** Applied when PRAGMA user_version is below this value. */
export const SCHEMA_VERSION = 2;

/** Adds user_settings for keybindings and other prefs (see migration v2). */
export const MIGRATION_V2 = `
CREATE TABLE IF NOT EXISTS user_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

export const MIGRATION_V1 = `
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  created_at_ms INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS placement_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  seq INTEGER NOT NULL,
  timestamp_ms INTEGER NOT NULL,
  action_kind TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK(outcome IN ('accepted', 'rejected')),
  rule_results_json TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_placement_events_session_seq
  ON placement_events(session_id, seq);

CREATE TABLE IF NOT EXISTS tiles (
  session_id INTEGER NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  tile_type TEXT NOT NULL,
  PRIMARY KEY (session_id, x, y),
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

CREATE TABLE IF NOT EXISTS interactables (
  session_id INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('ladder', 'terminal')),
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  PRIMARY KEY (session_id, x, y),
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);
`;
