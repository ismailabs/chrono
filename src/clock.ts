import type { ChronoSettings } from "./settings";

/** Everything the UI needs to draw one frame of the clock. */
export interface ClockSnapshot {
  hour: string;
  minute: string;
  second: string;
  /** AM/PM text in 12-hour mode, empty string in 24-hour mode. */
  period: string;
  weekday: string;
  date: string;
  zoneName: string;
  zoneOffset: string;
  /** Position within the current minute, 0 to 1 (the seconds bar). */
  progress: number;
  /** Position within the current hour, 0 to 1 (the minutes bar). */
  minuteProgress: number;
  /** Position within the 12 or 24 hour cycle, 0 to 1 (the hours bar). */
  hourProgress: number;
  /** Number of ticks on the hours bar: 12 or 24, matching the hour format. */
  hourSegments: number;
  /** Compact text for the status bar. */
  statusText: string;
  /** Full date, for tooltips. */
  tooltip: string;
  /** Minute-precision text for assistive technology. */
  label: string;
}

type SnapshotBase = Omit<
  ClockSnapshot,
  "progress" | "minuteProgress" | "hourProgress"
>;
type PartMap = Partial<Record<Intl.DateTimeFormatPartTypes, string>>;

function makeFormat(
  locale: string | undefined,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  try {
    return new Intl.DateTimeFormat(locale, options);
  } catch (error) {
    console.error("Chrono: locale not supported, using the default.", error);
    return new Intl.DateTimeFormat(undefined, options);
  }
}

function toParts(format: Intl.DateTimeFormat, date: Date): PartMap {
  const parts: PartMap = {};
  for (const part of format.formatToParts(date)) parts[part.type] = part.value;
  return parts;
}

function zoneCity(): string {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!zone) return "Local time";
    if (zone === "UTC" || zone === "Etc/UTC") return "UTC";
    const last = zone.split("/").pop() ?? zone;
    return last.replace(/_/g, " ");
  } catch {
    return "Local time";
  }
}

function formatOffset(date: Date): string {
  const total = -date.getTimezoneOffset();
  const sign = total < 0 ? "\u2212" : "+";
  const abs = Math.abs(total);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  const suffix = minutes ? `:${String(minutes).padStart(2, "0")}` : "";
  return `UTC${sign}${hours}${suffix}`;
}

/**
 * Formats a Date into display strings. Intl formatters are created once per
 * settings change, and each second's strings are cached, so repeated calls
 * within the same second are nearly free.
 */
export class ClockFormatter {
  private readonly timeFormat: Intl.DateTimeFormat;
  private readonly weekdayFormat: Intl.DateTimeFormat;
  private readonly dateFormat: Intl.DateTimeFormat;
  private readonly fullFormat: Intl.DateTimeFormat;
  private cache: { key: number; base: SnapshotBase } | null = null;

  constructor(
    private readonly settings: ChronoSettings,
    locale?: string
  ) {
    const twelve = settings.hourFormat === "12";
    this.timeFormat = makeFormat(locale, {
      hour: twelve ? "numeric" : "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: twelve ? "h12" : "h23",
    });
    this.weekdayFormat = makeFormat(locale, { weekday: "long" });
    this.dateFormat = makeFormat(
      locale,
      settings.dateStyle === "long"
        ? { day: "numeric", month: "long", year: "numeric" }
        : { day: "numeric", month: "short" }
    );
    this.fullFormat = makeFormat(locale, { dateStyle: "full" });
  }

  snapshot(now: Date = new Date()): ClockSnapshot {
    const key = Math.floor(now.getTime() / 1000);
    if (!this.cache || this.cache.key !== key) {
      this.cache = { key, base: this.build(now) };
    }

    // Each bar is the fraction of its own unit that has elapsed, with the
    // smaller units folded in so every bar glides instead of stepping.
    const progress = (now.getSeconds() + now.getMilliseconds() / 1000) / 60;
    const minuteProgress = (now.getMinutes() + progress) / 60;
    const cycle = this.cache.base.hourSegments;
    const hourProgress = ((now.getHours() % cycle) + minuteProgress) / cycle;

    return { ...this.cache.base, progress, minuteProgress, hourProgress };
  }

  private build(now: Date): SnapshotBase {
    const time = toParts(this.timeFormat, now);
    const hour = time.hour ?? "";
    const minute = time.minute ?? "";
    const second = time.second ?? "";
    const period =
      this.settings.hourFormat === "12" ? (time.dayPeriod ?? "") : "";

    const full = this.fullFormat.format(now);
    const core = `${hour}:${minute}`;
    const withPeriod = (text: string) => (period ? `${text} ${period}` : text);

    const city = zoneCity();

    return {
      hour,
      minute,
      second,
      period,
      hourSegments: this.settings.hourFormat === "12" ? 12 : 24,
      weekday: this.weekdayFormat.format(now),
      date: this.dateFormat.format(now),
      zoneName: city,
      zoneOffset: city === "UTC" ? "" : formatOffset(now),
      statusText: withPeriod(
        this.settings.showSeconds ? `${core}:${second}` : core
      ),
      tooltip: full,
      label: `${withPeriod(core)}, ${full}`,
    };
  }
}

export type ClockListener = (snapshot: ClockSnapshot) => void;

/**
 * Owns the formatter and fans one tick out to every subscriber (sidebar
 * view, status bar). The plugin drives `tick()` from a single registered
 * interval, so there is exactly one timer no matter how many views exist.
 */
export class ClockEngine {
  private formatter: ClockFormatter;
  private readonly listeners = new Set<ClockListener>();

  constructor(
    settings: ChronoSettings,
    private readonly locale?: string
  ) {
    this.formatter = new ClockFormatter(settings, locale);
  }

  configure(settings: ChronoSettings): void {
    this.formatter = new ClockFormatter(settings, this.locale);
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
