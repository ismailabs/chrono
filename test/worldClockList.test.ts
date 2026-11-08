import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  addWorldClock,
  moveWorldClock,
  removeWorldClock,
} from "../src/worldClockList";
import { MAX_WORLD_CLOCKS } from "../src/constants";
import type { WorldClockEntry } from "../src/settings";
import { cityNameForZone, isValidTimeZone, searchCities } from "../src/timeZones";

const paris: WorldClockEntry = { zone: "Europe/Paris", name: "Paris" };
const tokyo: WorldClockEntry = { zone: "Asia/Tokyo", name: "Tokyo" };
const lima: WorldClockEntry = { zone: "America/Lima", name: "Lima" };

describe("world clock list management", () => {
  it("adds a city and refuses duplicates", () => {
    const list = addWorldClock([paris], tokyo);
    assert.deepEqual(list, [paris, tokyo]);
    assert.deepEqual(addWorldClock(list, { zone: "Europe/Paris", name: "Again" }), list);
  });

  it("refuses to add beyond the maximum", () => {
    const full: WorldClockEntry[] = Array.from({ length: MAX_WORLD_CLOCKS }, (_, i) => ({
      zone: `Etc/GMT+${i}`,
      name: `Zone ${i}`,
    }));
    assert.equal(addWorldClock(full, lima).length, MAX_WORLD_CLOCKS);
  });

  it("removes by zone and leaves other entries in order", () => {
    assert.deepEqual(removeWorldClock([paris, tokyo, lima], "Asia/Tokyo"), [paris, lima]);
  });

  it("moves entries up and down, stopping at the edges", () => {
    const list = [paris, tokyo, lima];
    assert.deepEqual(moveWorldClock(list, "America/Lima", -1), [paris, lima, tokyo]);
    assert.deepEqual(moveWorldClock(list, "Europe/Paris", -1), list);
    assert.deepEqual(moveWorldClock(list, "America/Lima", 1), list);
    assert.deepEqual(moveWorldClock(list, "Europe/Paris", 1), [tokyo, paris, lima]);
  });

  it("never mutates the list it receives", () => {
    const list = [paris, tokyo];
    moveWorldClock(list, "Asia/Tokyo", -1);
    removeWorldClock(list, "Asia/Tokyo");
    addWorldClock(list, lima);
    assert.deepEqual(list, [paris, tokyo]);
  });
});

describe("time zone catalog", () => {
  it("validates IANA identifiers", () => {
    assert.equal(isValidTimeZone("Europe/Paris"), true);
    assert.equal(isValidTimeZone("Mars/Base"), false);
  });

  it("names curated zones by city and others by their last segment", () => {
    assert.equal(cityNameForZone("Asia/Kolkata"), "Mumbai");
    assert.equal(cityNameForZone("America/Port_of_Spain"), "Port of Spain");
  });

  it("finds curated cities by name and country", () => {
    assert.ok(searchCities("paris").some((c) => c.zone === "Europe/Paris"));
    assert.ok(searchCities("japan").some((c) => c.zone === "Asia/Tokyo"));
  });

  it("finds raw IANA identifiers that are not curated", () => {
    assert.ok(searchCities("Europe/Malta").some((c) => c.zone === "Europe/Malta"));
  });

  it("returns nothing for an unknown query and honours the limit", () => {
    assert.deepEqual(searchCities("zzqqxx-no-match"), []);
    assert.ok(searchCities("", 3).length <= 3);
    assert.ok(searchCities("a", 5).length <= 5);
  });
});
