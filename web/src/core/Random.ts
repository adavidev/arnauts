export class Random {
  static rand(_seed: number, bound: number): number {
    return Math.floor(Math.random() * bound);
  }
}
