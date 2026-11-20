/**
 * Deterministic randomness helpers.
 * The same seed always yields the same sequence, on every device,
 * so a daily or shared puzzle is identical for everybody.
 */

const SEED_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const SEED_PATTERN = /^[A-Za-z0-9-]{1,40}$/;

/** First day of the daily series (puzzle #1). */
const DAILY_EPOCH = Date.UTC(2026, 0, 1);

/** cyrb53 string hash → 53-bit integer. */
export function hashString(str: string): number {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

export interface Rng {
  /** Float in [0, 1). */
  next(): number;
  /** Integer in [min, max] (inclusive). */
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: T[]): T[];
  /** k distinct items. */
  sample<T>(items: readonly T[], k: number): T[];
}

/** mulberry32 PRNG seeded from a string. */
export function createRng(seed: string): Rng {
  let state = hashString(seed) >>> 0;

  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));

  const shuffle = <T,>(items: T[]) => {
    for (let i = items.length - 1; i > 0; i--) {
      const j = int(0, i);
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  };

  return {
    next,
    int,
    pick: (items) => items[int(0, items.length - 1)],
    shuffle,
    sample: (items, k) => shuffle([...items]).slice(0, k),
  };
}

/** Random 6-char seed (not deterministic — for practice / new challenges). */
export function randomSeed(): string {
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += SEED_ALPHABET[Math.floor(Math.random() * SEED_ALPHABET.length)];
  }
  return out;
}

export function isValidSeed(seed: string | undefined | null): seed is string {
  return typeof seed === "string" && SEED_PATTERN.test(seed);
}

/** YYYY-MM-DD of the given date in UTC. */
export function utcDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/** Seed of today's puzzle for one game; same for everyone in the world. */
export function dailySeed(gameId: string, date = new Date()): string {
  return `${gameId}-${utcDateKey(date)}`;
}

/** Progressive number of the daily puzzle (1 = 2026-01-01). */
export function dailyNumber(date = new Date()): number {
  const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.floor((today - DAILY_EPOCH) / 86_400_000) + 1;
}

/** Milliseconds until the next UTC midnight (when the daily puzzles change). */
export function msUntilNextDaily(date = new Date()): number {
  const next = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1);
  return next - date.getTime();
}
