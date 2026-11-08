import { MAX_WORLD_CLOCKS } from "./constants";
import type { WorldClockEntry } from "./settings";

export function hasWorldClock(list: readonly WorldClockEntry[], zone: string): boolean {
  return list.some((entry) => entry.zone === zone);
}

/** Returns the list unchanged when the zone is already present or the list is full. */
export function addWorldClock(
  list: readonly WorldClockEntry[],
  entry: WorldClockEntry
): WorldClockEntry[] {
  if (hasWorldClock(list, entry.zone) || list.length >= MAX_WORLD_CLOCKS) {
    return [...list];
  }
  return [...list, entry];
}

export function removeWorldClock(
  list: readonly WorldClockEntry[],
  zone: string
): WorldClockEntry[] {
  return list.filter((entry) => entry.zone !== zone);
}

/** Swaps the entry with its neighbour. The list is returned unchanged at either edge. */
export function moveWorldClock(
  list: readonly WorldClockEntry[],
  zone: string,
  direction: -1 | 1
): WorldClockEntry[] {
  const index = list.findIndex((entry) => entry.zone === zone);
  const target = index + direction;
  const next = [...list];
  if (index < 0 || target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
