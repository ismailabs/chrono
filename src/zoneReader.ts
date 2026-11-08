import type { DateStyle } from "./settings";

export interface ZoneReading {
  hour: string;
  minute: string;
  second: string;
  /** AM or PM in 12-hour mode, empty string in 24-hour mode. */
  period: string;
  weekday: string;
  /** Date in the chosen style, for example "November 3, 2026" or "Nov 3". */
  date: string;
  /** Full localized date, for tooltips and assistive text. */
  fullDate: string;
  /** For example "UTC", "UTC+1" or "UTC+5:30", with a true minus sign for negatives. */
  offset: string;
  /** Calendar day in the zone, counted in whole days since the Unix epoch. */
  dayNumber: number;
}

export interface ZoneReaderOptions {
  /** IANA identifier. Undefined means the device's own time zone. */
  timeZone?: string;
  hour12: boolean;
  dateStyle: DateStyle;
}

type PartMap = Partial<Record<Intl.DateTimeFormatPartTypes, string>>;

const MS_PER_DAY = 86400000;

function makeFormat(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  try {
    return new Intl.DateTimeFormat(undefined, options);
  } catch (error) {
    console.error("Chrono: unable to create a date formatter.", error);
    return new Intl.DateTimeFormat("en-US", { timeZone: "UTC" });
  }
}

function readParts(format: Intl.DateTimeFormat, date: Date): PartMap {
  const parts: PartMap = {};
  for (const part of format.formatToParts(date)) parts[part.type] = part.value;
  return parts;
}

/** Converts "GMT+05:30" (as Intl reports it) into "UTC+5:30". */
export function formatUtcOffset(longOffset: string): string {
  const match = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/.exec(longOffset.trim());
  if (!match) return "UTC";
  const [, sign, hours, minutes] = match;
  const suffix = minutes && minutes !== "00" ? `:${minutes}` : "";
  return `UTC${sign === "-" ? "\u2212" : "+"}${Number(hours)}${suffix}`;
}

/** Whether another zone's calendar day is yesterday, today or tomorrow relative to the local one. */
export function relativeDay(zoneDay: number, localDay: number): -1 | 0 | 1 {
  const diff = zoneDay - localDay;
  if (diff > 0) return 1;
  if (diff < 0) return -1;
  return 0;
}

/**
 * Formats the time in one time zone. All wall-clock and daylight saving
 * decisions are delegated to Intl using IANA identifiers, never fixed offsets.
 */
export class ZoneReader {
  private readonly hour12: boolean;
  private readonly timeFormat: Intl.DateTimeFormat;
  private readonly weekdayFormat: Intl.DateTimeFormat;
  private readonly dateFormat: Intl.DateTimeFormat;
  private readonly fullFormat: Intl.DateTimeFormat;
  private readonly dayFormat: Intl.DateTimeFormat;
  private readonly offsetFormat: Intl.DateTimeFormat;

  constructor(options: ZoneReaderOptions) {
    const { timeZone, hour12, dateStyle } = options;
    this.hour12 = hour12;
    this.timeFormat = makeFormat({
      timeZone,
      hour: hour12 ? "numeric" : "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: hour12 ? "h12" : "h23",
    });
    this.weekdayFormat = makeFormat({ timeZone, weekday: "long" });
    this.dateFormat = makeFormat({
      timeZone,
      ...(dateStyle === "long"
        ? { day: "numeric", month: "long", year: "numeric" }
        : { day: "numeric", month: "short" }),
    });
    this.fullFormat = makeFormat({ timeZone, dateStyle: "full" });
    // Calendar and offset parsing use English digits and names so the
    // arithmetic is locale-independent. Display strings use the user's locale.
    this.dayFormat = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    this.offsetFormat = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
    });
  }

  read(now: Date): ZoneReading {
    const time = readParts(this.timeFormat, now);
    const day = readParts(this.dayFormat, now);
    const offset = readParts(this.offsetFormat, now).timeZoneName ?? "";
    const dayNumber =
      Date.UTC(Number(day.year), Number(day.month) - 1, Number(day.day)) /
      MS_PER_DAY;

    return {
      hour: time.hour ?? "",
      minute: time.minute ?? "",
      second: time.second ?? "",
      period: this.hour12 ? (time.dayPeriod ?? "") : "",
      weekday: this.weekdayFormat.format(now),
      date: this.dateFormat.format(now),
      fullDate: this.fullFormat.format(now),
      offset: formatUtcOffset(offset),
      dayNumber,
    };
  }
}
