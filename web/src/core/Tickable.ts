export interface Tickable {
  tick(time: number, deltaMs: number): void;
}
