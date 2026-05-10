/**
 * Shape of JSON export from {@link buildMapExportJson}. Stable for offline analysis.
 */
export interface ArnautsMapExportV1 {
  format: 'arnauts-map';
  version: 1;
  exportedAtMs: number;
  session: {
    id: number;
    label: string;
    createdAtMs: number;
  };
  tiles: Array<{ x: number; y: number; tileType: string }>;
  interactables: Array<{ kind: 'ladder' | 'terminal'; x: number; y: number }>;
  placementEvents: Array<{
    seq: number;
    timestampMs: number;
    actionKind: string;
    payload: unknown;
    outcome: 'accepted' | 'rejected';
    ruleResults: RuleResultJson[];
  }>;
}

export interface RuleResultJson {
  ruleId: string;
  passed: boolean;
  message?: string;
  data?: Record<string, unknown>;
}

export function isArnautsMapExportV1(x: unknown): x is ArnautsMapExportV1 {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return o.format === 'arnauts-map' && o.version === 1;
}
