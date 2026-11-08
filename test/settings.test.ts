import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getDefaultSettings,
  sanitizeSettings,
  toStoredSettings,
} from "../src/settings";
import { MAX_WORLD_CLOCKS } from "../src/constants";

describe("sanitizeSettings", () => {
  it("returns complete defaults for missing or non-object data", () => {
    assert.deepEqual(
      Object.keys(sanitizeSettings(undefined)).sort(),
      Object.keys(getDefaultSettings()).sort()
    );
    assert.equal(sanitizeSettings("oops").showWorldClocks, true);
  });

  it("migrates version 1 settings", () => {
    const migrated = sanitizeSettings({
      hourFormat: "24",
      showSeconds: false,
      showBars: false,
      glitchEffects: true,
      showDate: true,
      dateStyle: "short",
      showTimezone: false,
      showStatusBar: true,
    });
    assert.equal(migrated.hourFormat, "24");
    assert.equal(migrated.showSeconds, false);
    assert.equal(migrated.showProgress, false);
    assert.equal(migrated.dateStyle, "short");
    assert.equal(migrated.showStatusBar, true);
    assert.equal(migrated.density, "comfortable");
    assert.deepEqual(migrated.worldClocks, []);
    assert.equal("glitchEffects" in migrated, false);
    assert.equal("showBars" in migrated, false);
  });

  it("falls back to defaults for invalid values", () => {
    const defaults = getDefaultSettings();
    const cleaned = sanitizeSettings({
      hourFormat: "36",
      density: "huge",
      dateStyle: 3,
      showSeconds: "yes",
    });
    assert.equal(cleaned.density, defaults.density);
    assert.equal(cleaned.dateStyle, defaults.dateStyle);
    assert.equal(cleaned.showSeconds, defaults.showSeconds);
    assert.ok(cleaned.hourFormat === "12" || cleaned.hourFormat === "24");
  });

  it("keeps valid world clocks, drops invalid and duplicate zones", () => {
    const cleaned = sanitizeSettings({
      worldClocks: [
        { zone: "Europe/Paris", name: "  " },
        { zone: "Europe/Paris", name: "Duplicate" },
        { zone: "Mars/Base", name: "Nowhere" },
        "not an object",
        { zone: "Asia/Tokyo", name: "Tokyo" },
      ],
    });
    assert.deepEqual(cleaned.worldClocks, [
      { zone: "Europe/Paris", name: "Paris" },
      { zone: "Asia/Tokyo", name: "Tokyo" },
    ]);
  });

  it("caps the number of world clocks", () => {
    const zones = [
      "Europe/Paris", "Europe/Berlin", "Europe/Rome", "Europe/Madrid",
      "Asia/Tokyo", "Asia/Seoul", "Asia/Shanghai", "Asia/Dubai",
      "Asia/Kolkata", "Asia/Bangkok", "Asia/Jakarta", "Asia/Manila",
      "Australia/Sydney", "Pacific/Auckland", "America/Toronto",
    ];
    const cleaned = sanitizeSettings({
      worldClocks: zones.map((zone) => ({ zone, name: zone })),
    });
    assert.equal(cleaned.worldClocks.length, MAX_WORLD_CLOCKS);
  });

  it("stores the schema version alongside the settings", () => {
    const stored = toStoredSettings(getDefaultSettings());
    assert.equal(stored.schemaVersion, 2);
    assert.equal(sanitizeSettings(stored).showSeconds, getDefaultSettings().showSeconds);
  });
});
