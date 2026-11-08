import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ZoneReader, formatUtcOffset, relativeDay } from "../src/zoneReader";

const utc = (iso: string) => new Date(iso);
const reader = (timeZone: string | undefined, hour12 = false) =>
  new ZoneReader({ timeZone, hour12, dateStyle: "long" });

describe("ZoneReader time formatting", () => {
  it("formats 24-hour time with two-digit fields and no period", () => {
    const r = reader("UTC").read(utc("2026-01-15T00:05:09Z"));
    assert.equal(r.hour, "00");
    assert.equal(r.minute, "05");
    assert.equal(r.second, "09");
    assert.equal(r.period, "");
  });

  it("formats 12-hour time with an AM marker in the morning", () => {
    const r = new ZoneReader({ timeZone: "UTC", hour12: true, dateStyle: "short" }).read(
      utc("2026-01-15T00:05:09Z")
    );
    assert.equal(r.hour, "12");
    assert.match(r.period, /am|a\.m\./i);
  });

  it("formats 12-hour time with a PM marker in the afternoon", () => {
    const r = new ZoneReader({ timeZone: "UTC", hour12: true, dateStyle: "short" }).read(
      utc("2026-01-15T13:05:09Z")
    );
    assert.equal(r.hour, "1");
    assert.match(r.period, /pm|p\.m\./i);
  });
});

describe("UTC offsets", () => {
  it("reports whole and fractional offsets from IANA zones", () => {
    assert.equal(reader("Asia/Tokyo").read(utc("2026-01-15T00:00:00Z")).offset, "UTC+9");
    assert.equal(reader("Asia/Kolkata").read(utc("2026-01-15T00:00:00Z")).offset, "UTC+5:30");
    assert.equal(reader("Asia/Kathmandu").read(utc("2026-01-15T00:00:00Z")).offset, "UTC+5:45");
    assert.equal(reader("UTC").read(utc("2026-01-15T00:00:00Z")).offset, "UTC");
  });

  it("formats negative offsets with a true minus sign", () => {
    assert.equal(formatUtcOffset("GMT-03:30"), "UTC\u22123:30");
    assert.equal(formatUtcOffset("GMT+09:00"), "UTC+9");
    assert.equal(formatUtcOffset("GMT"), "UTC");
    assert.equal(formatUtcOffset("nonsense"), "UTC");
  });
});

describe("Daylight saving time", () => {
  it("follows New York's switch from standard to daylight time", () => {
    const ny = reader("America/New_York");
    assert.equal(ny.read(utc("2026-01-15T12:00:00Z")).offset, "UTC\u22125");
    assert.equal(ny.read(utc("2026-07-15T12:00:00Z")).offset, "UTC\u22124");
  });

  it("changes exactly at the 2026-03-08 transition in New York", () => {
    const ny = reader("America/New_York");
    assert.equal(ny.read(utc("2026-03-08T06:59:00Z")).offset, "UTC\u22125");
    assert.equal(ny.read(utc("2026-03-08T07:01:00Z")).offset, "UTC\u22124");
  });
});

describe("Day relation between locations", () => {
  it("counts the zone's calendar day against a reference zone", () => {
    const now = utc("2026-01-15T20:00:00Z");
    const base = reader("UTC").read(now).dayNumber;
    assert.equal(relativeDay(reader("Asia/Tokyo").read(now).dayNumber, base), 1);
    assert.equal(relativeDay(reader("America/Los_Angeles").read(now).dayNumber, base), 0);
    assert.equal(
      relativeDay(reader("Pacific/Honolulu").read(now).dayNumber, base),
      0
    );
    assert.equal(
      relativeDay(reader("Pacific/Pago_Pago").read(utc("2026-01-15T02:00:00Z")).dayNumber, base),
      -1
    );
  });
});
