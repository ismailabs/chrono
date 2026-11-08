/**
 * Settings model. Free of Obsidian imports so it can be tested in isolation.
 */
import { MAX_WORLD_CLOCKS } from "./constants";
import { cityNameForZone, isValidTimeZone } from "./timeZones";

/** Version 2 replaced the glitch and bar options and added world clocks. */
export const SETTINGS_VERSION = 2;

export type HourFormat = "12" | "24";
export type DateStyle = "long" | "short";
export type Density = "comfortable" | "compact";

export interface WorldClockEntry {
  /** IANA time zone identifier, unique within the list. */
  zone: string;
  /** Name shown in the sidebar. */
  name: string;
}

export interface ChronoSettings {
  /** 12-hour (with AM/PM) or 24-hour notation. */
  hourFormat: HourFormat;
  /** Seconds on the local clock and on world clocks. */
  showSeconds: boolean;
  showDate: boolean;
  /** "long" includes the year, "short" is compact. */
  dateStyle: DateStyle;
  /** Time zone name and UTC offset under the local clock. */
  showTimezone: boolean;
  /** Thin progress line showing how far through the day the device is. */
  showProgress: boolean;
  density: Density;
  showWorldClocks: boolean;
  worldClocks: WorldClockEntry[];
  showStatusBar: boolean;
}

/** Reads the device's preferred hour cycle so first-run feels native. */
export function detectDeviceHourFormat(): HourFormat {
  try {
    const cycle = new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
    }).resolvedOptions().hourCycle;
    return cycle === "h23" || cycle === "h24" ? "24" : "12";
  } catch {
    return "24";
  }
}

export function getDefaultSettings(): ChronoSettings {
  return {
    hourFormat: detectDeviceHourFormat(),
    showSeconds: true,
    showDate: true,
    dateStyle: "long",
    showTimezone: true,
    showProgress: true,
    density: "comfortable",
    showWorldClocks: true,
    worldClocks: [],
    showStatusBar: false,
  };
}

function sanitizeWorldClocks(value: unknown): WorldClockEntry[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: WorldClockEntry[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) continue;
    const { zone, name } = item as Record<string, unknown>;
    if (typeof zone !== "string" || seen.has(zone) || !isValidTimeZone(zone)) {
      continue;
    }
    seen.add(zone);
    const label = typeof name === "string" ? name.trim().slice(0, 60) : "";
    result.push({ zone, name: label || cityNameForZone(zone) });
    if (result.length >= MAX_WORLD_CLOCKS) break;
  }
  return result;
}

/**
 * Turns whatever was stored on disk (possibly missing, partial, from an
 * older version, or hand-edited) into a fully valid settings object.
 * Version 1 stored `showBars`, which maps onto `showProgress`; the retired
 * `glitchEffects` key is simply ignored.
 */
export function sanitizeSettings(raw: unknown): ChronoSettings {
  const defaults = getDefaultSettings();
  if (typeof raw !== "object" || raw === null) return defaults;
  const r = raw as Record<string, unknown>;

  const bool = (value: unknown, fallback: boolean): boolean =>
    typeof value === "boolean" ? value : fallback;

  const progressSource = "showProgress" in r ? r.showProgress : r.showBars;

  return {
    hourFormat:
      r.hourFormat === "12" || r.hourFormat === "24"
        ? r.hourFormat
        : defaults.hourFormat,
    showSeconds: bool(r.showSeconds, defaults.showSeconds),
    showDate: bool(r.showDate, defaults.showDate),
    dateStyle:
      r.dateStyle === "long" || r.dateStyle === "short"
        ? r.dateStyle
        : defaults.dateStyle,
    showTimezone: bool(r.showTimezone, defaults.showTimezone),
    showProgress: bool(progressSource, defaults.showProgress),
    density:
      r.density === "comfortable" || r.density === "compact"
        ? r.density
        : defaults.density,
    showWorldClocks: bool(r.showWorldClocks, defaults.showWorldClocks),
    worldClocks: sanitizeWorldClocks(r.worldClocks),
    showStatusBar: bool(r.showStatusBar, defaults.showStatusBar),
  };
}

export function toStoredSettings(settings: ChronoSettings): Record<string, unknown> {
  return { schemaVersion: SETTINGS_VERSION, ...settings };
}
