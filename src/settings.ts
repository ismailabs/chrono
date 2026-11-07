/**
 * Settings model. Intentionally free of Obsidian imports so it can be
 * reused and tested in isolation.
 */

export type HourFormat = "12" | "24";
export type DateStyle = "long" | "short";

export interface ChronoSettings {
  /** 12-hour (with AM/PM) or 24-hour notation. */
  hourFormat: HourFormat;
  /** Seconds digits plus the seconds bar. */
  showSeconds: boolean;
  /** Hour and minute progress bars under the time. */
  showBars: boolean;
  /** Animated glitch effects on digits and bars. */
  glitchEffects: boolean;
  showDate: boolean;
  /** "long" includes the year, "short" is compact. */
  dateStyle: DateStyle;
  showTimezone: boolean;
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
    showBars: true,
    glitchEffects: true,
    showDate: true,
    dateStyle: "long",
    showTimezone: true,
    showStatusBar: false,
  };
}

/**
 * Turns whatever was stored on disk (possibly missing, partial, from an
 * older version, or hand-edited) into a fully valid settings object.
 */
export function sanitizeSettings(raw: unknown): ChronoSettings {
  const defaults = getDefaultSettings();
  if (typeof raw !== "object" || raw === null) return defaults;
  const r = raw as Record<string, unknown>;

  const bool = (value: unknown, fallback: boolean): boolean =>
    typeof value === "boolean" ? value : fallback;

  return {
    hourFormat:
      r.hourFormat === "12" || r.hourFormat === "24"
        ? r.hourFormat
        : defaults.hourFormat,
    showSeconds: bool(r.showSeconds, defaults.showSeconds),
    showBars: bool(r.showBars, defaults.showBars),
    glitchEffects: bool(r.glitchEffects, defaults.glitchEffects),
    showDate: bool(r.showDate, defaults.showDate),
    dateStyle:
      r.dateStyle === "long" || r.dateStyle === "short"
        ? r.dateStyle
        : defaults.dateStyle,
    showTimezone: bool(r.showTimezone, defaults.showTimezone),
    showStatusBar: bool(r.showStatusBar, defaults.showStatusBar),
  };
}
