'use client';

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'recentRecipes';
const MAX_RECENT = 10;
const EMPTY: RecentRecipe[] = [];

export type RecentRecipe = {
  id: string;
  name: string;
  image?: string;
};

let lastRaw: string | null | undefined;
let lastValue: RecentRecipe[] = EMPTY;
const listeners = new Set<() => void>();

function parse(raw: string | null): RecentRecipe[] {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RecentRecipe[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function currentRaw(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

/** Reads (memoized) the recently viewed recipes from localStorage. */
export function readRecentRecipes(): RecentRecipe[] {
  const raw = currentRaw();
  if (raw !== lastRaw) {
    lastRaw = raw;
    lastValue = parse(raw);
  }
  return lastValue;
}

export function recordRecentRecipe(recipe: RecentRecipe): void {
  if (typeof window === 'undefined') return;
  const next = [recipe, ...readRecentRecipes().filter((item) => item.id !== recipe.id)].slice(
    0,
    MAX_RECENT,
  );
  const serialized = JSON.stringify(next);
  window.localStorage.setItem(STORAGE_KEY, serialized);
  lastRaw = serialized;
  lastValue = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Subscribes to the recently viewed recipes, refreshed across the app. */
export function useRecentRecipes(): RecentRecipe[] {
  return useSyncExternalStore(subscribe, readRecentRecipes, () => EMPTY);
}
