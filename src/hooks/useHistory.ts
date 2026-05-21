import type { FoodItem } from "../types/food";

const HISTORY_KEY = "food-history";
const MAX_ENTRIES = 200;

export interface HistoryEntry {
  foodId: string;
  timestamp: number;
}

function load(): HistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function addPick(foodId: string) {
  const entries = load();
  entries.push({ foodId, timestamp: Date.now() });
  while (entries.length > MAX_ENTRIES) entries.shift();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
}

function getRecentIds(days: number): Set<string> {
  const cutoff = Date.now() - days * 86400000;
  return new Set(load().filter((e) => e.timestamp > cutoff).map((e) => e.foodId));
}

function getTriedCount(): number {
  return new Set(load().map((e) => e.foodId)).size;
}

function getWeightedPool(foods: FoodItem[]): FoodItem[] {
  const recent7 = getRecentIds(7);
  const recent30 = getRecentIds(30);
  const allTried = new Set(load().map((e) => e.foodId));

  const weighted: FoodItem[] = [];
  for (const f of foods) {
    let weight = 1;
    if (recent7.has(f.id)) weight = 0.2;
    else if (recent30.has(f.id)) weight = 0.5;
    else if (!allTried.has(f.id)) weight = 2;

    const entries = Math.max(1, Math.round(weight * 5));
    for (let i = 0; i < entries; i++) weighted.push(f);
  }
  return weighted;
}

function wasEatenRecently(foodId: string, days: number): boolean {
  return getRecentIds(days).has(foodId);
}

export function useHistory() {
  return { addPick, getRecentIds, getTriedCount, getWeightedPool, wasEatenRecently, load };
}
