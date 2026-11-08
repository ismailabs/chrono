import type { ChronoSettings } from "./settings";
import { cityNameForZone } from "./timeZones";
import { relativeDay, ZoneReader, type ZoneReading } from "./zoneReader";

export interface LocalReading extends ZoneReading {
  zoneName: string;
}

export interface WorldReading extends ZoneReading {
  zone: string;
  name: string;
  dayOffset: -1 | 0 | 1;
}

/** Everything the UI needs to draw one frame of the clock. */
export interface ClockSnapshot {
  local: LocalReading;
  /** Fraction of the device's current day that has elapsed, 0 to 1. */
  dayProgress: number;
  worlds: WorldReading[];
  /** Compact local time for the status bar. */
  statusText: string;
  /** Minute-precision text for assistive technology. */
  label: string;
}

export type ClockListener = (snapshot: ClockSnapshot) => void;

type CachedSnapshot = Omit<ClockSnapshot, "dayProgress">;

function localZoneName(): string {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return zone ? cityNameForZone(zone) : "Local time";
  } catch {
    return "Local time";
  }
}

function dayProgress(now: Date): number {
  const seconds =
    now.getHours() * 3600 +
    now.getMinutes() * 60 +
    now.getSeconds() +
    now.getMilliseconds() / 1000;
  return seconds / 86400;
}

/**
 * Formats the local clock and every world clock for one settings state.
 * Readings are cached per whole second, so repeated ticks within a second
 * reuse the same strings.
 */
export class ClockFormatter {
  private readonly localReader: ZoneReader;
  private readonly worldReaders: { zone: string; name: string; reader: ZoneReader }[];
  private cache: { key: number; base: CachedSnapshot } | null = null;

  constructor(private readonly settings: ChronoSettings) {
    const hour12 = settings.hourFormat === "12";
    const dateStyle = settings.dateStyle;
    this.localReader = new ZoneReader({ hour12, dateStyle });
    this.worldReaders = settings.worldClocks.map(({ zone, name }) => ({
      zone,
      name,
      reader: new ZoneReader({ timeZone: zone, hour12, dateStyle }),
    }));
  }

  snapshot(now: Date = new Date()): ClockSnapshot {
    const key = Math.floor(now.getTime() / 1000);
    if (!this.cache || this.cache.key !== key) {
      this.cache = { key, base: this.build(now) };
    }
    return { ...this.cache.base, dayProgress: dayProgress(now) };
  }

  private build(now: Date): CachedSnapshot {
    const local = this.localReader.read(now);
    const core = `${local.hour}:${local.minute}`;
    const period = local.period ? ` ${local.period}` : "";

    const worlds: WorldReading[] = this.settings.showWorldClocks
      ? this.worldReaders.map(({ zone, name, reader }) => {
          const reading = reader.read(now);
          return {
            ...reading,
            zone,
            name,
            dayOffset: relativeDay(reading.dayNumber, local.dayNumber),
          };
        })
      : [];

    return {
      local: { ...local, zoneName: localZoneName() },
      worlds,
      statusText: this.settings.showSeconds
        ? `${core}:${local.second}${period}`
        : `${core}${period}`,
      label: `${core}${period}, ${local.fullDate}`,
    };
  }
}

/**
 * Owns the formatter and fans one tick out to every subscriber (sidebar
 * view, status bar). The plugin drives `tick()` from a single registered
 * interval, so there is exactly one timer no matter how many views exist.
 */
export class ClockEngine {
  private formatter: ClockFormatter;
  private readonly listeners = new Set<ClockListener>();

  constructor(settings: ChronoSettings) {
    this.formatter = new ClockFormatter(settings);
  }

  configure(settings: ChronoSettings): void {
    this.formatter = new ClockFormatter(settings);
  }

  /** Fresh snapshot without notifying anyone. */
  snapshot(now: Date = new Date()): ClockSnapshot {
    return this.formatter.snapshot(now);
  }

  subscribe(listener: ClockListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  tick(): void {
    if (this.listeners.size === 0) return;

    let snapshot: ClockSnapshot;
    try {
      snapshot = this.formatter.snapshot();
    } catch (error) {
      console.error("Chrono: unable to read the current time.", error);
      return;
    }

    for (const listener of Array.from(this.listeners)) {
      try {
        listener(snapshot);
      } catch (error) {
        console.error("Chrono: a clock listener failed.", error);
      }
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}
