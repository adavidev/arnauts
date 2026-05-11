import {
  mergeRulePresetsWithDefaults,
  type PlacementRulePresetsConfig,
} from '../placement/rulePresets';
import { getDatabase } from './sqlite';

const KEY = 'placement_rule_presets';

export async function loadPlacementRulePresets(): Promise<PlacementRulePresetsConfig> {
  const db = await getDatabase();
  const rows = db.exec(`SELECT value FROM user_settings WHERE key = '${KEY}'`);
  const raw = rows[0]?.values[0]?.[0];
  if (raw === undefined) {
    const merged = mergeRulePresetsWithDefaults({});
    await savePlacementRulePresets(merged);
    return merged;
  }
  try {
    return mergeRulePresetsWithDefaults(JSON.parse(String(raw)));
  } catch {
    return mergeRulePresetsWithDefaults({});
  }
}

export async function savePlacementRulePresets(
  config: PlacementRulePresetsConfig,
): Promise<void> {
  const db = await getDatabase();
  const merged = mergeRulePresetsWithDefaults(config);
  db.run(`INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)`, [
    KEY,
    JSON.stringify(merged),
  ]);
}
