"use client";

import { useSyncExternalStore } from "react";
import { utcDateKey } from "@/lib/graph/random";

/**
 * Per-browser progress in localStorage (daily results, streak, seen explainers).
 * Every access is wrapped in try/catch: private windows or blocked storage just mean "no progress".
 */

const PREFIX = "graphle:v1:";
const CHANGE_EVENT = "graphle-storage";

export interface DailyResult {
  won: boolean;
  score: string;
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(PREFIX + key, value);
  } catch {
    // storage unavailable: progress is simply not kept
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

/** Reactive raw value of a stored key. `serverValue` is used during SSR/hydration. */
export function useStoredItem(key: string, serverValue: string | null = null): string | null {
  return useSyncExternalStore(
    subscribe,
    () => read(key),
    () => serverValue,
  );
}

function dailyKey(gameId: string, date: string) {
  return `daily:${date}:${gameId}`;
}

export function parseDaily(raw: string | null): DailyResult | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DailyResult;
  } catch {
    return null;
  }
}

export function useDailyResult(gameId: string, date = utcDateKey()): DailyResult | null {
  return parseDaily(useStoredItem(dailyKey(gameId, date)));
}

/** Today's results for several games at once (snapshot is a joined string, so it stays stable). */
export function useDailyResults(gameIds: string[], date = utcDateKey()): Record<string, DailyResult | null> {
  const raw = useSyncExternalStore(
    subscribe,
    () => gameIds.map((id) => read(dailyKey(id, date)) ?? "").join("|"),
    () => "",
  );
  const parts = raw.split("|");
  return Object.fromEntries(gameIds.map((id, i) => [id, parseDaily(parts[i] || null)]));
}

/** Stores the first attempt of the day only (like Wordle: replays don't count). */
export function saveDailyResult(gameId: string, result: DailyResult, date = utcDateKey()) {
  const key = dailyKey(gameId, date);
  if (read(key)) return;
  write(key, JSON.stringify(result));

  const days = readDays();
  if (!days.includes(date)) write("days", JSON.stringify([...days, date].slice(-400)));
}

function readDays(): string[] {
  try {
    const parsed = JSON.parse(read("days") ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Consecutive days (ending today or yesterday) with at least one daily played. */
export function computeStreak(days: string[], today = new Date()): number {
  const set = new Set(days);
  const cursor = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  if (!set.has(utcDateKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let streak = 0;
  while (set.has(utcDateKey(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export function useStreak(): number {
  const raw = useStoredItem("days", "[]");
  try {
    const days = JSON.parse(raw ?? "[]");
    return Array.isArray(days) ? computeStreak(days) : 0;
  } catch {
    return 0;
  }
}

/** Whether the explainer of a game was already shown (server assumes yes to avoid a flash). */
export function useExplainerSeen(gameId: string): boolean {
  return useStoredItem(`seen:${gameId}`, "1") !== null;
}

export function markExplainerSeen(gameId: string) {
  write(`seen:${gameId}`, "1");
}
