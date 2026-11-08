import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ClockFormatter } from "../src/clock";
import { getDefaultSettings, type ChronoSettings } from "../src/settings";

function settingsWith(patch: Partial<ChronoSettings>): ChronoSettings {
  return { ...getDefaultSettings(), ...patch };
}

describe("ClockFormatter world clocks", () => {
  const instant = new Date("2026-01-15T13:05:09Z");

  it("shows each saved zone's wall-clock time in 24-hour form", () => {
    const formatter = new ClockFormatter(
      settingsWith({
        hourFormat: "24",
        worldClocks: [
          { zone: "Asia/Tokyo", name: "Tokyo" },
          { zone: "America/New_York", name: "New York" },
        ],
      })
    );
    const [tokyo, newYork] = formatter.snapshot(instant).worlds;
    assert.equal(tokyo.name, "Tokyo");
    assert.equal(`${tokyo.hour}:${tokyo.minute}`, "22:05");
    assert.equal(tokyo.offset, "UTC+9");
    assert.equal(`${newYork.hour}:${newYork.minute}`, "08:05");
    assert.equal(newYork.offset, "UTC\u22125");
  });

  it("reflects daylight saving time for the same zone across seasons", () => {
    const formatter = new ClockFormatter(
      settingsWith({ hourFormat: "24", worldClocks: [{ zone: "America/New_York", name: "NY" }] })
    );
    const summer = formatter.snapshot(new Date("2026-07-15T12:00:00Z")).worlds[0];
    assert.equal(summer.offset, "UTC\u22124");
    assert.equal(summer.hour, "08");
  });

  it("marks zones that are a day ahead of or behind the local date", () => {
    const formatter = new ClockFormatter(
      settingsWith({
        worldClocks: [{ zone: "Pacific/Kiritimati", name: "Kiritimati" }],
      })
    );
    const local = formatter.snapshot(instant).local;
    const [kiritimati] = formatter.snapshot(instant).worlds;
    const expected = Math.max(-1, Math.min(1, kiritimati.dayNumber - local.dayNumber));
    assert.equal(kiritimati.dayOffset, expected);
  });

  it("omits world clocks when they are hidden", () => {
    const formatter = new ClockFormatter(
      settingsWith({
        showWorldClocks: false,
        worldClocks: [{ zone: "Asia/Tokyo", name: "Tokyo" }],
      })
    );
    assert.deepEqual(formatter.snapshot(instant).worlds, []);
  });
});

describe("ClockFormatter local clock", () => {
  it("includes seconds in the status text only when enabled", () => {
    const now = new Date("2026-01-15T13:05:09Z");
    const withSeconds = new ClockFormatter(settingsWith({ showSeconds: true })).snapshot(now);
    const without = new ClockFormatter(settingsWith({ showSeconds: false })).snapshot(now);
    assert.match(withSeconds.statusText, /\d:\d\d:\d\d/);
    assert.match(without.statusText, /^\d{1,2}:\d\d( \S+)?$/);
  });

  it("reports a day progress between 0 and 1", () => {
    const snapshot = new ClockFormatter(settingsWith({})).snapshot(new Date("2026-01-15T13:05:09Z"));
    assert.ok(snapshot.dayProgress >= 0 && snapshot.dayProgress < 1);
  });
});
