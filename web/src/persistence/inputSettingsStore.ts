import {
  mergeWithDefaults,
  type InputBindingsConfig,
} from '../input/keyBindings';
import { getDatabase } from './sqlite';

const INPUT_BINDINGS_KEY = 'input_bindings';

export async function loadInputBindings(): Promise<InputBindingsConfig> {
  const db = await getDatabase();
  const rows = db.exec(
    `SELECT value FROM user_settings WHERE key = '${INPUT_BINDINGS_KEY}'`,
  );
  const raw = rows[0]?.values[0]?.[0];
  if (raw === undefined) {
    const merged = mergeWithDefaults({});
    await saveInputBindings(merged);
    return merged;
  }
  try {
    const parsed = JSON.parse(String(raw)) as unknown;
    return mergeWithDefaults(parsed);
  } catch {
    return mergeWithDefaults({});
  }
}

export async function saveInputBindings(config: InputBindingsConfig): Promise<void> {
  const db = await getDatabase();
  const merged = mergeWithDefaults(config);
  db.run(`INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)`, [
    INPUT_BINDINGS_KEY,
    JSON.stringify(merged),
  ]);
}
