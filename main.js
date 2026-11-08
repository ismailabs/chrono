/*
Chrono (chrono-clock) - bundled by esbuild.
Editable TypeScript source lives in the src/ folder of this plugin.
*/
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ChronoPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian4 = require("obsidian");

// src/timeZones.ts
var CURATED = [
  ["New York", "United States", "America/New_York"],
  ["Chicago", "United States", "America/Chicago"],
  ["Denver", "United States", "America/Denver"],
  ["Los Angeles", "United States", "America/Los_Angeles"],
  ["Phoenix", "United States", "America/Phoenix"],
  ["Anchorage", "United States", "America/Anchorage"],
  ["Honolulu", "United States", "Pacific/Honolulu"],
  ["Toronto", "Canada", "America/Toronto"],
  ["Vancouver", "Canada", "America/Vancouver"],
  ["Mexico City", "Mexico", "America/Mexico_City"],
  ["Sao Paulo", "Brazil", "America/Sao_Paulo"],
  ["Buenos Aires", "Argentina", "America/Argentina/Buenos_Aires"],
  ["Santiago", "Chile", "America/Santiago"],
  ["Bogota", "Colombia", "America/Bogota"],
  ["Lima", "Peru", "America/Lima"],
  ["London", "United Kingdom", "Europe/London"],
  ["Dublin", "Ireland", "Europe/Dublin"],
  ["Lisbon", "Portugal", "Europe/Lisbon"],
  ["Paris", "France", "Europe/Paris"],
  ["Berlin", "Germany", "Europe/Berlin"],
  ["Madrid", "Spain", "Europe/Madrid"],
  ["Rome", "Italy", "Europe/Rome"],
  ["Amsterdam", "Netherlands", "Europe/Amsterdam"],
  ["Brussels", "Belgium", "Europe/Brussels"],
  ["Zurich", "Switzerland", "Europe/Zurich"],
  ["Vienna", "Austria", "Europe/Vienna"],
  ["Stockholm", "Sweden", "Europe/Stockholm"],
  ["Oslo", "Norway", "Europe/Oslo"],
  ["Copenhagen", "Denmark", "Europe/Copenhagen"],
  ["Helsinki", "Finland", "Europe/Helsinki"],
  ["Warsaw", "Poland", "Europe/Warsaw"],
  ["Prague", "Czechia", "Europe/Prague"],
  ["Athens", "Greece", "Europe/Athens"],
  ["Istanbul", "Turkey", "Europe/Istanbul"],
  ["Moscow", "Russia", "Europe/Moscow"],
  ["Reykjavik", "Iceland", "Atlantic/Reykjavik"],
  ["Cairo", "Egypt", "Africa/Cairo"],
  ["Johannesburg", "South Africa", "Africa/Johannesburg"],
  ["Lagos", "Nigeria", "Africa/Lagos"],
  ["Nairobi", "Kenya", "Africa/Nairobi"],
  ["Casablanca", "Morocco", "Africa/Casablanca"],
  ["Dubai", "United Arab Emirates", "Asia/Dubai"],
  ["Riyadh", "Saudi Arabia", "Asia/Riyadh"],
  ["Tel Aviv", "Israel", "Asia/Jerusalem"],
  ["Tehran", "Iran", "Asia/Tehran"],
  ["Karachi", "Pakistan", "Asia/Karachi"],
  ["Mumbai", "India", "Asia/Kolkata"],
  ["Kathmandu", "Nepal", "Asia/Kathmandu"],
  ["Dhaka", "Bangladesh", "Asia/Dhaka"],
  ["Bangkok", "Thailand", "Asia/Bangkok"],
  ["Jakarta", "Indonesia", "Asia/Jakarta"],
  ["Singapore", "Singapore", "Asia/Singapore"],
  ["Kuala Lumpur", "Malaysia", "Asia/Kuala_Lumpur"],
  ["Hong Kong", "Hong Kong", "Asia/Hong_Kong"],
  ["Shanghai", "China", "Asia/Shanghai"],
  ["Taipei", "Taiwan", "Asia/Taipei"],
  ["Manila", "Philippines", "Asia/Manila"],
  ["Seoul", "South Korea", "Asia/Seoul"],
  ["Tokyo", "Japan", "Asia/Tokyo"],
  ["Sydney", "Australia", "Australia/Sydney"],
  ["Melbourne", "Australia", "Australia/Melbourne"],
  ["Brisbane", "Australia", "Australia/Brisbane"],
  ["Perth", "Australia", "Australia/Perth"],
  ["Auckland", "New Zealand", "Pacific/Auckland"],
  ["UTC", "Universal", "UTC"]
];
var CITY_CATALOG = CURATED.map(
  ([name, country, zone]) => ({ name, country, zone })
);
function isValidTimeZone(zone) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
    return true;
  } catch (e) {
    return false;
  }
}
function runtimeTimeZones() {
  var _a, _b;
  const intl = Intl;
  try {
    return (_b = (_a = intl.supportedValuesOf) == null ? void 0 : _a.call(intl, "timeZone")) != null ? _b : [];
  } catch (e) {
    return [];
  }
}
function cityNameForZone(zone) {
  var _a;
  const curated = CITY_CATALOG.find((city) => city.zone === zone);
  if (curated) return curated.name;
  const last = (_a = zone.split("/").pop()) != null ? _a : zone;
  return last.replace(/_/g, " ");
}
function searchCities(query, limit = 40) {
  const needle = query.trim().toLowerCase();
  const matches = (haystack) => haystack.toLowerCase().includes(needle);
  const curated = CITY_CATALOG.filter(
    (city) => {
      var _a;
      return needle === "" || matches(city.name) || matches((_a = city.country) != null ? _a : "") || matches(city.zone);
    }
  );
  if (needle === "") return curated.slice(0, limit);
  const curatedZones = new Set(CITY_CATALOG.map((city) => city.zone));
  const iana = runtimeTimeZones().filter((zone) => !curatedZones.has(zone) && matches(zone)).map((zone) => ({ name: cityNameForZone(zone), zone }));
  return [...curated, ...iana].slice(0, limit);
}

// src/zoneReader.ts
var MS_PER_DAY = 864e5;
function makeFormat(options) {
  try {
    return new Intl.DateTimeFormat(void 0, options);
  } catch (error) {
    console.error("Chrono: unable to create a date formatter.", error);
    return new Intl.DateTimeFormat("en-US", { timeZone: "UTC" });
  }
}
function readParts(format, date) {
  const parts = {};
  for (const part of format.formatToParts(date)) parts[part.type] = part.value;
  return parts;
}
function formatUtcOffset(longOffset) {
  const match = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/.exec(longOffset.trim());
  if (!match) return "UTC";
  const [, sign, hours, minutes] = match;
  const suffix = minutes && minutes !== "00" ? `:${minutes}` : "";
  return `UTC${sign === "-" ? "\u2212" : "+"}${Number(hours)}${suffix}`;
}
function relativeDay(zoneDay, localDay) {
  const diff = zoneDay - localDay;
  if (diff > 0) return 1;
  if (diff < 0) return -1;
  return 0;
}
var ZoneReader = class {
  constructor(options) {
    const { timeZone, hour12, dateStyle } = options;
    this.hour12 = hour12;
    this.timeFormat = makeFormat({
      timeZone,
      hour: hour12 ? "numeric" : "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: hour12 ? "h12" : "h23"
    });
    this.weekdayFormat = makeFormat({ timeZone, weekday: "long" });
    this.dateFormat = makeFormat({
      timeZone,
      ...dateStyle === "long" ? { day: "numeric", month: "long", year: "numeric" } : { day: "numeric", month: "short" }
    });
    this.fullFormat = makeFormat({ timeZone, dateStyle: "full" });
    this.dayFormat = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric"
    });
    this.offsetFormat = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset"
    });
  }
  read(now) {
    var _a, _b, _c, _d, _e;
    const time = readParts(this.timeFormat, now);
    const day = readParts(this.dayFormat, now);
    const offset = (_a = readParts(this.offsetFormat, now).timeZoneName) != null ? _a : "";
    const dayNumber = Date.UTC(Number(day.year), Number(day.month) - 1, Number(day.day)) / MS_PER_DAY;
    return {
      hour: (_b = time.hour) != null ? _b : "",
      minute: (_c = time.minute) != null ? _c : "",
      second: (_d = time.second) != null ? _d : "",
      period: this.hour12 ? (_e = time.dayPeriod) != null ? _e : "" : "",
      weekday: this.weekdayFormat.format(now),
      date: this.dateFormat.format(now),
      fullDate: this.fullFormat.format(now),
      offset: formatUtcOffset(offset),
      dayNumber
    };
  }
};

// src/clock.ts
function localZoneName() {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return zone ? cityNameForZone(zone) : "Local time";
  } catch (e) {
    return "Local time";
  }
}
function dayProgress(now) {
  const seconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1e3;
  return seconds / 86400;
}
var ClockFormatter = class {
  constructor(settings) {
    this.settings = settings;
    this.cache = null;
    const hour12 = settings.hourFormat === "12";
    const dateStyle = settings.dateStyle;
    this.localReader = new ZoneReader({ hour12, dateStyle });
    this.worldReaders = settings.worldClocks.map(({ zone, name }) => ({
      zone,
      name,
      reader: new ZoneReader({ timeZone: zone, hour12, dateStyle })
    }));
  }
  snapshot(now = /* @__PURE__ */ new Date()) {
    const key = Math.floor(now.getTime() / 1e3);
    if (!this.cache || this.cache.key !== key) {
      this.cache = { key, base: this.build(now) };
    }
    return { ...this.cache.base, dayProgress: dayProgress(now) };
  }
  build(now) {
    const local = this.localReader.read(now);
    const core = `${local.hour}:${local.minute}`;
    const period = local.period ? ` ${local.period}` : "";
    const worlds = this.settings.showWorldClocks ? this.worldReaders.map(({ zone, name, reader }) => {
      const reading = reader.read(now);
      return {
        ...reading,
        zone,
        name,
        dayOffset: relativeDay(reading.dayNumber, local.dayNumber)
      };
    }) : [];
    return {
      local: { ...local, zoneName: localZoneName() },
      worlds,
      statusText: this.settings.showSeconds ? `${core}:${local.second}${period}` : `${core}${period}`,
      label: `${core}${period}, ${local.fullDate}`
    };
  }
};
var ClockEngine = class {
  constructor(settings) {
    this.listeners = /* @__PURE__ */ new Set();
    this.formatter = new ClockFormatter(settings);
  }
  configure(settings) {
    this.formatter = new ClockFormatter(settings);
  }
  /** Fresh snapshot without notifying anyone. */
  snapshot(now = /* @__PURE__ */ new Date()) {
    return this.formatter.snapshot(now);
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  tick() {
    if (this.listeners.size === 0) return;
    let snapshot;
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
  clear() {
    this.listeners.clear();
  }
};

// src/constants.ts
var VIEW_TYPE_CHRONO = "chrono-clock-view";
var TICK_INTERVAL_MS = 250;
var MAX_WORLD_CLOCKS = 12;

// src/settings.ts
var SETTINGS_VERSION = 2;
function detectDeviceHourFormat() {
  try {
    const cycle = new Intl.DateTimeFormat(void 0, {
      hour: "numeric"
    }).resolvedOptions().hourCycle;
    return cycle === "h23" || cycle === "h24" ? "24" : "12";
  } catch (e) {
    return "24";
  }
}
function getDefaultSettings() {
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
    showStatusBar: false
  };
}
function sanitizeWorldClocks(value) {
  if (!Array.isArray(value)) return [];
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null) continue;
    const { zone, name } = item;
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
function sanitizeSettings(raw) {
  const defaults = getDefaultSettings();
  if (typeof raw !== "object" || raw === null) return defaults;
  const r = raw;
  const bool = (value, fallback) => typeof value === "boolean" ? value : fallback;
  const progressSource = "showProgress" in r ? r.showProgress : r.showBars;
  return {
    hourFormat: r.hourFormat === "12" || r.hourFormat === "24" ? r.hourFormat : defaults.hourFormat,
    showSeconds: bool(r.showSeconds, defaults.showSeconds),
    showDate: bool(r.showDate, defaults.showDate),
    dateStyle: r.dateStyle === "long" || r.dateStyle === "short" ? r.dateStyle : defaults.dateStyle,
    showTimezone: bool(r.showTimezone, defaults.showTimezone),
    showProgress: bool(progressSource, defaults.showProgress),
    density: r.density === "comfortable" || r.density === "compact" ? r.density : defaults.density,
    showWorldClocks: bool(r.showWorldClocks, defaults.showWorldClocks),
    worldClocks: sanitizeWorldClocks(r.worldClocks),
    showStatusBar: bool(r.showStatusBar, defaults.showStatusBar)
  };
}
function toStoredSettings(settings) {
  return { schemaVersion: SETTINGS_VERSION, ...settings };
}

// src/settingsTab.ts
var import_obsidian = require("obsidian");
var ChronoSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, chrono) {
    super(app, chrono);
    this.chrono = chrono;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    const settings = this.chrono.settings;
    new import_obsidian.Setting(containerEl).setName("Clock").setHeading();
    new import_obsidian.Setting(containerEl).setName("Hour format").setDesc("Show the time in 12-hour or 24-hour notation.").addDropdown(
      (dropdown) => dropdown.addOption("12", "12-hour").addOption("24", "24-hour").setValue(settings.hourFormat).onChange(async (value) => {
        await this.chrono.updateSettings({
          hourFormat: value === "24" ? "24" : "12"
        });
      })
    );
    new import_obsidian.Setting(containerEl).setName("Show seconds").setDesc("Display seconds on your clock and on world clocks.").addToggle(
      (toggle) => toggle.setValue(settings.showSeconds).onChange(async (value) => {
        await this.chrono.updateSettings({ showSeconds: value });
      })
    );
    new import_obsidian.Setting(containerEl).setName("Show date").setDesc("Display the weekday and date below your clock.").addToggle(
      (toggle) => toggle.setValue(settings.showDate).onChange(async (value) => {
        await this.chrono.updateSettings({ showDate: value });
      })
    );
    new import_obsidian.Setting(containerEl).setName("Date style").setDesc("Long includes the year. Short is more compact.").addDropdown(
      (dropdown) => dropdown.addOption("long", "Long").addOption("short", "Short").setValue(settings.dateStyle).onChange(async (value) => {
        await this.chrono.updateSettings({
          dateStyle: value === "short" ? "short" : "long"
        });
      })
    );
    new import_obsidian.Setting(containerEl).setName("Show time zone").setDesc("Display your time zone name and UTC offset under your clock.").addToggle(
      (toggle) => toggle.setValue(settings.showTimezone).onChange(async (value) => {
        await this.chrono.updateSettings({ showTimezone: value });
      })
    );
    new import_obsidian.Setting(containerEl).setName("Show day progress").setDesc("A thin line showing how much of the day has passed.").addToggle(
      (toggle) => toggle.setValue(settings.showProgress).onChange(async (value) => {
        await this.chrono.updateSettings({ showProgress: value });
      })
    );
    new import_obsidian.Setting(containerEl).setName("Density").setDesc("Compact reduces spacing and suits narrow sidebars.").addDropdown(
      (dropdown) => dropdown.addOption("comfortable", "Comfortable").addOption("compact", "Compact").setValue(settings.density).onChange(async (value) => {
        await this.chrono.updateSettings({
          density: value === "compact" ? "compact" : "comfortable"
        });
      })
    );
    new import_obsidian.Setting(containerEl).setName("World clocks").setHeading();
    new import_obsidian.Setting(containerEl).setName("Show world clocks").setDesc(
      "Show the list of saved cities in the clock view. Add and arrange cities from the clock view itself."
    ).addToggle(
      (toggle) => toggle.setValue(settings.showWorldClocks).onChange(async (value) => {
        await this.chrono.updateSettings({ showWorldClocks: value });
      })
    );
    new import_obsidian.Setting(containerEl).setName("Status bar").setHeading();
    new import_obsidian.Setting(containerEl).setName("Show clock in status bar").setDesc(
      import_obsidian.Platform.isMobile ? "The status bar is not available on mobile." : "Keep a small clock in the status bar. Select it to open the clock view."
    ).addToggle(
      (toggle) => toggle.setValue(settings.showStatusBar).setDisabled(import_obsidian.Platform.isMobile).onChange(async (value) => {
        await this.chrono.updateSettings({ showStatusBar: value });
      })
    );
    new import_obsidian.Setting(containerEl).setName("Defaults").setHeading();
    new import_obsidian.Setting(containerEl).setName("Restore defaults").setDesc("Resets every option on this page. Your saved world clocks are kept.").addButton(
      (button) => button.setButtonText("Restore defaults").onClick(async () => {
        await this.chrono.updateSettings({
          ...getDefaultSettings(),
          worldClocks: this.chrono.settings.worldClocks
        });
        this.display();
      })
    );
  }
};

// src/statusBar.ts
var StatusBarClock = class {
  constructor(chrono) {
    this.chrono = chrono;
    this.unsubscribe = null;
    this.lastText = "";
    this.lastLabel = "";
    this.el = chrono.addStatusBarItem();
    this.el.addClass("chrono-statusbar");
    this.el.setAttr("role", "button");
    this.el.setAttr("tabindex", "0");
    this.el.setAttr("data-tooltip-position", "top");
    chrono.registerDomEvent(this.el, "click", () => {
      void chrono.activateView();
    });
    chrono.registerDomEvent(this.el, "keydown", (evt) => {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        void chrono.activateView();
      }
    });
    this.applySettings();
  }
  /** Shows or hides the item, and only subscribes to ticks while visible. */
  applySettings() {
    var _a;
    const visible = this.chrono.settings.showStatusBar;
    this.el.toggleClass("chrono-is-hidden", !visible);
    if (visible) {
      this.render(this.chrono.engine.snapshot());
      if (!this.unsubscribe) {
        this.unsubscribe = this.chrono.engine.subscribe(
          (snapshot) => this.render(snapshot)
        );
      }
    } else {
      (_a = this.unsubscribe) == null ? void 0 : _a.call(this);
      this.unsubscribe = null;
    }
  }
  destroy() {
    var _a;
    (_a = this.unsubscribe) == null ? void 0 : _a.call(this);
    this.unsubscribe = null;
  }
  render(snapshot) {
    if (snapshot.statusText !== this.lastText) {
      this.el.setText(snapshot.statusText);
      this.lastText = snapshot.statusText;
    }
    if (snapshot.label !== this.lastLabel) {
      this.el.setAttr("aria-label", snapshot.label);
      this.lastLabel = snapshot.label;
    }
  }
};

// src/view.ts
var import_obsidian3 = require("obsidian");

// src/cityPicker.ts
var import_obsidian2 = require("obsidian");
var CityPickerModal = class extends import_obsidian2.Modal {
  constructor(app, taken, onPick) {
    super(app);
    this.taken = taken;
    this.onPick = onPick;
  }
  onOpen() {
    const { contentEl } = this;
    this.setTitle("Add a city");
    contentEl.addClass("chrono-picker");
    const input = contentEl.createEl("input", {
      cls: "chrono-picker-input",
      attr: {
        type: "search",
        placeholder: "City, country or time zone",
        "aria-label": "Search cities and time zones"
      }
    });
    const results = contentEl.createEl("ul", {
      cls: "chrono-picker-results",
      attr: { "aria-label": "Matching cities" }
    });
    const hint = contentEl.createDiv({ cls: "chrono-picker-hint" });
    const render = () => {
      results.empty();
      const matches = searchCities(input.value);
      hint.setText(
        matches.length === 0 ? "No matches. Try a city name or a time zone such as Europe/Paris." : ""
      );
      for (const city of matches) {
        const item = results.createEl("li");
        const isTaken = this.taken.has(city.zone);
        const button = item.createEl("button", {
          cls: "chrono-picker-option",
          attr: { type: "button" }
        });
        const text = button.createDiv({ cls: "chrono-picker-text" });
        text.createSpan({ cls: "chrono-picker-name", text: city.name });
        text.createSpan({
          cls: "chrono-picker-detail",
          text: city.country ? `${city.country} \xB7 ${city.zone}` : city.zone
        });
        if (isTaken) {
          button.disabled = true;
          button.createSpan({ cls: "chrono-picker-added", text: "Added" });
        } else {
          button.addEventListener("click", () => {
            this.close();
            this.onPick(city);
          });
        }
      }
    };
    this.registerDomEvent(input, "input", render);
    this.registerDomEvent(input, "keydown", (evt) => {
      var _a;
      if (evt.key === "ArrowDown") {
        evt.preventDefault();
        (_a = this.enabledOptions(results)[0]) == null ? void 0 : _a.focus();
      }
    });
    this.registerDomEvent(results, "keydown", (evt) => {
      if (evt.key !== "ArrowDown" && evt.key !== "ArrowUp") return;
      const options = this.enabledOptions(results);
      const index = options.indexOf(document.activeElement);
      if (index < 0) return;
      evt.preventDefault();
      const step = evt.key === "ArrowDown" ? 1 : -1;
      const next = options[index + step];
      if (next) next.focus();
      else if (step < 0) input.focus();
    });
    render();
    input.focus();
  }
  enabledOptions(list) {
    return Array.from(
      list.querySelectorAll("button.chrono-picker-option:not(:disabled)")
    );
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/worldClockList.ts
function hasWorldClock(list, zone) {
  return list.some((entry) => entry.zone === zone);
}
function addWorldClock(list, entry) {
  if (hasWorldClock(list, entry.zone) || list.length >= MAX_WORLD_CLOCKS) {
    return [...list];
  }
  return [...list, entry];
}
function removeWorldClock(list, zone) {
  return list.filter((entry) => entry.zone !== zone);
}
function moveWorldClock(list, zone, direction) {
  const index = list.findIndex((entry) => entry.zone === zone);
  const target = index + direction;
  const next = [...list];
  if (index < 0 || target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

// src/view.ts
function writeText(el, value) {
  if (el.textContent !== value) el.textContent = value;
}
var ROW_ACTIONS = [
  { action: "up", icon: "chevron-up", label: "Move up" },
  { action: "down", icon: "chevron-down", label: "Move down" },
  { action: "remove", icon: "x", label: "Remove" }
];
var ChronoView = class extends import_obsidian3.ItemView {
  constructor(leaf, chrono) {
    super(leaf);
    this.chrono = chrono;
    this.els = null;
    this.rows = /* @__PURE__ */ new Map();
    this.rowKey = "";
    this.unsubscribe = null;
    this.lastLabel = "";
  }
  getViewType() {
    return VIEW_TYPE_CHRONO;
  }
  getDisplayText() {
    return "Chrono";
  }
  getIcon() {
    return "clock";
  }
  async onOpen() {
    this.contentEl.empty();
    this.contentEl.addClass("chrono-root");
    this.els = this.build(this.contentEl.createDiv({ cls: "chrono-view" }));
    this.applySettings();
    this.unsubscribe = this.chrono.engine.subscribe((snapshot) => {
      if (this.containerEl.isShown()) this.render(snapshot);
    });
  }
  async onClose() {
    var _a;
    (_a = this.unsubscribe) == null ? void 0 : _a.call(this);
    this.unsubscribe = null;
    this.rows.clear();
    this.rowKey = "";
    this.lastLabel = "";
    this.els = null;
    this.contentEl.empty();
  }
  /** Syncs layout with the current settings, then redraws. */
  applySettings() {
    const e = this.els;
    if (!e) return;
    const settings = this.chrono.settings;
    e.root.toggleClass("is-compact", settings.density === "compact");
    e.local.clock.setAttr("data-seconds", String(settings.showSeconds));
    e.local.seconds.toggleClass("chrono-is-hidden", !settings.showSeconds);
    e.local.zone.toggleClass("chrono-is-hidden", !settings.showTimezone);
    e.local.progress.toggleClass("chrono-is-hidden", !settings.showProgress);
    e.local.date.toggleClass("chrono-is-hidden", !settings.showDate);
    e.worldSection.toggleClass("chrono-is-hidden", !settings.showWorldClocks);
    this.syncWorldRows();
    this.render(this.chrono.engine.snapshot());
  }
  render(snapshot) {
    const e = this.els;
    if (!e) return;
    const settings = this.chrono.settings;
    const local = snapshot.local;
    writeText(e.local.hour, local.hour);
    writeText(e.local.minute, local.minute);
    writeText(e.local.second, local.second);
    writeText(e.local.period, local.period);
    e.local.period.toggleClass("chrono-is-hidden", local.period === "");
    writeText(e.local.zoneName, local.zoneName);
    writeText(e.local.zoneOffset, local.offset);
    writeText(e.local.weekday, local.weekday);
    writeText(e.local.datetext, local.date);
    e.local.progressFill.setCssProps({
      "--chrono-progress": snapshot.dayProgress.toFixed(5)
    });
    if (snapshot.label !== this.lastLabel) {
      e.local.clock.setAttr("aria-label", snapshot.label);
      this.lastLabel = snapshot.label;
    }
    for (const world of snapshot.worlds) {
      const row = this.rows.get(world.zone);
      if (row) this.renderWorld(row, world, settings.showSeconds);
    }
  }
  renderWorld(row, world, showSeconds) {
    const core = `${world.hour}:${world.minute}`;
    writeText(row.time, showSeconds ? `${core}:${world.second}` : core);
    writeText(row.period, world.period);
    row.period.toggleClass("chrono-is-hidden", world.period === "");
    const dayWord = world.dayOffset === 1 ? "Tomorrow" : world.dayOffset === -1 ? "Yesterday" : "";
    writeText(row.day, dayWord);
    row.day.toggleClass("chrono-is-hidden", dayWord === "");
    writeText(row.meta, `${world.weekday}, ${world.date} \xB7 ${world.offset}`);
  }
  /** Rebuilds the list only when the set or order of saved zones changes. */
  syncWorldRows() {
    const e = this.els;
    if (!e) return;
    const worlds = this.chrono.settings.worldClocks;
    const key = worlds.map((world) => world.zone).join("|");
    if (key === this.rowKey) return;
    this.rowKey = key;
    e.worldList.empty();
    this.rows.clear();
    for (const world of worlds) {
      this.rows.set(world.zone, this.buildRow(e.worldList, world));
    }
    e.empty.toggleClass("chrono-is-hidden", worlds.length > 0);
    e.worldList.toggleClass("chrono-is-hidden", worlds.length === 0);
    e.addButton.toggleClass("chrono-is-hidden", worlds.length === 0);
  }
  buildRow(list, world) {
    const row = list.createEl("li", { cls: "chrono-world-row" });
    const info = row.createDiv({ cls: "chrono-world-info" });
    const nameLine = info.createDiv({ cls: "chrono-world-name" });
    nameLine.createSpan({ cls: "chrono-world-title", text: world.name });
    const day = nameLine.createSpan({ cls: ["chrono-world-day", "chrono-is-hidden"] });
    const meta = info.createDiv({ cls: "chrono-world-meta" });
    const time = row.createDiv({ cls: "chrono-world-time" });
    const timeText = time.createSpan({ cls: "chrono-world-clock" });
    const period = time.createSpan({ cls: "chrono-world-period" });
    const actions = row.createDiv({ cls: "chrono-world-actions" });
    const buttons = {};
    for (const { action, icon, label } of ROW_ACTIONS) {
      const button = actions.createEl("button", {
        cls: "chrono-icon-button",
        attr: { type: "button", "aria-label": `${label} ${world.name}` }
      });
      (0, import_obsidian3.setIcon)(button, icon);
      button.addEventListener("click", () => {
        void this.handleRowAction(world.zone, action);
      });
      buttons[action] = button;
    }
    return {
      row,
      time: timeText,
      period,
      day,
      meta,
      buttons
    };
  }
  async handleRowAction(zone, action) {
    const list = this.chrono.settings.worldClocks;
    const next = action === "remove" ? removeWorldClock(list, zone) : moveWorldClock(list, zone, action === "up" ? -1 : 1);
    await this.chrono.updateSettings({ worldClocks: next });
    this.focusAfterAction(zone, action);
  }
  /** Keeps keyboard focus on a sensible control after the list is redrawn. */
  focusAfterAction(zone, action) {
    const e = this.els;
    if (!e) return;
    const row = this.rows.get(zone);
    if (action !== "remove" && row) {
      row.buttons[action].focus();
      return;
    }
    const hasWorlds = this.chrono.settings.worldClocks.length > 0;
    (hasWorlds ? e.addButton : e.emptyAdd).focus();
  }
  addCity(city) {
    const list = this.chrono.settings.worldClocks;
    if (list.length >= MAX_WORLD_CLOCKS) {
      new import_obsidian3.Notice(`You can save up to ${MAX_WORLD_CLOCKS} world clocks.`);
      return;
    }
    const next = addWorldClock(list, { zone: city.zone, name: city.name });
    void this.chrono.updateSettings({ worldClocks: next });
  }
  openPicker() {
    const taken = new Set(this.chrono.settings.worldClocks.map((w) => w.zone));
    new CityPickerModal(this.app, taken, (city) => this.addCity(city)).open();
  }
  build(root) {
    const local = root.createDiv({ cls: "chrono-local" });
    const zone = local.createDiv({ cls: "chrono-local-zone" });
    const zoneName = zone.createSpan({ cls: "chrono-zone-name" });
    zone.createSpan({ cls: "chrono-zone-sep", text: "\xB7", attr: { "aria-hidden": "true" } });
    const zoneOffset = zone.createSpan({ cls: "chrono-zone-offset" });
    const clock = local.createDiv({
      cls: "chrono-clock",
      attr: { role: "timer" }
    });
    const digits = clock.createDiv({
      cls: "chrono-digits",
      attr: { "aria-hidden": "true" }
    });
    const hour = digits.createSpan({ cls: "chrono-hour" });
    digits.createSpan({ cls: "chrono-colon", text: ":" });
    const minute = digits.createSpan({ cls: "chrono-minute" });
    const seconds = digits.createSpan({ cls: "chrono-seconds" });
    seconds.createSpan({ cls: "chrono-colon", text: ":" });
    const second = seconds.createSpan({ cls: "chrono-second" });
    const period = clock.createSpan({
      cls: "chrono-period",
      attr: { "aria-hidden": "true" }
    });
    const progress = local.createDiv({
      cls: "chrono-progress",
      attr: { "aria-hidden": "true" }
    });
    const progressFill = progress.createDiv({ cls: "chrono-progress-fill" });
    const date = local.createDiv({
      cls: "chrono-date",
      attr: { "aria-hidden": "true" }
    });
    const weekday = date.createDiv({ cls: "chrono-weekday" });
    const datetext = date.createDiv({ cls: "chrono-datetext" });
    const worldSection = root.createDiv({ cls: "chrono-world" });
    const head = worldSection.createDiv({ cls: "chrono-world-head" });
    head.createDiv({ cls: "chrono-section-title", text: "World clocks" });
    const addButton = head.createEl("button", {
      cls: "chrono-icon-button",
      attr: { type: "button", "aria-label": "Add a world clock" }
    });
    (0, import_obsidian3.setIcon)(addButton, "plus");
    this.registerDomEvent(addButton, "click", () => this.openPicker());
    const worldList = worldSection.createEl("ul", {
      cls: "chrono-world-list",
      attr: { "aria-label": "World clocks" }
    });
    const empty = worldSection.createDiv({ cls: "chrono-empty" });
    (0, import_obsidian3.setIcon)(empty.createDiv({ cls: "chrono-empty-icon" }), "globe");
    empty.createDiv({ cls: "chrono-empty-title", text: "No world clocks yet" });
    empty.createDiv({
      cls: "chrono-empty-text",
      text: "Add a city or time zone to see its time, day and offset next to yours."
    });
    const emptyAdd = empty.createEl("button", {
      cls: "chrono-button",
      text: "Add a city",
      attr: { type: "button" }
    });
    this.registerDomEvent(emptyAdd, "click", () => this.openPicker());
    return {
      root,
      local: {
        zone,
        zoneName,
        zoneOffset,
        clock,
        hour,
        minute,
        seconds,
        second,
        period,
        progress,
        progressFill,
        date,
        weekday,
        datetext
      },
      worldSection,
      addButton,
      worldList,
      empty,
      emptyAdd
    };
  }
};

// src/main.ts
var ChronoPlugin = class extends import_obsidian4.Plugin {
  constructor() {
    super(...arguments);
    this.settings = getDefaultSettings();
    this.statusBar = null;
  }
  async onload() {
    await this.loadSettings();
    this.engine = new ClockEngine(this.settings);
    this.registerView(VIEW_TYPE_CHRONO, (leaf) => new ChronoView(leaf, this));
    this.addRibbonIcon("clock", "Open Chrono", () => {
      void this.activateView();
    });
    this.addCommand({
      id: "open-clock",
      name: "Open clock",
      callback: () => {
        void this.activateView();
      }
    });
    this.addCommand({
      id: "toggle-hour-format",
      name: "Toggle 24-hour format",
      callback: () => {
        void this.updateSettings({
          hourFormat: this.settings.hourFormat === "24" ? "12" : "24"
        });
      }
    });
    this.addCommand({
      id: "toggle-status-bar",
      name: "Toggle status bar clock",
      callback: () => {
        void this.updateSettings({
          showStatusBar: !this.settings.showStatusBar
        });
      }
    });
    this.addSettingTab(new ChronoSettingTab(this.app, this));
    if (!import_obsidian4.Platform.isMobile) this.statusBar = new StatusBarClock(this);
    this.registerInterval(
      window.setInterval(() => this.engine.tick(), TICK_INTERVAL_MS)
    );
  }
  onunload() {
    var _a, _b;
    (_a = this.statusBar) == null ? void 0 : _a.destroy();
    this.statusBar = null;
    (_b = this.engine) == null ? void 0 : _b.clear();
  }
  /** Reveals the clock in the right sidebar, creating it if needed. */
  async activateView() {
    var _a;
    try {
      const { workspace } = this.app;
      let leaf = (_a = workspace.getLeavesOfType(VIEW_TYPE_CHRONO)[0]) != null ? _a : null;
      if (!leaf) {
        leaf = workspace.getRightLeaf(false);
        if (!leaf) {
          new import_obsidian4.Notice("Chrono could not find a sidebar to open in.");
          return;
        }
        await leaf.setViewState({ type: VIEW_TYPE_CHRONO, active: true });
      }
      await workspace.revealLeaf(leaf);
    } catch (error) {
      console.error("Chrono: failed to open the clock view.", error);
      new import_obsidian4.Notice("Chrono could not open the clock. See the console for details.");
    }
  }
  /** Applies a settings change immediately, then persists it. */
  async updateSettings(patch) {
    this.settings = sanitizeSettings({ ...this.settings, ...patch });
    this.engine.configure(this.settings);
    this.refreshAll();
    try {
      await this.saveData(toStoredSettings(this.settings));
    } catch (error) {
      console.error("Chrono: failed to save settings.", error);
      new import_obsidian4.Notice("Chrono could not save your preferences.");
    }
  }
  async loadSettings() {
    try {
      this.settings = sanitizeSettings(await this.loadData());
    } catch (error) {
      console.error("Chrono: failed to load settings, using defaults.", error);
      this.settings = getDefaultSettings();
    }
  }
  refreshAll() {
    var _a;
    for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_CHRONO)) {
      if (leaf.view instanceof ChronoView) leaf.view.applySettings();
    }
    (_a = this.statusBar) == null ? void 0 : _a.applySettings();
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL3RpbWVab25lcy50cyIsICJzcmMvem9uZVJlYWRlci50cyIsICJzcmMvY2xvY2sudHMiLCAic3JjL2NvbnN0YW50cy50cyIsICJzcmMvc2V0dGluZ3MudHMiLCAic3JjL3NldHRpbmdzVGFiLnRzIiwgInNyYy9zdGF0dXNCYXIudHMiLCAic3JjL3ZpZXcudHMiLCAic3JjL2NpdHlQaWNrZXIudHMiLCAic3JjL3dvcmxkQ2xvY2tMaXN0LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBOb3RpY2UsIFBsYXRmb3JtLCBQbHVnaW4sIFdvcmtzcGFjZUxlYWYgfSBmcm9tIFwib2JzaWRpYW5cIjtcbmltcG9ydCB7IENsb2NrRW5naW5lIH0gZnJvbSBcIi4vY2xvY2tcIjtcbmltcG9ydCB7IFRJQ0tfSU5URVJWQUxfTVMsIFZJRVdfVFlQRV9DSFJPTk8gfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7XG4gIENocm9ub1NldHRpbmdzLFxuICBnZXREZWZhdWx0U2V0dGluZ3MsXG4gIHNhbml0aXplU2V0dGluZ3MsXG4gIHRvU3RvcmVkU2V0dGluZ3MsXG59IGZyb20gXCIuL3NldHRpbmdzXCI7XG5pbXBvcnQgeyBDaHJvbm9TZXR0aW5nVGFiIH0gZnJvbSBcIi4vc2V0dGluZ3NUYWJcIjtcbmltcG9ydCB7IFN0YXR1c0JhckNsb2NrIH0gZnJvbSBcIi4vc3RhdHVzQmFyXCI7XG5pbXBvcnQgeyBDaHJvbm9WaWV3IH0gZnJvbSBcIi4vdmlld1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDaHJvbm9QbHVnaW4gZXh0ZW5kcyBQbHVnaW4ge1xuICBzZXR0aW5nczogQ2hyb25vU2V0dGluZ3MgPSBnZXREZWZhdWx0U2V0dGluZ3MoKTtcbiAgZW5naW5lITogQ2xvY2tFbmdpbmU7XG4gIHByaXZhdGUgc3RhdHVzQmFyOiBTdGF0dXNCYXJDbG9jayB8IG51bGwgPSBudWxsO1xuXG4gIGFzeW5jIG9ubG9hZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xuICAgIHRoaXMuZW5naW5lID0gbmV3IENsb2NrRW5naW5lKHRoaXMuc2V0dGluZ3MpO1xuXG4gICAgdGhpcy5yZWdpc3RlclZpZXcoVklFV19UWVBFX0NIUk9OTywgKGxlYWYpID0+IG5ldyBDaHJvbm9WaWV3KGxlYWYsIHRoaXMpKTtcblxuICAgIHRoaXMuYWRkUmliYm9uSWNvbihcImNsb2NrXCIsIFwiT3BlbiBDaHJvbm9cIiwgKCkgPT4ge1xuICAgICAgdm9pZCB0aGlzLmFjdGl2YXRlVmlldygpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiBcIm9wZW4tY2xvY2tcIixcbiAgICAgIG5hbWU6IFwiT3BlbiBjbG9ja1wiLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgdm9pZCB0aGlzLmFjdGl2YXRlVmlldygpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6IFwidG9nZ2xlLWhvdXItZm9ybWF0XCIsXG4gICAgICBuYW1lOiBcIlRvZ2dsZSAyNC1ob3VyIGZvcm1hdFwiLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgdm9pZCB0aGlzLnVwZGF0ZVNldHRpbmdzKHtcbiAgICAgICAgICBob3VyRm9ybWF0OiB0aGlzLnNldHRpbmdzLmhvdXJGb3JtYXQgPT09IFwiMjRcIiA/IFwiMTJcIiA6IFwiMjRcIixcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgIH0pO1xuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogXCJ0b2dnbGUtc3RhdHVzLWJhclwiLFxuICAgICAgbmFtZTogXCJUb2dnbGUgc3RhdHVzIGJhciBjbG9ja1wiLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHtcbiAgICAgICAgdm9pZCB0aGlzLnVwZGF0ZVNldHRpbmdzKHtcbiAgICAgICAgICBzaG93U3RhdHVzQmFyOiAhdGhpcy5zZXR0aW5ncy5zaG93U3RhdHVzQmFyLFxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IENocm9ub1NldHRpbmdUYWIodGhpcy5hcHAsIHRoaXMpKTtcblxuICAgIC8vIFN0YXR1cyBiYXIgaXRlbXMgZG8gbm90IGV4aXN0IG9uIG1vYmlsZS5cbiAgICBpZiAoIVBsYXRmb3JtLmlzTW9iaWxlKSB0aGlzLnN0YXR1c0JhciA9IG5ldyBTdGF0dXNCYXJDbG9jayh0aGlzKTtcblxuICAgIC8vIE9uZSBzaGFyZWQgdGltZXIuIE9ic2lkaWFuIGNsZWFycyBpdCBhdXRvbWF0aWNhbGx5IG9uIHVubG9hZC5cbiAgICB0aGlzLnJlZ2lzdGVySW50ZXJ2YWwoXG4gICAgICB3aW5kb3cuc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5lbmdpbmUudGljaygpLCBUSUNLX0lOVEVSVkFMX01TKVxuICAgICk7XG4gIH1cblxuICBvbnVubG9hZCgpOiB2b2lkIHtcbiAgICB0aGlzLnN0YXR1c0Jhcj8uZGVzdHJveSgpO1xuICAgIHRoaXMuc3RhdHVzQmFyID0gbnVsbDtcbiAgICB0aGlzLmVuZ2luZT8uY2xlYXIoKTtcbiAgfVxuXG4gIC8qKiBSZXZlYWxzIHRoZSBjbG9jayBpbiB0aGUgcmlnaHQgc2lkZWJhciwgY3JlYXRpbmcgaXQgaWYgbmVlZGVkLiAqL1xuICBhc3luYyBhY3RpdmF0ZVZpZXcoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgd29ya3NwYWNlIH0gPSB0aGlzLmFwcDtcbiAgICAgIGxldCBsZWFmOiBXb3Jrc3BhY2VMZWFmIHwgbnVsbCA9XG4gICAgICAgIHdvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoVklFV19UWVBFX0NIUk9OTylbMF0gPz8gbnVsbDtcblxuICAgICAgaWYgKCFsZWFmKSB7XG4gICAgICAgIGxlYWYgPSB3b3Jrc3BhY2UuZ2V0UmlnaHRMZWFmKGZhbHNlKTtcbiAgICAgICAgaWYgKCFsZWFmKSB7XG4gICAgICAgICAgbmV3IE5vdGljZShcIkNocm9ubyBjb3VsZCBub3QgZmluZCBhIHNpZGViYXIgdG8gb3BlbiBpbi5cIik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGF3YWl0IGxlYWYuc2V0Vmlld1N0YXRlKHsgdHlwZTogVklFV19UWVBFX0NIUk9OTywgYWN0aXZlOiB0cnVlIH0pO1xuICAgICAgfVxuICAgICAgYXdhaXQgd29ya3NwYWNlLnJldmVhbExlYWYobGVhZik7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJDaHJvbm86IGZhaWxlZCB0byBvcGVuIHRoZSBjbG9jayB2aWV3LlwiLCBlcnJvcik7XG4gICAgICBuZXcgTm90aWNlKFwiQ2hyb25vIGNvdWxkIG5vdCBvcGVuIHRoZSBjbG9jay4gU2VlIHRoZSBjb25zb2xlIGZvciBkZXRhaWxzLlwiKTtcbiAgICB9XG4gIH1cblxuICAvKiogQXBwbGllcyBhIHNldHRpbmdzIGNoYW5nZSBpbW1lZGlhdGVseSwgdGhlbiBwZXJzaXN0cyBpdC4gKi9cbiAgYXN5bmMgdXBkYXRlU2V0dGluZ3MocGF0Y2g6IFBhcnRpYWw8Q2hyb25vU2V0dGluZ3M+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5zZXR0aW5ncyA9IHNhbml0aXplU2V0dGluZ3MoeyAuLi50aGlzLnNldHRpbmdzLCAuLi5wYXRjaCB9KTtcbiAgICB0aGlzLmVuZ2luZS5jb25maWd1cmUodGhpcy5zZXR0aW5ncyk7XG4gICAgdGhpcy5yZWZyZXNoQWxsKCk7XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5zYXZlRGF0YSh0b1N0b3JlZFNldHRpbmdzKHRoaXMuc2V0dGluZ3MpKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihcIkNocm9ubzogZmFpbGVkIHRvIHNhdmUgc2V0dGluZ3MuXCIsIGVycm9yKTtcbiAgICAgIG5ldyBOb3RpY2UoXCJDaHJvbm8gY291bGQgbm90IHNhdmUgeW91ciBwcmVmZXJlbmNlcy5cIik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBsb2FkU2V0dGluZ3MoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuc2V0dGluZ3MgPSBzYW5pdGl6ZVNldHRpbmdzKGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJDaHJvbm86IGZhaWxlZCB0byBsb2FkIHNldHRpbmdzLCB1c2luZyBkZWZhdWx0cy5cIiwgZXJyb3IpO1xuICAgICAgdGhpcy5zZXR0aW5ncyA9IGdldERlZmF1bHRTZXR0aW5ncygpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVmcmVzaEFsbCgpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IGxlYWYgb2YgdGhpcy5hcHAud29ya3NwYWNlLmdldExlYXZlc09mVHlwZShWSUVXX1RZUEVfQ0hST05PKSkge1xuICAgICAgLy8gTGVhdmVzIHRoYXQgaGF2ZSBub3QgYmVlbiBsb2FkZWQgeWV0IHBpY2sgdXAgc2V0dGluZ3Mgd2hlbiB0aGV5IG9wZW4uXG4gICAgICBpZiAobGVhZi52aWV3IGluc3RhbmNlb2YgQ2hyb25vVmlldykgbGVhZi52aWV3LmFwcGx5U2V0dGluZ3MoKTtcbiAgICB9XG4gICAgdGhpcy5zdGF0dXNCYXI/LmFwcGx5U2V0dGluZ3MoKTtcbiAgfVxufVxuIiwgIi8qKlxuICogVGltZSB6b25lIGNhdGFsb2cgYW5kIHNlYXJjaC4gUHVyZSBkYXRhIGFuZCBmdW5jdGlvbnMgd2l0aCBubyBPYnNpZGlhblxuICogaW1wb3J0cywgc28gdGhlIGxpc3QgY2FuIGJlIHRlc3RlZCBkaXJlY3RseS5cbiAqL1xuXG5leHBvcnQgaW50ZXJmYWNlIENpdHlPcHRpb24ge1xuICAvKiogTmFtZSBzaG93biB0byB0aGUgdXNlciwgZm9yIGV4YW1wbGUgXCJQYXJpc1wiLiAqL1xuICBuYW1lOiBzdHJpbmc7XG4gIC8qKiBJQU5BIHRpbWUgem9uZSBpZGVudGlmaWVyLCBmb3IgZXhhbXBsZSBcIkV1cm9wZS9QYXJpc1wiLiAqL1xuICB6b25lOiBzdHJpbmc7XG4gIC8qKiBDb3VudHJ5IG9yIHJlZ2lvbiwgZW1wdHkgZm9yIHJhdyBJQU5BIGlkZW50aWZpZXJzLiAqL1xuICBjb3VudHJ5Pzogc3RyaW5nO1xufVxuXG5jb25zdCBDVVJBVEVEOiBbbmFtZTogc3RyaW5nLCBjb3VudHJ5OiBzdHJpbmcsIHpvbmU6IHN0cmluZ11bXSA9IFtcbiAgW1wiTmV3IFlvcmtcIiwgXCJVbml0ZWQgU3RhdGVzXCIsIFwiQW1lcmljYS9OZXdfWW9ya1wiXSxcbiAgW1wiQ2hpY2Fnb1wiLCBcIlVuaXRlZCBTdGF0ZXNcIiwgXCJBbWVyaWNhL0NoaWNhZ29cIl0sXG4gIFtcIkRlbnZlclwiLCBcIlVuaXRlZCBTdGF0ZXNcIiwgXCJBbWVyaWNhL0RlbnZlclwiXSxcbiAgW1wiTG9zIEFuZ2VsZXNcIiwgXCJVbml0ZWQgU3RhdGVzXCIsIFwiQW1lcmljYS9Mb3NfQW5nZWxlc1wiXSxcbiAgW1wiUGhvZW5peFwiLCBcIlVuaXRlZCBTdGF0ZXNcIiwgXCJBbWVyaWNhL1Bob2VuaXhcIl0sXG4gIFtcIkFuY2hvcmFnZVwiLCBcIlVuaXRlZCBTdGF0ZXNcIiwgXCJBbWVyaWNhL0FuY2hvcmFnZVwiXSxcbiAgW1wiSG9ub2x1bHVcIiwgXCJVbml0ZWQgU3RhdGVzXCIsIFwiUGFjaWZpYy9Ib25vbHVsdVwiXSxcbiAgW1wiVG9yb250b1wiLCBcIkNhbmFkYVwiLCBcIkFtZXJpY2EvVG9yb250b1wiXSxcbiAgW1wiVmFuY291dmVyXCIsIFwiQ2FuYWRhXCIsIFwiQW1lcmljYS9WYW5jb3V2ZXJcIl0sXG4gIFtcIk1leGljbyBDaXR5XCIsIFwiTWV4aWNvXCIsIFwiQW1lcmljYS9NZXhpY29fQ2l0eVwiXSxcbiAgW1wiU2FvIFBhdWxvXCIsIFwiQnJhemlsXCIsIFwiQW1lcmljYS9TYW9fUGF1bG9cIl0sXG4gIFtcIkJ1ZW5vcyBBaXJlc1wiLCBcIkFyZ2VudGluYVwiLCBcIkFtZXJpY2EvQXJnZW50aW5hL0J1ZW5vc19BaXJlc1wiXSxcbiAgW1wiU2FudGlhZ29cIiwgXCJDaGlsZVwiLCBcIkFtZXJpY2EvU2FudGlhZ29cIl0sXG4gIFtcIkJvZ290YVwiLCBcIkNvbG9tYmlhXCIsIFwiQW1lcmljYS9Cb2dvdGFcIl0sXG4gIFtcIkxpbWFcIiwgXCJQZXJ1XCIsIFwiQW1lcmljYS9MaW1hXCJdLFxuICBbXCJMb25kb25cIiwgXCJVbml0ZWQgS2luZ2RvbVwiLCBcIkV1cm9wZS9Mb25kb25cIl0sXG4gIFtcIkR1YmxpblwiLCBcIklyZWxhbmRcIiwgXCJFdXJvcGUvRHVibGluXCJdLFxuICBbXCJMaXNib25cIiwgXCJQb3J0dWdhbFwiLCBcIkV1cm9wZS9MaXNib25cIl0sXG4gIFtcIlBhcmlzXCIsIFwiRnJhbmNlXCIsIFwiRXVyb3BlL1BhcmlzXCJdLFxuICBbXCJCZXJsaW5cIiwgXCJHZXJtYW55XCIsIFwiRXVyb3BlL0JlcmxpblwiXSxcbiAgW1wiTWFkcmlkXCIsIFwiU3BhaW5cIiwgXCJFdXJvcGUvTWFkcmlkXCJdLFxuICBbXCJSb21lXCIsIFwiSXRhbHlcIiwgXCJFdXJvcGUvUm9tZVwiXSxcbiAgW1wiQW1zdGVyZGFtXCIsIFwiTmV0aGVybGFuZHNcIiwgXCJFdXJvcGUvQW1zdGVyZGFtXCJdLFxuICBbXCJCcnVzc2Vsc1wiLCBcIkJlbGdpdW1cIiwgXCJFdXJvcGUvQnJ1c3NlbHNcIl0sXG4gIFtcIlp1cmljaFwiLCBcIlN3aXR6ZXJsYW5kXCIsIFwiRXVyb3BlL1p1cmljaFwiXSxcbiAgW1wiVmllbm5hXCIsIFwiQXVzdHJpYVwiLCBcIkV1cm9wZS9WaWVubmFcIl0sXG4gIFtcIlN0b2NraG9sbVwiLCBcIlN3ZWRlblwiLCBcIkV1cm9wZS9TdG9ja2hvbG1cIl0sXG4gIFtcIk9zbG9cIiwgXCJOb3J3YXlcIiwgXCJFdXJvcGUvT3Nsb1wiXSxcbiAgW1wiQ29wZW5oYWdlblwiLCBcIkRlbm1hcmtcIiwgXCJFdXJvcGUvQ29wZW5oYWdlblwiXSxcbiAgW1wiSGVsc2lua2lcIiwgXCJGaW5sYW5kXCIsIFwiRXVyb3BlL0hlbHNpbmtpXCJdLFxuICBbXCJXYXJzYXdcIiwgXCJQb2xhbmRcIiwgXCJFdXJvcGUvV2Fyc2F3XCJdLFxuICBbXCJQcmFndWVcIiwgXCJDemVjaGlhXCIsIFwiRXVyb3BlL1ByYWd1ZVwiXSxcbiAgW1wiQXRoZW5zXCIsIFwiR3JlZWNlXCIsIFwiRXVyb3BlL0F0aGVuc1wiXSxcbiAgW1wiSXN0YW5idWxcIiwgXCJUdXJrZXlcIiwgXCJFdXJvcGUvSXN0YW5idWxcIl0sXG4gIFtcIk1vc2Nvd1wiLCBcIlJ1c3NpYVwiLCBcIkV1cm9wZS9Nb3Njb3dcIl0sXG4gIFtcIlJleWtqYXZpa1wiLCBcIkljZWxhbmRcIiwgXCJBdGxhbnRpYy9SZXlramF2aWtcIl0sXG4gIFtcIkNhaXJvXCIsIFwiRWd5cHRcIiwgXCJBZnJpY2EvQ2Fpcm9cIl0sXG4gIFtcIkpvaGFubmVzYnVyZ1wiLCBcIlNvdXRoIEFmcmljYVwiLCBcIkFmcmljYS9Kb2hhbm5lc2J1cmdcIl0sXG4gIFtcIkxhZ29zXCIsIFwiTmlnZXJpYVwiLCBcIkFmcmljYS9MYWdvc1wiXSxcbiAgW1wiTmFpcm9iaVwiLCBcIktlbnlhXCIsIFwiQWZyaWNhL05haXJvYmlcIl0sXG4gIFtcIkNhc2FibGFuY2FcIiwgXCJNb3JvY2NvXCIsIFwiQWZyaWNhL0Nhc2FibGFuY2FcIl0sXG4gIFtcIkR1YmFpXCIsIFwiVW5pdGVkIEFyYWIgRW1pcmF0ZXNcIiwgXCJBc2lhL0R1YmFpXCJdLFxuICBbXCJSaXlhZGhcIiwgXCJTYXVkaSBBcmFiaWFcIiwgXCJBc2lhL1JpeWFkaFwiXSxcbiAgW1wiVGVsIEF2aXZcIiwgXCJJc3JhZWxcIiwgXCJBc2lhL0plcnVzYWxlbVwiXSxcbiAgW1wiVGVocmFuXCIsIFwiSXJhblwiLCBcIkFzaWEvVGVocmFuXCJdLFxuICBbXCJLYXJhY2hpXCIsIFwiUGFraXN0YW5cIiwgXCJBc2lhL0thcmFjaGlcIl0sXG4gIFtcIk11bWJhaVwiLCBcIkluZGlhXCIsIFwiQXNpYS9Lb2xrYXRhXCJdLFxuICBbXCJLYXRobWFuZHVcIiwgXCJOZXBhbFwiLCBcIkFzaWEvS2F0aG1hbmR1XCJdLFxuICBbXCJEaGFrYVwiLCBcIkJhbmdsYWRlc2hcIiwgXCJBc2lhL0RoYWthXCJdLFxuICBbXCJCYW5na29rXCIsIFwiVGhhaWxhbmRcIiwgXCJBc2lhL0Jhbmdrb2tcIl0sXG4gIFtcIkpha2FydGFcIiwgXCJJbmRvbmVzaWFcIiwgXCJBc2lhL0pha2FydGFcIl0sXG4gIFtcIlNpbmdhcG9yZVwiLCBcIlNpbmdhcG9yZVwiLCBcIkFzaWEvU2luZ2Fwb3JlXCJdLFxuICBbXCJLdWFsYSBMdW1wdXJcIiwgXCJNYWxheXNpYVwiLCBcIkFzaWEvS3VhbGFfTHVtcHVyXCJdLFxuICBbXCJIb25nIEtvbmdcIiwgXCJIb25nIEtvbmdcIiwgXCJBc2lhL0hvbmdfS29uZ1wiXSxcbiAgW1wiU2hhbmdoYWlcIiwgXCJDaGluYVwiLCBcIkFzaWEvU2hhbmdoYWlcIl0sXG4gIFtcIlRhaXBlaVwiLCBcIlRhaXdhblwiLCBcIkFzaWEvVGFpcGVpXCJdLFxuICBbXCJNYW5pbGFcIiwgXCJQaGlsaXBwaW5lc1wiLCBcIkFzaWEvTWFuaWxhXCJdLFxuICBbXCJTZW91bFwiLCBcIlNvdXRoIEtvcmVhXCIsIFwiQXNpYS9TZW91bFwiXSxcbiAgW1wiVG9reW9cIiwgXCJKYXBhblwiLCBcIkFzaWEvVG9reW9cIl0sXG4gIFtcIlN5ZG5leVwiLCBcIkF1c3RyYWxpYVwiLCBcIkF1c3RyYWxpYS9TeWRuZXlcIl0sXG4gIFtcIk1lbGJvdXJuZVwiLCBcIkF1c3RyYWxpYVwiLCBcIkF1c3RyYWxpYS9NZWxib3VybmVcIl0sXG4gIFtcIkJyaXNiYW5lXCIsIFwiQXVzdHJhbGlhXCIsIFwiQXVzdHJhbGlhL0JyaXNiYW5lXCJdLFxuICBbXCJQZXJ0aFwiLCBcIkF1c3RyYWxpYVwiLCBcIkF1c3RyYWxpYS9QZXJ0aFwiXSxcbiAgW1wiQXVja2xhbmRcIiwgXCJOZXcgWmVhbGFuZFwiLCBcIlBhY2lmaWMvQXVja2xhbmRcIl0sXG4gIFtcIlVUQ1wiLCBcIlVuaXZlcnNhbFwiLCBcIlVUQ1wiXSxcbl07XG5cbmV4cG9ydCBjb25zdCBDSVRZX0NBVEFMT0c6IHJlYWRvbmx5IENpdHlPcHRpb25bXSA9IENVUkFURUQubWFwKFxuICAoW25hbWUsIGNvdW50cnksIHpvbmVdKSA9PiAoeyBuYW1lLCBjb3VudHJ5LCB6b25lIH0pXG4pO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNWYWxpZFRpbWVab25lKHpvbmU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICB0cnkge1xuICAgIG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KFwiZW4tVVNcIiwgeyB0aW1lWm9uZTogem9uZSB9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbi8qKiBFdmVyeSBJQU5BIGlkZW50aWZpZXIgdGhlIHJ1bnRpbWUga25vd3MgYWJvdXQsIG9yIG5vbmUgaWYgdW5zdXBwb3J0ZWQuICovXG5mdW5jdGlvbiBydW50aW1lVGltZVpvbmVzKCk6IHN0cmluZ1tdIHtcbiAgY29uc3QgaW50bCA9IEludGwgYXMgdW5rbm93biBhcyB7XG4gICAgc3VwcG9ydGVkVmFsdWVzT2Y/OiAoa2V5OiBcInRpbWVab25lXCIpID0+IHN0cmluZ1tdO1xuICB9O1xuICB0cnkge1xuICAgIHJldHVybiBpbnRsLnN1cHBvcnRlZFZhbHVlc09mPy4oXCJ0aW1lWm9uZVwiKSA/PyBbXTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG59XG5cbi8qKiBIdW1hbi1yZWFkYWJsZSBuYW1lIGZvciBhIHpvbmU6IHRoZSBjdXJhdGVkIGNpdHksIG9yIHRoZSBsYXN0IElBTkEgc2VnbWVudC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjaXR5TmFtZUZvclpvbmUoem9uZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgY3VyYXRlZCA9IENJVFlfQ0FUQUxPRy5maW5kKChjaXR5KSA9PiBjaXR5LnpvbmUgPT09IHpvbmUpO1xuICBpZiAoY3VyYXRlZCkgcmV0dXJuIGN1cmF0ZWQubmFtZTtcbiAgY29uc3QgbGFzdCA9IHpvbmUuc3BsaXQoXCIvXCIpLnBvcCgpID8/IHpvbmU7XG4gIHJldHVybiBsYXN0LnJlcGxhY2UoL18vZywgXCIgXCIpO1xufVxuXG4vKipcbiAqIFNlYXJjaGVzIGN1cmF0ZWQgY2l0aWVzIGZpcnN0LCB0aGVuIGV2ZXJ5IElBTkEgaWRlbnRpZmllci4gQW4gZW1wdHkgcXVlcnlcbiAqIHJldHVybnMgdGhlIGN1cmF0ZWQgY2l0aWVzIG9ubHkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZWFyY2hDaXRpZXMocXVlcnk6IHN0cmluZywgbGltaXQgPSA0MCk6IENpdHlPcHRpb25bXSB7XG4gIGNvbnN0IG5lZWRsZSA9IHF1ZXJ5LnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xuICBjb25zdCBtYXRjaGVzID0gKGhheXN0YWNrOiBzdHJpbmcpOiBib29sZWFuID0+XG4gICAgaGF5c3RhY2sudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhuZWVkbGUpO1xuXG4gIGNvbnN0IGN1cmF0ZWQgPSBDSVRZX0NBVEFMT0cuZmlsdGVyKFxuICAgIChjaXR5KSA9PlxuICAgICAgbmVlZGxlID09PSBcIlwiIHx8XG4gICAgICBtYXRjaGVzKGNpdHkubmFtZSkgfHxcbiAgICAgIG1hdGNoZXMoY2l0eS5jb3VudHJ5ID8/IFwiXCIpIHx8XG4gICAgICBtYXRjaGVzKGNpdHkuem9uZSlcbiAgKTtcbiAgaWYgKG5lZWRsZSA9PT0gXCJcIikgcmV0dXJuIGN1cmF0ZWQuc2xpY2UoMCwgbGltaXQpO1xuXG4gIGNvbnN0IGN1cmF0ZWRab25lcyA9IG5ldyBTZXQoQ0lUWV9DQVRBTE9HLm1hcCgoY2l0eSkgPT4gY2l0eS56b25lKSk7XG4gIGNvbnN0IGlhbmEgPSBydW50aW1lVGltZVpvbmVzKClcbiAgICAuZmlsdGVyKCh6b25lKSA9PiAhY3VyYXRlZFpvbmVzLmhhcyh6b25lKSAmJiBtYXRjaGVzKHpvbmUpKVxuICAgIC5tYXAoKHpvbmUpID0+ICh7IG5hbWU6IGNpdHlOYW1lRm9yWm9uZSh6b25lKSwgem9uZSB9KSk7XG5cbiAgcmV0dXJuIFsuLi5jdXJhdGVkLCAuLi5pYW5hXS5zbGljZSgwLCBsaW1pdCk7XG59XG4iLCAiaW1wb3J0IHR5cGUgeyBEYXRlU3R5bGUgfSBmcm9tIFwiLi9zZXR0aW5nc1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFpvbmVSZWFkaW5nIHtcbiAgaG91cjogc3RyaW5nO1xuICBtaW51dGU6IHN0cmluZztcbiAgc2Vjb25kOiBzdHJpbmc7XG4gIC8qKiBBTSBvciBQTSBpbiAxMi1ob3VyIG1vZGUsIGVtcHR5IHN0cmluZyBpbiAyNC1ob3VyIG1vZGUuICovXG4gIHBlcmlvZDogc3RyaW5nO1xuICB3ZWVrZGF5OiBzdHJpbmc7XG4gIC8qKiBEYXRlIGluIHRoZSBjaG9zZW4gc3R5bGUsIGZvciBleGFtcGxlIFwiTm92ZW1iZXIgMywgMjAyNlwiIG9yIFwiTm92IDNcIi4gKi9cbiAgZGF0ZTogc3RyaW5nO1xuICAvKiogRnVsbCBsb2NhbGl6ZWQgZGF0ZSwgZm9yIHRvb2x0aXBzIGFuZCBhc3Npc3RpdmUgdGV4dC4gKi9cbiAgZnVsbERhdGU6IHN0cmluZztcbiAgLyoqIEZvciBleGFtcGxlIFwiVVRDXCIsIFwiVVRDKzFcIiBvciBcIlVUQys1OjMwXCIsIHdpdGggYSB0cnVlIG1pbnVzIHNpZ24gZm9yIG5lZ2F0aXZlcy4gKi9cbiAgb2Zmc2V0OiBzdHJpbmc7XG4gIC8qKiBDYWxlbmRhciBkYXkgaW4gdGhlIHpvbmUsIGNvdW50ZWQgaW4gd2hvbGUgZGF5cyBzaW5jZSB0aGUgVW5peCBlcG9jaC4gKi9cbiAgZGF5TnVtYmVyOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgWm9uZVJlYWRlck9wdGlvbnMge1xuICAvKiogSUFOQSBpZGVudGlmaWVyLiBVbmRlZmluZWQgbWVhbnMgdGhlIGRldmljZSdzIG93biB0aW1lIHpvbmUuICovXG4gIHRpbWVab25lPzogc3RyaW5nO1xuICBob3VyMTI6IGJvb2xlYW47XG4gIGRhdGVTdHlsZTogRGF0ZVN0eWxlO1xufVxuXG50eXBlIFBhcnRNYXAgPSBQYXJ0aWFsPFJlY29yZDxJbnRsLkRhdGVUaW1lRm9ybWF0UGFydFR5cGVzLCBzdHJpbmc+PjtcblxuY29uc3QgTVNfUEVSX0RBWSA9IDg2NDAwMDAwO1xuXG5mdW5jdGlvbiBtYWtlRm9ybWF0KG9wdGlvbnM6IEludGwuRGF0ZVRpbWVGb3JtYXRPcHRpb25zKTogSW50bC5EYXRlVGltZUZvcm1hdCB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KHVuZGVmaW5lZCwgb3B0aW9ucyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkNocm9ubzogdW5hYmxlIHRvIGNyZWF0ZSBhIGRhdGUgZm9ybWF0dGVyLlwiLCBlcnJvcik7XG4gICAgcmV0dXJuIG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KFwiZW4tVVNcIiwgeyB0aW1lWm9uZTogXCJVVENcIiB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZWFkUGFydHMoZm9ybWF0OiBJbnRsLkRhdGVUaW1lRm9ybWF0LCBkYXRlOiBEYXRlKTogUGFydE1hcCB7XG4gIGNvbnN0IHBhcnRzOiBQYXJ0TWFwID0ge307XG4gIGZvciAoY29uc3QgcGFydCBvZiBmb3JtYXQuZm9ybWF0VG9QYXJ0cyhkYXRlKSkgcGFydHNbcGFydC50eXBlXSA9IHBhcnQudmFsdWU7XG4gIHJldHVybiBwYXJ0cztcbn1cblxuLyoqIENvbnZlcnRzIFwiR01UKzA1OjMwXCIgKGFzIEludGwgcmVwb3J0cyBpdCkgaW50byBcIlVUQys1OjMwXCIuICovXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0VXRjT2Zmc2V0KGxvbmdPZmZzZXQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IG1hdGNoID0gL15HTVQoWystXSkoXFxkezEsMn0pKD86OihcXGR7Mn0pKT8kLy5leGVjKGxvbmdPZmZzZXQudHJpbSgpKTtcbiAgaWYgKCFtYXRjaCkgcmV0dXJuIFwiVVRDXCI7XG4gIGNvbnN0IFssIHNpZ24sIGhvdXJzLCBtaW51dGVzXSA9IG1hdGNoO1xuICBjb25zdCBzdWZmaXggPSBtaW51dGVzICYmIG1pbnV0ZXMgIT09IFwiMDBcIiA/IGA6JHttaW51dGVzfWAgOiBcIlwiO1xuICByZXR1cm4gYFVUQyR7c2lnbiA9PT0gXCItXCIgPyBcIlxcdTIyMTJcIiA6IFwiK1wifSR7TnVtYmVyKGhvdXJzKX0ke3N1ZmZpeH1gO1xufVxuXG4vKiogV2hldGhlciBhbm90aGVyIHpvbmUncyBjYWxlbmRhciBkYXkgaXMgeWVzdGVyZGF5LCB0b2RheSBvciB0b21vcnJvdyByZWxhdGl2ZSB0byB0aGUgbG9jYWwgb25lLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlbGF0aXZlRGF5KHpvbmVEYXk6IG51bWJlciwgbG9jYWxEYXk6IG51bWJlcik6IC0xIHwgMCB8IDEge1xuICBjb25zdCBkaWZmID0gem9uZURheSAtIGxvY2FsRGF5O1xuICBpZiAoZGlmZiA+IDApIHJldHVybiAxO1xuICBpZiAoZGlmZiA8IDApIHJldHVybiAtMTtcbiAgcmV0dXJuIDA7XG59XG5cbi8qKlxuICogRm9ybWF0cyB0aGUgdGltZSBpbiBvbmUgdGltZSB6b25lLiBBbGwgd2FsbC1jbG9jayBhbmQgZGF5bGlnaHQgc2F2aW5nXG4gKiBkZWNpc2lvbnMgYXJlIGRlbGVnYXRlZCB0byBJbnRsIHVzaW5nIElBTkEgaWRlbnRpZmllcnMsIG5ldmVyIGZpeGVkIG9mZnNldHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBab25lUmVhZGVyIHtcbiAgcHJpdmF0ZSByZWFkb25seSBob3VyMTI6IGJvb2xlYW47XG4gIHByaXZhdGUgcmVhZG9ubHkgdGltZUZvcm1hdDogSW50bC5EYXRlVGltZUZvcm1hdDtcbiAgcHJpdmF0ZSByZWFkb25seSB3ZWVrZGF5Rm9ybWF0OiBJbnRsLkRhdGVUaW1lRm9ybWF0O1xuICBwcml2YXRlIHJlYWRvbmx5IGRhdGVGb3JtYXQ6IEludGwuRGF0ZVRpbWVGb3JtYXQ7XG4gIHByaXZhdGUgcmVhZG9ubHkgZnVsbEZvcm1hdDogSW50bC5EYXRlVGltZUZvcm1hdDtcbiAgcHJpdmF0ZSByZWFkb25seSBkYXlGb3JtYXQ6IEludGwuRGF0ZVRpbWVGb3JtYXQ7XG4gIHByaXZhdGUgcmVhZG9ubHkgb2Zmc2V0Rm9ybWF0OiBJbnRsLkRhdGVUaW1lRm9ybWF0O1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IFpvbmVSZWFkZXJPcHRpb25zKSB7XG4gICAgY29uc3QgeyB0aW1lWm9uZSwgaG91cjEyLCBkYXRlU3R5bGUgfSA9IG9wdGlvbnM7XG4gICAgdGhpcy5ob3VyMTIgPSBob3VyMTI7XG4gICAgdGhpcy50aW1lRm9ybWF0ID0gbWFrZUZvcm1hdCh7XG4gICAgICB0aW1lWm9uZSxcbiAgICAgIGhvdXI6IGhvdXIxMiA/IFwibnVtZXJpY1wiIDogXCIyLWRpZ2l0XCIsXG4gICAgICBtaW51dGU6IFwiMi1kaWdpdFwiLFxuICAgICAgc2Vjb25kOiBcIjItZGlnaXRcIixcbiAgICAgIGhvdXJDeWNsZTogaG91cjEyID8gXCJoMTJcIiA6IFwiaDIzXCIsXG4gICAgfSk7XG4gICAgdGhpcy53ZWVrZGF5Rm9ybWF0ID0gbWFrZUZvcm1hdCh7IHRpbWVab25lLCB3ZWVrZGF5OiBcImxvbmdcIiB9KTtcbiAgICB0aGlzLmRhdGVGb3JtYXQgPSBtYWtlRm9ybWF0KHtcbiAgICAgIHRpbWVab25lLFxuICAgICAgLi4uKGRhdGVTdHlsZSA9PT0gXCJsb25nXCJcbiAgICAgICAgPyB7IGRheTogXCJudW1lcmljXCIsIG1vbnRoOiBcImxvbmdcIiwgeWVhcjogXCJudW1lcmljXCIgfVxuICAgICAgICA6IHsgZGF5OiBcIm51bWVyaWNcIiwgbW9udGg6IFwic2hvcnRcIiB9KSxcbiAgICB9KTtcbiAgICB0aGlzLmZ1bGxGb3JtYXQgPSBtYWtlRm9ybWF0KHsgdGltZVpvbmUsIGRhdGVTdHlsZTogXCJmdWxsXCIgfSk7XG4gICAgLy8gQ2FsZW5kYXIgYW5kIG9mZnNldCBwYXJzaW5nIHVzZSBFbmdsaXNoIGRpZ2l0cyBhbmQgbmFtZXMgc28gdGhlXG4gICAgLy8gYXJpdGhtZXRpYyBpcyBsb2NhbGUtaW5kZXBlbmRlbnQuIERpc3BsYXkgc3RyaW5ncyB1c2UgdGhlIHVzZXIncyBsb2NhbGUuXG4gICAgdGhpcy5kYXlGb3JtYXQgPSBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChcImVuLVVTXCIsIHtcbiAgICAgIHRpbWVab25lLFxuICAgICAgeWVhcjogXCJudW1lcmljXCIsXG4gICAgICBtb250aDogXCJudW1lcmljXCIsXG4gICAgICBkYXk6IFwibnVtZXJpY1wiLFxuICAgIH0pO1xuICAgIHRoaXMub2Zmc2V0Rm9ybWF0ID0gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQoXCJlbi1VU1wiLCB7XG4gICAgICB0aW1lWm9uZSxcbiAgICAgIHRpbWVab25lTmFtZTogXCJsb25nT2Zmc2V0XCIsXG4gICAgfSk7XG4gIH1cblxuICByZWFkKG5vdzogRGF0ZSk6IFpvbmVSZWFkaW5nIHtcbiAgICBjb25zdCB0aW1lID0gcmVhZFBhcnRzKHRoaXMudGltZUZvcm1hdCwgbm93KTtcbiAgICBjb25zdCBkYXkgPSByZWFkUGFydHModGhpcy5kYXlGb3JtYXQsIG5vdyk7XG4gICAgY29uc3Qgb2Zmc2V0ID0gcmVhZFBhcnRzKHRoaXMub2Zmc2V0Rm9ybWF0LCBub3cpLnRpbWVab25lTmFtZSA/PyBcIlwiO1xuICAgIGNvbnN0IGRheU51bWJlciA9XG4gICAgICBEYXRlLlVUQyhOdW1iZXIoZGF5LnllYXIpLCBOdW1iZXIoZGF5Lm1vbnRoKSAtIDEsIE51bWJlcihkYXkuZGF5KSkgL1xuICAgICAgTVNfUEVSX0RBWTtcblxuICAgIHJldHVybiB7XG4gICAgICBob3VyOiB0aW1lLmhvdXIgPz8gXCJcIixcbiAgICAgIG1pbnV0ZTogdGltZS5taW51dGUgPz8gXCJcIixcbiAgICAgIHNlY29uZDogdGltZS5zZWNvbmQgPz8gXCJcIixcbiAgICAgIHBlcmlvZDogdGhpcy5ob3VyMTIgPyAodGltZS5kYXlQZXJpb2QgPz8gXCJcIikgOiBcIlwiLFxuICAgICAgd2Vla2RheTogdGhpcy53ZWVrZGF5Rm9ybWF0LmZvcm1hdChub3cpLFxuICAgICAgZGF0ZTogdGhpcy5kYXRlRm9ybWF0LmZvcm1hdChub3cpLFxuICAgICAgZnVsbERhdGU6IHRoaXMuZnVsbEZvcm1hdC5mb3JtYXQobm93KSxcbiAgICAgIG9mZnNldDogZm9ybWF0VXRjT2Zmc2V0KG9mZnNldCksXG4gICAgICBkYXlOdW1iZXIsXG4gICAgfTtcbiAgfVxufVxuIiwgImltcG9ydCB0eXBlIHsgQ2hyb25vU2V0dGluZ3MgfSBmcm9tIFwiLi9zZXR0aW5nc1wiO1xuaW1wb3J0IHsgY2l0eU5hbWVGb3Jab25lIH0gZnJvbSBcIi4vdGltZVpvbmVzXCI7XG5pbXBvcnQgeyByZWxhdGl2ZURheSwgWm9uZVJlYWRlciwgdHlwZSBab25lUmVhZGluZyB9IGZyb20gXCIuL3pvbmVSZWFkZXJcIjtcblxuZXhwb3J0IGludGVyZmFjZSBMb2NhbFJlYWRpbmcgZXh0ZW5kcyBab25lUmVhZGluZyB7XG4gIHpvbmVOYW1lOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgV29ybGRSZWFkaW5nIGV4dGVuZHMgWm9uZVJlYWRpbmcge1xuICB6b25lOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgZGF5T2Zmc2V0OiAtMSB8IDAgfCAxO1xufVxuXG4vKiogRXZlcnl0aGluZyB0aGUgVUkgbmVlZHMgdG8gZHJhdyBvbmUgZnJhbWUgb2YgdGhlIGNsb2NrLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDbG9ja1NuYXBzaG90IHtcbiAgbG9jYWw6IExvY2FsUmVhZGluZztcbiAgLyoqIEZyYWN0aW9uIG9mIHRoZSBkZXZpY2UncyBjdXJyZW50IGRheSB0aGF0IGhhcyBlbGFwc2VkLCAwIHRvIDEuICovXG4gIGRheVByb2dyZXNzOiBudW1iZXI7XG4gIHdvcmxkczogV29ybGRSZWFkaW5nW107XG4gIC8qKiBDb21wYWN0IGxvY2FsIHRpbWUgZm9yIHRoZSBzdGF0dXMgYmFyLiAqL1xuICBzdGF0dXNUZXh0OiBzdHJpbmc7XG4gIC8qKiBNaW51dGUtcHJlY2lzaW9uIHRleHQgZm9yIGFzc2lzdGl2ZSB0ZWNobm9sb2d5LiAqL1xuICBsYWJlbDogc3RyaW5nO1xufVxuXG5leHBvcnQgdHlwZSBDbG9ja0xpc3RlbmVyID0gKHNuYXBzaG90OiBDbG9ja1NuYXBzaG90KSA9PiB2b2lkO1xuXG50eXBlIENhY2hlZFNuYXBzaG90ID0gT21pdDxDbG9ja1NuYXBzaG90LCBcImRheVByb2dyZXNzXCI+O1xuXG5mdW5jdGlvbiBsb2NhbFpvbmVOYW1lKCk6IHN0cmluZyB7XG4gIHRyeSB7XG4gICAgY29uc3Qgem9uZSA9IEludGwuRGF0ZVRpbWVGb3JtYXQoKS5yZXNvbHZlZE9wdGlvbnMoKS50aW1lWm9uZTtcbiAgICByZXR1cm4gem9uZSA/IGNpdHlOYW1lRm9yWm9uZSh6b25lKSA6IFwiTG9jYWwgdGltZVwiO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gXCJMb2NhbCB0aW1lXCI7XG4gIH1cbn1cblxuZnVuY3Rpb24gZGF5UHJvZ3Jlc3Mobm93OiBEYXRlKTogbnVtYmVyIHtcbiAgY29uc3Qgc2Vjb25kcyA9XG4gICAgbm93LmdldEhvdXJzKCkgKiAzNjAwICtcbiAgICBub3cuZ2V0TWludXRlcygpICogNjAgK1xuICAgIG5vdy5nZXRTZWNvbmRzKCkgK1xuICAgIG5vdy5nZXRNaWxsaXNlY29uZHMoKSAvIDEwMDA7XG4gIHJldHVybiBzZWNvbmRzIC8gODY0MDA7XG59XG5cbi8qKlxuICogRm9ybWF0cyB0aGUgbG9jYWwgY2xvY2sgYW5kIGV2ZXJ5IHdvcmxkIGNsb2NrIGZvciBvbmUgc2V0dGluZ3Mgc3RhdGUuXG4gKiBSZWFkaW5ncyBhcmUgY2FjaGVkIHBlciB3aG9sZSBzZWNvbmQsIHNvIHJlcGVhdGVkIHRpY2tzIHdpdGhpbiBhIHNlY29uZFxuICogcmV1c2UgdGhlIHNhbWUgc3RyaW5ncy5cbiAqL1xuZXhwb3J0IGNsYXNzIENsb2NrRm9ybWF0dGVyIHtcbiAgcHJpdmF0ZSByZWFkb25seSBsb2NhbFJlYWRlcjogWm9uZVJlYWRlcjtcbiAgcHJpdmF0ZSByZWFkb25seSB3b3JsZFJlYWRlcnM6IHsgem9uZTogc3RyaW5nOyBuYW1lOiBzdHJpbmc7IHJlYWRlcjogWm9uZVJlYWRlciB9W107XG4gIHByaXZhdGUgY2FjaGU6IHsga2V5OiBudW1iZXI7IGJhc2U6IENhY2hlZFNuYXBzaG90IH0gfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IHNldHRpbmdzOiBDaHJvbm9TZXR0aW5ncykge1xuICAgIGNvbnN0IGhvdXIxMiA9IHNldHRpbmdzLmhvdXJGb3JtYXQgPT09IFwiMTJcIjtcbiAgICBjb25zdCBkYXRlU3R5bGUgPSBzZXR0aW5ncy5kYXRlU3R5bGU7XG4gICAgdGhpcy5sb2NhbFJlYWRlciA9IG5ldyBab25lUmVhZGVyKHsgaG91cjEyLCBkYXRlU3R5bGUgfSk7XG4gICAgdGhpcy53b3JsZFJlYWRlcnMgPSBzZXR0aW5ncy53b3JsZENsb2Nrcy5tYXAoKHsgem9uZSwgbmFtZSB9KSA9PiAoe1xuICAgICAgem9uZSxcbiAgICAgIG5hbWUsXG4gICAgICByZWFkZXI6IG5ldyBab25lUmVhZGVyKHsgdGltZVpvbmU6IHpvbmUsIGhvdXIxMiwgZGF0ZVN0eWxlIH0pLFxuICAgIH0pKTtcbiAgfVxuXG4gIHNuYXBzaG90KG5vdzogRGF0ZSA9IG5ldyBEYXRlKCkpOiBDbG9ja1NuYXBzaG90IHtcbiAgICBjb25zdCBrZXkgPSBNYXRoLmZsb29yKG5vdy5nZXRUaW1lKCkgLyAxMDAwKTtcbiAgICBpZiAoIXRoaXMuY2FjaGUgfHwgdGhpcy5jYWNoZS5rZXkgIT09IGtleSkge1xuICAgICAgdGhpcy5jYWNoZSA9IHsga2V5LCBiYXNlOiB0aGlzLmJ1aWxkKG5vdykgfTtcbiAgICB9XG4gICAgcmV0dXJuIHsgLi4udGhpcy5jYWNoZS5iYXNlLCBkYXlQcm9ncmVzczogZGF5UHJvZ3Jlc3Mobm93KSB9O1xuICB9XG5cbiAgcHJpdmF0ZSBidWlsZChub3c6IERhdGUpOiBDYWNoZWRTbmFwc2hvdCB7XG4gICAgY29uc3QgbG9jYWwgPSB0aGlzLmxvY2FsUmVhZGVyLnJlYWQobm93KTtcbiAgICBjb25zdCBjb3JlID0gYCR7bG9jYWwuaG91cn06JHtsb2NhbC5taW51dGV9YDtcbiAgICBjb25zdCBwZXJpb2QgPSBsb2NhbC5wZXJpb2QgPyBgICR7bG9jYWwucGVyaW9kfWAgOiBcIlwiO1xuXG4gICAgY29uc3Qgd29ybGRzOiBXb3JsZFJlYWRpbmdbXSA9IHRoaXMuc2V0dGluZ3Muc2hvd1dvcmxkQ2xvY2tzXG4gICAgICA/IHRoaXMud29ybGRSZWFkZXJzLm1hcCgoeyB6b25lLCBuYW1lLCByZWFkZXIgfSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHJlYWRpbmcgPSByZWFkZXIucmVhZChub3cpO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5yZWFkaW5nLFxuICAgICAgICAgICAgem9uZSxcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICBkYXlPZmZzZXQ6IHJlbGF0aXZlRGF5KHJlYWRpbmcuZGF5TnVtYmVyLCBsb2NhbC5kYXlOdW1iZXIpLFxuICAgICAgICAgIH07XG4gICAgICAgIH0pXG4gICAgICA6IFtdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGxvY2FsOiB7IC4uLmxvY2FsLCB6b25lTmFtZTogbG9jYWxab25lTmFtZSgpIH0sXG4gICAgICB3b3JsZHMsXG4gICAgICBzdGF0dXNUZXh0OiB0aGlzLnNldHRpbmdzLnNob3dTZWNvbmRzXG4gICAgICAgID8gYCR7Y29yZX06JHtsb2NhbC5zZWNvbmR9JHtwZXJpb2R9YFxuICAgICAgICA6IGAke2NvcmV9JHtwZXJpb2R9YCxcbiAgICAgIGxhYmVsOiBgJHtjb3JlfSR7cGVyaW9kfSwgJHtsb2NhbC5mdWxsRGF0ZX1gLFxuICAgIH07XG4gIH1cbn1cblxuLyoqXG4gKiBPd25zIHRoZSBmb3JtYXR0ZXIgYW5kIGZhbnMgb25lIHRpY2sgb3V0IHRvIGV2ZXJ5IHN1YnNjcmliZXIgKHNpZGViYXJcbiAqIHZpZXcsIHN0YXR1cyBiYXIpLiBUaGUgcGx1Z2luIGRyaXZlcyBgdGljaygpYCBmcm9tIGEgc2luZ2xlIHJlZ2lzdGVyZWRcbiAqIGludGVydmFsLCBzbyB0aGVyZSBpcyBleGFjdGx5IG9uZSB0aW1lciBubyBtYXR0ZXIgaG93IG1hbnkgdmlld3MgZXhpc3QuXG4gKi9cbmV4cG9ydCBjbGFzcyBDbG9ja0VuZ2luZSB7XG4gIHByaXZhdGUgZm9ybWF0dGVyOiBDbG9ja0Zvcm1hdHRlcjtcbiAgcHJpdmF0ZSByZWFkb25seSBsaXN0ZW5lcnMgPSBuZXcgU2V0PENsb2NrTGlzdGVuZXI+KCk7XG5cbiAgY29uc3RydWN0b3Ioc2V0dGluZ3M6IENocm9ub1NldHRpbmdzKSB7XG4gICAgdGhpcy5mb3JtYXR0ZXIgPSBuZXcgQ2xvY2tGb3JtYXR0ZXIoc2V0dGluZ3MpO1xuICB9XG5cbiAgY29uZmlndXJlKHNldHRpbmdzOiBDaHJvbm9TZXR0aW5ncyk6IHZvaWQge1xuICAgIHRoaXMuZm9ybWF0dGVyID0gbmV3IENsb2NrRm9ybWF0dGVyKHNldHRpbmdzKTtcbiAgfVxuXG4gIC8qKiBGcmVzaCBzbmFwc2hvdCB3aXRob3V0IG5vdGlmeWluZyBhbnlvbmUuICovXG4gIHNuYXBzaG90KG5vdzogRGF0ZSA9IG5ldyBEYXRlKCkpOiBDbG9ja1NuYXBzaG90IHtcbiAgICByZXR1cm4gdGhpcy5mb3JtYXR0ZXIuc25hcHNob3Qobm93KTtcbiAgfVxuXG4gIHN1YnNjcmliZShsaXN0ZW5lcjogQ2xvY2tMaXN0ZW5lcik6ICgpID0+IHZvaWQge1xuICAgIHRoaXMubGlzdGVuZXJzLmFkZChsaXN0ZW5lcik7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHRoaXMubGlzdGVuZXJzLmRlbGV0ZShsaXN0ZW5lcik7XG4gICAgfTtcbiAgfVxuXG4gIHRpY2soKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubGlzdGVuZXJzLnNpemUgPT09IDApIHJldHVybjtcblxuICAgIGxldCBzbmFwc2hvdDogQ2xvY2tTbmFwc2hvdDtcbiAgICB0cnkge1xuICAgICAgc25hcHNob3QgPSB0aGlzLmZvcm1hdHRlci5zbmFwc2hvdCgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiQ2hyb25vOiB1bmFibGUgdG8gcmVhZCB0aGUgY3VycmVudCB0aW1lLlwiLCBlcnJvcik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBsaXN0ZW5lciBvZiBBcnJheS5mcm9tKHRoaXMubGlzdGVuZXJzKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbGlzdGVuZXIoc25hcHNob3QpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkNocm9ubzogYSBjbG9jayBsaXN0ZW5lciBmYWlsZWQuXCIsIGVycm9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjbGVhcigpOiB2b2lkIHtcbiAgICB0aGlzLmxpc3RlbmVycy5jbGVhcigpO1xuICB9XG59XG4iLCAiZXhwb3J0IGNvbnN0IFBMVUdJTl9JRCA9IFwiY2hyb25vLWNsb2NrXCI7XG5leHBvcnQgY29uc3QgVklFV19UWVBFX0NIUk9OTyA9IFwiY2hyb25vLWNsb2NrLXZpZXdcIjtcblxuLyoqXG4gKiBQb2xsaW5nIGNhZGVuY2Ugb2YgdGhlIHNoYXJlZCBjbG9jay4gVGhlIERPTSBpcyBvbmx5IHRvdWNoZWQgd2hlbiBhIHZhbHVlXG4gKiBhY3R1YWxseSBjaGFuZ2VzLCBzbyB0aGlzIHN0YXlzIGNoZWFwIHdoaWxlIGtlZXBpbmcgdGhlIGRpc3BsYXkgd2l0aGluXG4gKiBhIHF1YXJ0ZXIgb2YgYSBzZWNvbmQgb2YgdGhlIHRydWUgc2Vjb25kIGJvdW5kYXJ5LlxuICovXG5leHBvcnQgY29uc3QgVElDS19JTlRFUlZBTF9NUyA9IDI1MDtcblxuZXhwb3J0IGNvbnN0IE1BWF9XT1JMRF9DTE9DS1MgPSAxMjtcbiIsICIvKipcbiAqIFNldHRpbmdzIG1vZGVsLiBGcmVlIG9mIE9ic2lkaWFuIGltcG9ydHMgc28gaXQgY2FuIGJlIHRlc3RlZCBpbiBpc29sYXRpb24uXG4gKi9cbmltcG9ydCB7IE1BWF9XT1JMRF9DTE9DS1MgfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IGNpdHlOYW1lRm9yWm9uZSwgaXNWYWxpZFRpbWVab25lIH0gZnJvbSBcIi4vdGltZVpvbmVzXCI7XG5cbi8qKiBWZXJzaW9uIDIgcmVwbGFjZWQgdGhlIGdsaXRjaCBhbmQgYmFyIG9wdGlvbnMgYW5kIGFkZGVkIHdvcmxkIGNsb2Nrcy4gKi9cbmV4cG9ydCBjb25zdCBTRVRUSU5HU19WRVJTSU9OID0gMjtcblxuZXhwb3J0IHR5cGUgSG91ckZvcm1hdCA9IFwiMTJcIiB8IFwiMjRcIjtcbmV4cG9ydCB0eXBlIERhdGVTdHlsZSA9IFwibG9uZ1wiIHwgXCJzaG9ydFwiO1xuZXhwb3J0IHR5cGUgRGVuc2l0eSA9IFwiY29tZm9ydGFibGVcIiB8IFwiY29tcGFjdFwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIFdvcmxkQ2xvY2tFbnRyeSB7XG4gIC8qKiBJQU5BIHRpbWUgem9uZSBpZGVudGlmaWVyLCB1bmlxdWUgd2l0aGluIHRoZSBsaXN0LiAqL1xuICB6b25lOiBzdHJpbmc7XG4gIC8qKiBOYW1lIHNob3duIGluIHRoZSBzaWRlYmFyLiAqL1xuICBuYW1lOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2hyb25vU2V0dGluZ3Mge1xuICAvKiogMTItaG91ciAod2l0aCBBTS9QTSkgb3IgMjQtaG91ciBub3RhdGlvbi4gKi9cbiAgaG91ckZvcm1hdDogSG91ckZvcm1hdDtcbiAgLyoqIFNlY29uZHMgb24gdGhlIGxvY2FsIGNsb2NrIGFuZCBvbiB3b3JsZCBjbG9ja3MuICovXG4gIHNob3dTZWNvbmRzOiBib29sZWFuO1xuICBzaG93RGF0ZTogYm9vbGVhbjtcbiAgLyoqIFwibG9uZ1wiIGluY2x1ZGVzIHRoZSB5ZWFyLCBcInNob3J0XCIgaXMgY29tcGFjdC4gKi9cbiAgZGF0ZVN0eWxlOiBEYXRlU3R5bGU7XG4gIC8qKiBUaW1lIHpvbmUgbmFtZSBhbmQgVVRDIG9mZnNldCB1bmRlciB0aGUgbG9jYWwgY2xvY2suICovXG4gIHNob3dUaW1lem9uZTogYm9vbGVhbjtcbiAgLyoqIFRoaW4gcHJvZ3Jlc3MgbGluZSBzaG93aW5nIGhvdyBmYXIgdGhyb3VnaCB0aGUgZGF5IHRoZSBkZXZpY2UgaXMuICovXG4gIHNob3dQcm9ncmVzczogYm9vbGVhbjtcbiAgZGVuc2l0eTogRGVuc2l0eTtcbiAgc2hvd1dvcmxkQ2xvY2tzOiBib29sZWFuO1xuICB3b3JsZENsb2NrczogV29ybGRDbG9ja0VudHJ5W107XG4gIHNob3dTdGF0dXNCYXI6IGJvb2xlYW47XG59XG5cbi8qKiBSZWFkcyB0aGUgZGV2aWNlJ3MgcHJlZmVycmVkIGhvdXIgY3ljbGUgc28gZmlyc3QtcnVuIGZlZWxzIG5hdGl2ZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXRlY3REZXZpY2VIb3VyRm9ybWF0KCk6IEhvdXJGb3JtYXQge1xuICB0cnkge1xuICAgIGNvbnN0IGN5Y2xlID0gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQodW5kZWZpbmVkLCB7XG4gICAgICBob3VyOiBcIm51bWVyaWNcIixcbiAgICB9KS5yZXNvbHZlZE9wdGlvbnMoKS5ob3VyQ3ljbGU7XG4gICAgcmV0dXJuIGN5Y2xlID09PSBcImgyM1wiIHx8IGN5Y2xlID09PSBcImgyNFwiID8gXCIyNFwiIDogXCIxMlwiO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gXCIyNFwiO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXREZWZhdWx0U2V0dGluZ3MoKTogQ2hyb25vU2V0dGluZ3Mge1xuICByZXR1cm4ge1xuICAgIGhvdXJGb3JtYXQ6IGRldGVjdERldmljZUhvdXJGb3JtYXQoKSxcbiAgICBzaG93U2Vjb25kczogdHJ1ZSxcbiAgICBzaG93RGF0ZTogdHJ1ZSxcbiAgICBkYXRlU3R5bGU6IFwibG9uZ1wiLFxuICAgIHNob3dUaW1lem9uZTogdHJ1ZSxcbiAgICBzaG93UHJvZ3Jlc3M6IHRydWUsXG4gICAgZGVuc2l0eTogXCJjb21mb3J0YWJsZVwiLFxuICAgIHNob3dXb3JsZENsb2NrczogdHJ1ZSxcbiAgICB3b3JsZENsb2NrczogW10sXG4gICAgc2hvd1N0YXR1c0JhcjogZmFsc2UsXG4gIH07XG59XG5cbmZ1bmN0aW9uIHNhbml0aXplV29ybGRDbG9ja3ModmFsdWU6IHVua25vd24pOiBXb3JsZENsb2NrRW50cnlbXSB7XG4gIGlmICghQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHJldHVybiBbXTtcbiAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBjb25zdCByZXN1bHQ6IFdvcmxkQ2xvY2tFbnRyeVtdID0gW107XG4gIGZvciAoY29uc3QgaXRlbSBvZiB2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgaXRlbSAhPT0gXCJvYmplY3RcIiB8fCBpdGVtID09PSBudWxsKSBjb250aW51ZTtcbiAgICBjb25zdCB7IHpvbmUsIG5hbWUgfSA9IGl0ZW0gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gICAgaWYgKHR5cGVvZiB6b25lICE9PSBcInN0cmluZ1wiIHx8IHNlZW4uaGFzKHpvbmUpIHx8ICFpc1ZhbGlkVGltZVpvbmUoem9uZSkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBzZWVuLmFkZCh6b25lKTtcbiAgICBjb25zdCBsYWJlbCA9IHR5cGVvZiBuYW1lID09PSBcInN0cmluZ1wiID8gbmFtZS50cmltKCkuc2xpY2UoMCwgNjApIDogXCJcIjtcbiAgICByZXN1bHQucHVzaCh7IHpvbmUsIG5hbWU6IGxhYmVsIHx8IGNpdHlOYW1lRm9yWm9uZSh6b25lKSB9KTtcbiAgICBpZiAocmVzdWx0Lmxlbmd0aCA+PSBNQVhfV09STERfQ0xPQ0tTKSBicmVhaztcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFR1cm5zIHdoYXRldmVyIHdhcyBzdG9yZWQgb24gZGlzayAocG9zc2libHkgbWlzc2luZywgcGFydGlhbCwgZnJvbSBhblxuICogb2xkZXIgdmVyc2lvbiwgb3IgaGFuZC1lZGl0ZWQpIGludG8gYSBmdWxseSB2YWxpZCBzZXR0aW5ncyBvYmplY3QuXG4gKiBWZXJzaW9uIDEgc3RvcmVkIGBzaG93QmFyc2AsIHdoaWNoIG1hcHMgb250byBgc2hvd1Byb2dyZXNzYDsgdGhlIHJldGlyZWRcbiAqIGBnbGl0Y2hFZmZlY3RzYCBrZXkgaXMgc2ltcGx5IGlnbm9yZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYW5pdGl6ZVNldHRpbmdzKHJhdzogdW5rbm93bik6IENocm9ub1NldHRpbmdzIHtcbiAgY29uc3QgZGVmYXVsdHMgPSBnZXREZWZhdWx0U2V0dGluZ3MoKTtcbiAgaWYgKHR5cGVvZiByYXcgIT09IFwib2JqZWN0XCIgfHwgcmF3ID09PSBudWxsKSByZXR1cm4gZGVmYXVsdHM7XG4gIGNvbnN0IHIgPSByYXcgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgY29uc3QgYm9vbCA9ICh2YWx1ZTogdW5rbm93biwgZmFsbGJhY2s6IGJvb2xlYW4pOiBib29sZWFuID0+XG4gICAgdHlwZW9mIHZhbHVlID09PSBcImJvb2xlYW5cIiA/IHZhbHVlIDogZmFsbGJhY2s7XG5cbiAgY29uc3QgcHJvZ3Jlc3NTb3VyY2UgPSBcInNob3dQcm9ncmVzc1wiIGluIHIgPyByLnNob3dQcm9ncmVzcyA6IHIuc2hvd0JhcnM7XG5cbiAgcmV0dXJuIHtcbiAgICBob3VyRm9ybWF0OlxuICAgICAgci5ob3VyRm9ybWF0ID09PSBcIjEyXCIgfHwgci5ob3VyRm9ybWF0ID09PSBcIjI0XCJcbiAgICAgICAgPyByLmhvdXJGb3JtYXRcbiAgICAgICAgOiBkZWZhdWx0cy5ob3VyRm9ybWF0LFxuICAgIHNob3dTZWNvbmRzOiBib29sKHIuc2hvd1NlY29uZHMsIGRlZmF1bHRzLnNob3dTZWNvbmRzKSxcbiAgICBzaG93RGF0ZTogYm9vbChyLnNob3dEYXRlLCBkZWZhdWx0cy5zaG93RGF0ZSksXG4gICAgZGF0ZVN0eWxlOlxuICAgICAgci5kYXRlU3R5bGUgPT09IFwibG9uZ1wiIHx8IHIuZGF0ZVN0eWxlID09PSBcInNob3J0XCJcbiAgICAgICAgPyByLmRhdGVTdHlsZVxuICAgICAgICA6IGRlZmF1bHRzLmRhdGVTdHlsZSxcbiAgICBzaG93VGltZXpvbmU6IGJvb2woci5zaG93VGltZXpvbmUsIGRlZmF1bHRzLnNob3dUaW1lem9uZSksXG4gICAgc2hvd1Byb2dyZXNzOiBib29sKHByb2dyZXNzU291cmNlLCBkZWZhdWx0cy5zaG93UHJvZ3Jlc3MpLFxuICAgIGRlbnNpdHk6XG4gICAgICByLmRlbnNpdHkgPT09IFwiY29tZm9ydGFibGVcIiB8fCByLmRlbnNpdHkgPT09IFwiY29tcGFjdFwiXG4gICAgICAgID8gci5kZW5zaXR5XG4gICAgICAgIDogZGVmYXVsdHMuZGVuc2l0eSxcbiAgICBzaG93V29ybGRDbG9ja3M6IGJvb2woci5zaG93V29ybGRDbG9ja3MsIGRlZmF1bHRzLnNob3dXb3JsZENsb2NrcyksXG4gICAgd29ybGRDbG9ja3M6IHNhbml0aXplV29ybGRDbG9ja3Moci53b3JsZENsb2NrcyksXG4gICAgc2hvd1N0YXR1c0JhcjogYm9vbChyLnNob3dTdGF0dXNCYXIsIGRlZmF1bHRzLnNob3dTdGF0dXNCYXIpLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9TdG9yZWRTZXR0aW5ncyhzZXR0aW5nczogQ2hyb25vU2V0dGluZ3MpOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gIHJldHVybiB7IHNjaGVtYVZlcnNpb246IFNFVFRJTkdTX1ZFUlNJT04sIC4uLnNldHRpbmdzIH07XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBQbGF0Zm9ybSwgUGx1Z2luU2V0dGluZ1RhYiwgU2V0dGluZyB9IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IHR5cGUgQ2hyb25vUGx1Z2luIGZyb20gXCIuL21haW5cIjtcbmltcG9ydCB7IGdldERlZmF1bHRTZXR0aW5ncyB9IGZyb20gXCIuL3NldHRpbmdzXCI7XG5cbmV4cG9ydCBjbGFzcyBDaHJvbm9TZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIGFwcDogQXBwLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgY2hyb25vOiBDaHJvbm9QbHVnaW5cbiAgKSB7XG4gICAgc3VwZXIoYXBwLCBjaHJvbm8pO1xuICB9XG5cbiAgZGlzcGxheSgpOiB2b2lkIHtcbiAgICBjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGNvbnRhaW5lckVsLmVtcHR5KCk7XG4gICAgY29uc3Qgc2V0dGluZ3MgPSB0aGlzLmNocm9uby5zZXR0aW5ncztcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKFwiQ2xvY2tcIikuc2V0SGVhZGluZygpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZShcIkhvdXIgZm9ybWF0XCIpXG4gICAgICAuc2V0RGVzYyhcIlNob3cgdGhlIHRpbWUgaW4gMTItaG91ciBvciAyNC1ob3VyIG5vdGF0aW9uLlwiKVxuICAgICAgLmFkZERyb3Bkb3duKChkcm9wZG93bikgPT5cbiAgICAgICAgZHJvcGRvd25cbiAgICAgICAgICAuYWRkT3B0aW9uKFwiMTJcIiwgXCIxMi1ob3VyXCIpXG4gICAgICAgICAgLmFkZE9wdGlvbihcIjI0XCIsIFwiMjQtaG91clwiKVxuICAgICAgICAgIC5zZXRWYWx1ZShzZXR0aW5ncy5ob3VyRm9ybWF0KVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuY2hyb25vLnVwZGF0ZVNldHRpbmdzKHtcbiAgICAgICAgICAgICAgaG91ckZvcm1hdDogdmFsdWUgPT09IFwiMjRcIiA/IFwiMjRcIiA6IFwiMTJcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZShcIlNob3cgc2Vjb25kc1wiKVxuICAgICAgLnNldERlc2MoXCJEaXNwbGF5IHNlY29uZHMgb24geW91ciBjbG9jayBhbmQgb24gd29ybGQgY2xvY2tzLlwiKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGUuc2V0VmFsdWUoc2V0dGluZ3Muc2hvd1NlY29uZHMpLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgIGF3YWl0IHRoaXMuY2hyb25vLnVwZGF0ZVNldHRpbmdzKHsgc2hvd1NlY29uZHM6IHZhbHVlIH0pO1xuICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJTaG93IGRhdGVcIilcbiAgICAgIC5zZXREZXNjKFwiRGlzcGxheSB0aGUgd2Vla2RheSBhbmQgZGF0ZSBiZWxvdyB5b3VyIGNsb2NrLlwiKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGUuc2V0VmFsdWUoc2V0dGluZ3Muc2hvd0RhdGUpLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgIGF3YWl0IHRoaXMuY2hyb25vLnVwZGF0ZVNldHRpbmdzKHsgc2hvd0RhdGU6IHZhbHVlIH0pO1xuICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJEYXRlIHN0eWxlXCIpXG4gICAgICAuc2V0RGVzYyhcIkxvbmcgaW5jbHVkZXMgdGhlIHllYXIuIFNob3J0IGlzIG1vcmUgY29tcGFjdC5cIilcbiAgICAgIC5hZGREcm9wZG93bigoZHJvcGRvd24pID0+XG4gICAgICAgIGRyb3Bkb3duXG4gICAgICAgICAgLmFkZE9wdGlvbihcImxvbmdcIiwgXCJMb25nXCIpXG4gICAgICAgICAgLmFkZE9wdGlvbihcInNob3J0XCIsIFwiU2hvcnRcIilcbiAgICAgICAgICAuc2V0VmFsdWUoc2V0dGluZ3MuZGF0ZVN0eWxlKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuY2hyb25vLnVwZGF0ZVNldHRpbmdzKHtcbiAgICAgICAgICAgICAgZGF0ZVN0eWxlOiB2YWx1ZSA9PT0gXCJzaG9ydFwiID8gXCJzaG9ydFwiIDogXCJsb25nXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJTaG93IHRpbWUgem9uZVwiKVxuICAgICAgLnNldERlc2MoXCJEaXNwbGF5IHlvdXIgdGltZSB6b25lIG5hbWUgYW5kIFVUQyBvZmZzZXQgdW5kZXIgeW91ciBjbG9jay5cIilcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlLnNldFZhbHVlKHNldHRpbmdzLnNob3dUaW1lem9uZSkub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5jaHJvbm8udXBkYXRlU2V0dGluZ3MoeyBzaG93VGltZXpvbmU6IHZhbHVlIH0pO1xuICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJTaG93IGRheSBwcm9ncmVzc1wiKVxuICAgICAgLnNldERlc2MoXCJBIHRoaW4gbGluZSBzaG93aW5nIGhvdyBtdWNoIG9mIHRoZSBkYXkgaGFzIHBhc3NlZC5cIilcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlLnNldFZhbHVlKHNldHRpbmdzLnNob3dQcm9ncmVzcykub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5jaHJvbm8udXBkYXRlU2V0dGluZ3MoeyBzaG93UHJvZ3Jlc3M6IHZhbHVlIH0pO1xuICAgICAgICB9KVxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJEZW5zaXR5XCIpXG4gICAgICAuc2V0RGVzYyhcIkNvbXBhY3QgcmVkdWNlcyBzcGFjaW5nIGFuZCBzdWl0cyBuYXJyb3cgc2lkZWJhcnMuXCIpXG4gICAgICAuYWRkRHJvcGRvd24oKGRyb3Bkb3duKSA9PlxuICAgICAgICBkcm9wZG93blxuICAgICAgICAgIC5hZGRPcHRpb24oXCJjb21mb3J0YWJsZVwiLCBcIkNvbWZvcnRhYmxlXCIpXG4gICAgICAgICAgLmFkZE9wdGlvbihcImNvbXBhY3RcIiwgXCJDb21wYWN0XCIpXG4gICAgICAgICAgLnNldFZhbHVlKHNldHRpbmdzLmRlbnNpdHkpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5jaHJvbm8udXBkYXRlU2V0dGluZ3Moe1xuICAgICAgICAgICAgICBkZW5zaXR5OiB2YWx1ZSA9PT0gXCJjb21wYWN0XCIgPyBcImNvbXBhY3RcIiA6IFwiY29tZm9ydGFibGVcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoXCJXb3JsZCBjbG9ja3NcIikuc2V0SGVhZGluZygpO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZShcIlNob3cgd29ybGQgY2xvY2tzXCIpXG4gICAgICAuc2V0RGVzYyhcbiAgICAgICAgXCJTaG93IHRoZSBsaXN0IG9mIHNhdmVkIGNpdGllcyBpbiB0aGUgY2xvY2sgdmlldy4gQWRkIGFuZCBhcnJhbmdlIGNpdGllcyBmcm9tIHRoZSBjbG9jayB2aWV3IGl0c2VsZi5cIlxuICAgICAgKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGUuc2V0VmFsdWUoc2V0dGluZ3Muc2hvd1dvcmxkQ2xvY2tzKS5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICBhd2FpdCB0aGlzLmNocm9uby51cGRhdGVTZXR0aW5ncyh7IHNob3dXb3JsZENsb2NrczogdmFsdWUgfSk7XG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoXCJTdGF0dXMgYmFyXCIpLnNldEhlYWRpbmcoKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoXCJTaG93IGNsb2NrIGluIHN0YXR1cyBiYXJcIilcbiAgICAgIC5zZXREZXNjKFxuICAgICAgICBQbGF0Zm9ybS5pc01vYmlsZVxuICAgICAgICAgID8gXCJUaGUgc3RhdHVzIGJhciBpcyBub3QgYXZhaWxhYmxlIG9uIG1vYmlsZS5cIlxuICAgICAgICAgIDogXCJLZWVwIGEgc21hbGwgY2xvY2sgaW4gdGhlIHN0YXR1cyBiYXIuIFNlbGVjdCBpdCB0byBvcGVuIHRoZSBjbG9jayB2aWV3LlwiXG4gICAgICApXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgIHRvZ2dsZVxuICAgICAgICAgIC5zZXRWYWx1ZShzZXR0aW5ncy5zaG93U3RhdHVzQmFyKVxuICAgICAgICAgIC5zZXREaXNhYmxlZChQbGF0Zm9ybS5pc01vYmlsZSlcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmNocm9uby51cGRhdGVTZXR0aW5ncyh7IHNob3dTdGF0dXNCYXI6IHZhbHVlIH0pO1xuICAgICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLnNldE5hbWUoXCJEZWZhdWx0c1wiKS5zZXRIZWFkaW5nKCk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKFwiUmVzdG9yZSBkZWZhdWx0c1wiKVxuICAgICAgLnNldERlc2MoXCJSZXNldHMgZXZlcnkgb3B0aW9uIG9uIHRoaXMgcGFnZS4gWW91ciBzYXZlZCB3b3JsZCBjbG9ja3MgYXJlIGtlcHQuXCIpXG4gICAgICAuYWRkQnV0dG9uKChidXR0b24pID0+XG4gICAgICAgIGJ1dHRvbi5zZXRCdXR0b25UZXh0KFwiUmVzdG9yZSBkZWZhdWx0c1wiKS5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBhd2FpdCB0aGlzLmNocm9uby51cGRhdGVTZXR0aW5ncyh7XG4gICAgICAgICAgICAuLi5nZXREZWZhdWx0U2V0dGluZ3MoKSxcbiAgICAgICAgICAgIHdvcmxkQ2xvY2tzOiB0aGlzLmNocm9uby5zZXR0aW5ncy53b3JsZENsb2NrcyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICB0aGlzLmRpc3BsYXkoKTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gIH1cbn1cbiIsICJpbXBvcnQgdHlwZSBDaHJvbm9QbHVnaW4gZnJvbSBcIi4vbWFpblwiO1xuaW1wb3J0IHR5cGUgeyBDbG9ja1NuYXBzaG90IH0gZnJvbSBcIi4vY2xvY2tcIjtcblxuLyoqIE9wdGlvbmFsIGNsb2NrIGluIE9ic2lkaWFuJ3Mgc3RhdHVzIGJhci4gQ2xpY2sgdG8gb3BlbiB0aGUgZnVsbCB2aWV3LiAqL1xuZXhwb3J0IGNsYXNzIFN0YXR1c0JhckNsb2NrIHtcbiAgcHJpdmF0ZSByZWFkb25seSBlbDogSFRNTEVsZW1lbnQ7XG4gIHByaXZhdGUgdW5zdWJzY3JpYmU6ICgoKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGxhc3RUZXh0ID0gXCJcIjtcbiAgcHJpdmF0ZSBsYXN0TGFiZWwgPSBcIlwiO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgY2hyb25vOiBDaHJvbm9QbHVnaW4pIHtcbiAgICB0aGlzLmVsID0gY2hyb25vLmFkZFN0YXR1c0Jhckl0ZW0oKTtcbiAgICB0aGlzLmVsLmFkZENsYXNzKFwiY2hyb25vLXN0YXR1c2JhclwiKTtcbiAgICB0aGlzLmVsLnNldEF0dHIoXCJyb2xlXCIsIFwiYnV0dG9uXCIpO1xuICAgIHRoaXMuZWwuc2V0QXR0cihcInRhYmluZGV4XCIsIFwiMFwiKTtcbiAgICB0aGlzLmVsLnNldEF0dHIoXCJkYXRhLXRvb2x0aXAtcG9zaXRpb25cIiwgXCJ0b3BcIik7XG5cbiAgICBjaHJvbm8ucmVnaXN0ZXJEb21FdmVudCh0aGlzLmVsLCBcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIHZvaWQgY2hyb25vLmFjdGl2YXRlVmlldygpO1xuICAgIH0pO1xuICAgIGNocm9uby5yZWdpc3RlckRvbUV2ZW50KHRoaXMuZWwsIFwia2V5ZG93blwiLCAoZXZ0OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZ0LmtleSA9PT0gXCJFbnRlclwiIHx8IGV2dC5rZXkgPT09IFwiIFwiKSB7XG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2b2lkIGNocm9uby5hY3RpdmF0ZVZpZXcoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuYXBwbHlTZXR0aW5ncygpO1xuICB9XG5cbiAgLyoqIFNob3dzIG9yIGhpZGVzIHRoZSBpdGVtLCBhbmQgb25seSBzdWJzY3JpYmVzIHRvIHRpY2tzIHdoaWxlIHZpc2libGUuICovXG4gIGFwcGx5U2V0dGluZ3MoKTogdm9pZCB7XG4gICAgY29uc3QgdmlzaWJsZSA9IHRoaXMuY2hyb25vLnNldHRpbmdzLnNob3dTdGF0dXNCYXI7XG4gICAgdGhpcy5lbC50b2dnbGVDbGFzcyhcImNocm9uby1pcy1oaWRkZW5cIiwgIXZpc2libGUpO1xuXG4gICAgaWYgKHZpc2libGUpIHtcbiAgICAgIHRoaXMucmVuZGVyKHRoaXMuY2hyb25vLmVuZ2luZS5zbmFwc2hvdCgpKTtcbiAgICAgIGlmICghdGhpcy51bnN1YnNjcmliZSkge1xuICAgICAgICB0aGlzLnVuc3Vic2NyaWJlID0gdGhpcy5jaHJvbm8uZW5naW5lLnN1YnNjcmliZSgoc25hcHNob3QpID0+XG4gICAgICAgICAgdGhpcy5yZW5kZXIoc25hcHNob3QpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudW5zdWJzY3JpYmU/LigpO1xuICAgICAgdGhpcy51bnN1YnNjcmliZSA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLnVuc3Vic2NyaWJlPy4oKTtcbiAgICB0aGlzLnVuc3Vic2NyaWJlID0gbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyKHNuYXBzaG90OiBDbG9ja1NuYXBzaG90KTogdm9pZCB7XG4gICAgaWYgKHNuYXBzaG90LnN0YXR1c1RleHQgIT09IHRoaXMubGFzdFRleHQpIHtcbiAgICAgIHRoaXMuZWwuc2V0VGV4dChzbmFwc2hvdC5zdGF0dXNUZXh0KTtcbiAgICAgIHRoaXMubGFzdFRleHQgPSBzbmFwc2hvdC5zdGF0dXNUZXh0O1xuICAgIH1cbiAgICBpZiAoc25hcHNob3QubGFiZWwgIT09IHRoaXMubGFzdExhYmVsKSB7XG4gICAgICB0aGlzLmVsLnNldEF0dHIoXCJhcmlhLWxhYmVsXCIsIHNuYXBzaG90LmxhYmVsKTtcbiAgICAgIHRoaXMubGFzdExhYmVsID0gc25hcHNob3QubGFiZWw7XG4gICAgfVxuICB9XG59XG4iLCAiaW1wb3J0IHsgSXRlbVZpZXcsIE5vdGljZSwgc2V0SWNvbiwgV29ya3NwYWNlTGVhZiB9IGZyb20gXCJvYnNpZGlhblwiO1xuaW1wb3J0IHR5cGUgQ2hyb25vUGx1Z2luIGZyb20gXCIuL21haW5cIjtcbmltcG9ydCB0eXBlIHsgQ2xvY2tTbmFwc2hvdCwgV29ybGRSZWFkaW5nIH0gZnJvbSBcIi4vY2xvY2tcIjtcbmltcG9ydCB7IE1BWF9XT1JMRF9DTE9DS1MsIFZJRVdfVFlQRV9DSFJPTk8gfSBmcm9tIFwiLi9jb25zdGFudHNcIjtcbmltcG9ydCB7IENpdHlQaWNrZXJNb2RhbCB9IGZyb20gXCIuL2NpdHlQaWNrZXJcIjtcbmltcG9ydCB0eXBlIHsgV29ybGRDbG9ja0VudHJ5IH0gZnJvbSBcIi4vc2V0dGluZ3NcIjtcbmltcG9ydCB7XG4gIGFkZFdvcmxkQ2xvY2ssXG4gIG1vdmVXb3JsZENsb2NrLFxuICByZW1vdmVXb3JsZENsb2NrLFxufSBmcm9tIFwiLi93b3JsZENsb2NrTGlzdFwiO1xuaW1wb3J0IHR5cGUgeyBDaXR5T3B0aW9uIH0gZnJvbSBcIi4vdGltZVpvbmVzXCI7XG5cbnR5cGUgUm93QWN0aW9uID0gXCJ1cFwiIHwgXCJkb3duXCIgfCBcInJlbW92ZVwiO1xuXG5pbnRlcmZhY2UgV29ybGRSb3cge1xuICByb3c6IEhUTUxFbGVtZW50O1xuICB0aW1lOiBIVE1MRWxlbWVudDtcbiAgcGVyaW9kOiBIVE1MRWxlbWVudDtcbiAgZGF5OiBIVE1MRWxlbWVudDtcbiAgbWV0YTogSFRNTEVsZW1lbnQ7XG4gIGJ1dHRvbnM6IFJlY29yZDxSb3dBY3Rpb24sIEhUTUxCdXR0b25FbGVtZW50Pjtcbn1cblxuaW50ZXJmYWNlIExvY2FsRWxlbWVudHMge1xuICB6b25lOiBIVE1MRWxlbWVudDtcbiAgem9uZU5hbWU6IEhUTUxFbGVtZW50O1xuICB6b25lT2Zmc2V0OiBIVE1MRWxlbWVudDtcbiAgY2xvY2s6IEhUTUxFbGVtZW50O1xuICBob3VyOiBIVE1MRWxlbWVudDtcbiAgbWludXRlOiBIVE1MRWxlbWVudDtcbiAgc2Vjb25kczogSFRNTEVsZW1lbnQ7XG4gIHNlY29uZDogSFRNTEVsZW1lbnQ7XG4gIHBlcmlvZDogSFRNTEVsZW1lbnQ7XG4gIHByb2dyZXNzOiBIVE1MRWxlbWVudDtcbiAgcHJvZ3Jlc3NGaWxsOiBIVE1MRWxlbWVudDtcbiAgZGF0ZTogSFRNTEVsZW1lbnQ7XG4gIHdlZWtkYXk6IEhUTUxFbGVtZW50O1xuICBkYXRldGV4dDogSFRNTEVsZW1lbnQ7XG59XG5cbmludGVyZmFjZSBWaWV3RWxlbWVudHMge1xuICByb290OiBIVE1MRWxlbWVudDtcbiAgbG9jYWw6IExvY2FsRWxlbWVudHM7XG4gIHdvcmxkU2VjdGlvbjogSFRNTEVsZW1lbnQ7XG4gIGFkZEJ1dHRvbjogSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gIHdvcmxkTGlzdDogSFRNTEVsZW1lbnQ7XG4gIGVtcHR5OiBIVE1MRWxlbWVudDtcbiAgZW1wdHlBZGQ6IEhUTUxCdXR0b25FbGVtZW50O1xufVxuXG4vKiogT25seSB3cml0ZXMgdG8gdGhlIERPTSB3aGVuIHRoZSB0ZXh0IGFjdHVhbGx5IGNoYW5nZWQuICovXG5mdW5jdGlvbiB3cml0ZVRleHQoZWw6IEhUTUxFbGVtZW50LCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gIGlmIChlbC50ZXh0Q29udGVudCAhPT0gdmFsdWUpIGVsLnRleHRDb250ZW50ID0gdmFsdWU7XG59XG5cbmNvbnN0IFJPV19BQ1RJT05TOiB7IGFjdGlvbjogUm93QWN0aW9uOyBpY29uOiBzdHJpbmc7IGxhYmVsOiBzdHJpbmcgfVtdID0gW1xuICB7IGFjdGlvbjogXCJ1cFwiLCBpY29uOiBcImNoZXZyb24tdXBcIiwgbGFiZWw6IFwiTW92ZSB1cFwiIH0sXG4gIHsgYWN0aW9uOiBcImRvd25cIiwgaWNvbjogXCJjaGV2cm9uLWRvd25cIiwgbGFiZWw6IFwiTW92ZSBkb3duXCIgfSxcbiAgeyBhY3Rpb246IFwicmVtb3ZlXCIsIGljb246IFwieFwiLCBsYWJlbDogXCJSZW1vdmVcIiB9LFxuXTtcblxuZXhwb3J0IGNsYXNzIENocm9ub1ZpZXcgZXh0ZW5kcyBJdGVtVmlldyB7XG4gIHByaXZhdGUgZWxzOiBWaWV3RWxlbWVudHMgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSByb3dzID0gbmV3IE1hcDxzdHJpbmcsIFdvcmxkUm93PigpO1xuICBwcml2YXRlIHJvd0tleSA9IFwiXCI7XG4gIHByaXZhdGUgdW5zdWJzY3JpYmU6ICgoKSA9PiB2b2lkKSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGxhc3RMYWJlbCA9IFwiXCI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbGVhZjogV29ya3NwYWNlTGVhZixcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNocm9ubzogQ2hyb25vUGx1Z2luXG4gICkge1xuICAgIHN1cGVyKGxlYWYpO1xuICB9XG5cbiAgZ2V0Vmlld1R5cGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gVklFV19UWVBFX0NIUk9OTztcbiAgfVxuXG4gIGdldERpc3BsYXlUZXh0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFwiQ2hyb25vXCI7XG4gIH1cblxuICBnZXRJY29uKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIFwiY2xvY2tcIjtcbiAgfVxuXG4gIGFzeW5jIG9uT3BlbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLmNvbnRlbnRFbC5lbXB0eSgpO1xuICAgIHRoaXMuY29udGVudEVsLmFkZENsYXNzKFwiY2hyb25vLXJvb3RcIik7XG4gICAgdGhpcy5lbHMgPSB0aGlzLmJ1aWxkKHRoaXMuY29udGVudEVsLmNyZWF0ZURpdih7IGNsczogXCJjaHJvbm8tdmlld1wiIH0pKTtcbiAgICB0aGlzLmFwcGx5U2V0dGluZ3MoKTtcblxuICAgIHRoaXMudW5zdWJzY3JpYmUgPSB0aGlzLmNocm9uby5lbmdpbmUuc3Vic2NyaWJlKChzbmFwc2hvdCkgPT4ge1xuICAgICAgLy8gU2tpcCBET00gd29yayB3aGlsZSB0aGUgdGFiIGlzIGluIHRoZSBiYWNrZ3JvdW5kLlxuICAgICAgaWYgKHRoaXMuY29udGFpbmVyRWwuaXNTaG93bigpKSB0aGlzLnJlbmRlcihzbmFwc2hvdCk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBvbkNsb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMudW5zdWJzY3JpYmU/LigpO1xuICAgIHRoaXMudW5zdWJzY3JpYmUgPSBudWxsO1xuICAgIHRoaXMucm93cy5jbGVhcigpO1xuICAgIHRoaXMucm93S2V5ID0gXCJcIjtcbiAgICB0aGlzLmxhc3RMYWJlbCA9IFwiXCI7XG4gICAgdGhpcy5lbHMgPSBudWxsO1xuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XG4gIH1cblxuICAvKiogU3luY3MgbGF5b3V0IHdpdGggdGhlIGN1cnJlbnQgc2V0dGluZ3MsIHRoZW4gcmVkcmF3cy4gKi9cbiAgYXBwbHlTZXR0aW5ncygpOiB2b2lkIHtcbiAgICBjb25zdCBlID0gdGhpcy5lbHM7XG4gICAgaWYgKCFlKSByZXR1cm47XG4gICAgY29uc3Qgc2V0dGluZ3MgPSB0aGlzLmNocm9uby5zZXR0aW5ncztcblxuICAgIGUucm9vdC50b2dnbGVDbGFzcyhcImlzLWNvbXBhY3RcIiwgc2V0dGluZ3MuZGVuc2l0eSA9PT0gXCJjb21wYWN0XCIpO1xuXG4gICAgZS5sb2NhbC5jbG9jay5zZXRBdHRyKFwiZGF0YS1zZWNvbmRzXCIsIFN0cmluZyhzZXR0aW5ncy5zaG93U2Vjb25kcykpO1xuICAgIGUubG9jYWwuc2Vjb25kcy50b2dnbGVDbGFzcyhcImNocm9uby1pcy1oaWRkZW5cIiwgIXNldHRpbmdzLnNob3dTZWNvbmRzKTtcbiAgICBlLmxvY2FsLnpvbmUudG9nZ2xlQ2xhc3MoXCJjaHJvbm8taXMtaGlkZGVuXCIsICFzZXR0aW5ncy5zaG93VGltZXpvbmUpO1xuICAgIGUubG9jYWwucHJvZ3Jlc3MudG9nZ2xlQ2xhc3MoXCJjaHJvbm8taXMtaGlkZGVuXCIsICFzZXR0aW5ncy5zaG93UHJvZ3Jlc3MpO1xuICAgIGUubG9jYWwuZGF0ZS50b2dnbGVDbGFzcyhcImNocm9uby1pcy1oaWRkZW5cIiwgIXNldHRpbmdzLnNob3dEYXRlKTtcblxuICAgIGUud29ybGRTZWN0aW9uLnRvZ2dsZUNsYXNzKFwiY2hyb25vLWlzLWhpZGRlblwiLCAhc2V0dGluZ3Muc2hvd1dvcmxkQ2xvY2tzKTtcbiAgICB0aGlzLnN5bmNXb3JsZFJvd3MoKTtcblxuICAgIHRoaXMucmVuZGVyKHRoaXMuY2hyb25vLmVuZ2luZS5zbmFwc2hvdCgpKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyKHNuYXBzaG90OiBDbG9ja1NuYXBzaG90KTogdm9pZCB7XG4gICAgY29uc3QgZSA9IHRoaXMuZWxzO1xuICAgIGlmICghZSkgcmV0dXJuO1xuICAgIGNvbnN0IHNldHRpbmdzID0gdGhpcy5jaHJvbm8uc2V0dGluZ3M7XG4gICAgY29uc3QgbG9jYWwgPSBzbmFwc2hvdC5sb2NhbDtcblxuICAgIHdyaXRlVGV4dChlLmxvY2FsLmhvdXIsIGxvY2FsLmhvdXIpO1xuICAgIHdyaXRlVGV4dChlLmxvY2FsLm1pbnV0ZSwgbG9jYWwubWludXRlKTtcbiAgICB3cml0ZVRleHQoZS5sb2NhbC5zZWNvbmQsIGxvY2FsLnNlY29uZCk7XG4gICAgd3JpdGVUZXh0KGUubG9jYWwucGVyaW9kLCBsb2NhbC5wZXJpb2QpO1xuICAgIGUubG9jYWwucGVyaW9kLnRvZ2dsZUNsYXNzKFwiY2hyb25vLWlzLWhpZGRlblwiLCBsb2NhbC5wZXJpb2QgPT09IFwiXCIpO1xuXG4gICAgd3JpdGVUZXh0KGUubG9jYWwuem9uZU5hbWUsIGxvY2FsLnpvbmVOYW1lKTtcbiAgICB3cml0ZVRleHQoZS5sb2NhbC56b25lT2Zmc2V0LCBsb2NhbC5vZmZzZXQpO1xuICAgIHdyaXRlVGV4dChlLmxvY2FsLndlZWtkYXksIGxvY2FsLndlZWtkYXkpO1xuICAgIHdyaXRlVGV4dChlLmxvY2FsLmRhdGV0ZXh0LCBsb2NhbC5kYXRlKTtcbiAgICBlLmxvY2FsLnByb2dyZXNzRmlsbC5zZXRDc3NQcm9wcyh7XG4gICAgICBcIi0tY2hyb25vLXByb2dyZXNzXCI6IHNuYXBzaG90LmRheVByb2dyZXNzLnRvRml4ZWQoNSksXG4gICAgfSk7XG5cbiAgICBpZiAoc25hcHNob3QubGFiZWwgIT09IHRoaXMubGFzdExhYmVsKSB7XG4gICAgICBlLmxvY2FsLmNsb2NrLnNldEF0dHIoXCJhcmlhLWxhYmVsXCIsIHNuYXBzaG90LmxhYmVsKTtcbiAgICAgIHRoaXMubGFzdExhYmVsID0gc25hcHNob3QubGFiZWw7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCB3b3JsZCBvZiBzbmFwc2hvdC53b3JsZHMpIHtcbiAgICAgIGNvbnN0IHJvdyA9IHRoaXMucm93cy5nZXQod29ybGQuem9uZSk7XG4gICAgICBpZiAocm93KSB0aGlzLnJlbmRlcldvcmxkKHJvdywgd29ybGQsIHNldHRpbmdzLnNob3dTZWNvbmRzKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlbmRlcldvcmxkKHJvdzogV29ybGRSb3csIHdvcmxkOiBXb3JsZFJlYWRpbmcsIHNob3dTZWNvbmRzOiBib29sZWFuKTogdm9pZCB7XG4gICAgY29uc3QgY29yZSA9IGAke3dvcmxkLmhvdXJ9OiR7d29ybGQubWludXRlfWA7XG4gICAgd3JpdGVUZXh0KHJvdy50aW1lLCBzaG93U2Vjb25kcyA/IGAke2NvcmV9OiR7d29ybGQuc2Vjb25kfWAgOiBjb3JlKTtcbiAgICB3cml0ZVRleHQocm93LnBlcmlvZCwgd29ybGQucGVyaW9kKTtcbiAgICByb3cucGVyaW9kLnRvZ2dsZUNsYXNzKFwiY2hyb25vLWlzLWhpZGRlblwiLCB3b3JsZC5wZXJpb2QgPT09IFwiXCIpO1xuXG4gICAgY29uc3QgZGF5V29yZCA9XG4gICAgICB3b3JsZC5kYXlPZmZzZXQgPT09IDEgPyBcIlRvbW9ycm93XCIgOiB3b3JsZC5kYXlPZmZzZXQgPT09IC0xID8gXCJZZXN0ZXJkYXlcIiA6IFwiXCI7XG4gICAgd3JpdGVUZXh0KHJvdy5kYXksIGRheVdvcmQpO1xuICAgIHJvdy5kYXkudG9nZ2xlQ2xhc3MoXCJjaHJvbm8taXMtaGlkZGVuXCIsIGRheVdvcmQgPT09IFwiXCIpO1xuICAgIHdyaXRlVGV4dChyb3cubWV0YSwgYCR7d29ybGQud2Vla2RheX0sICR7d29ybGQuZGF0ZX0gXHUwMEI3ICR7d29ybGQub2Zmc2V0fWApO1xuICB9XG5cbiAgLyoqIFJlYnVpbGRzIHRoZSBsaXN0IG9ubHkgd2hlbiB0aGUgc2V0IG9yIG9yZGVyIG9mIHNhdmVkIHpvbmVzIGNoYW5nZXMuICovXG4gIHByaXZhdGUgc3luY1dvcmxkUm93cygpOiB2b2lkIHtcbiAgICBjb25zdCBlID0gdGhpcy5lbHM7XG4gICAgaWYgKCFlKSByZXR1cm47XG4gICAgY29uc3Qgd29ybGRzID0gdGhpcy5jaHJvbm8uc2V0dGluZ3Mud29ybGRDbG9ja3M7XG4gICAgY29uc3Qga2V5ID0gd29ybGRzLm1hcCgod29ybGQpID0+IHdvcmxkLnpvbmUpLmpvaW4oXCJ8XCIpO1xuICAgIGlmIChrZXkgPT09IHRoaXMucm93S2V5KSByZXR1cm47XG4gICAgdGhpcy5yb3dLZXkgPSBrZXk7XG5cbiAgICBlLndvcmxkTGlzdC5lbXB0eSgpO1xuICAgIHRoaXMucm93cy5jbGVhcigpO1xuICAgIGZvciAoY29uc3Qgd29ybGQgb2Ygd29ybGRzKSB7XG4gICAgICB0aGlzLnJvd3Muc2V0KHdvcmxkLnpvbmUsIHRoaXMuYnVpbGRSb3coZS53b3JsZExpc3QsIHdvcmxkKSk7XG4gICAgfVxuICAgIGUuZW1wdHkudG9nZ2xlQ2xhc3MoXCJjaHJvbm8taXMtaGlkZGVuXCIsIHdvcmxkcy5sZW5ndGggPiAwKTtcbiAgICBlLndvcmxkTGlzdC50b2dnbGVDbGFzcyhcImNocm9uby1pcy1oaWRkZW5cIiwgd29ybGRzLmxlbmd0aCA9PT0gMCk7XG4gICAgZS5hZGRCdXR0b24udG9nZ2xlQ2xhc3MoXCJjaHJvbm8taXMtaGlkZGVuXCIsIHdvcmxkcy5sZW5ndGggPT09IDApO1xuICB9XG5cbiAgcHJpdmF0ZSBidWlsZFJvdyhsaXN0OiBIVE1MRWxlbWVudCwgd29ybGQ6IFdvcmxkQ2xvY2tFbnRyeSk6IFdvcmxkUm93IHtcbiAgICBjb25zdCByb3cgPSBsaXN0LmNyZWF0ZUVsKFwibGlcIiwgeyBjbHM6IFwiY2hyb25vLXdvcmxkLXJvd1wiIH0pO1xuXG4gICAgY29uc3QgaW5mbyA9IHJvdy5jcmVhdGVEaXYoeyBjbHM6IFwiY2hyb25vLXdvcmxkLWluZm9cIiB9KTtcbiAgICBjb25zdCBuYW1lTGluZSA9IGluZm8uY3JlYXRlRGl2KHsgY2xzOiBcImNocm9uby13b3JsZC1uYW1lXCIgfSk7XG4gICAgbmFtZUxpbmUuY3JlYXRlU3Bhbih7IGNsczogXCJjaHJvbm8td29ybGQtdGl0bGVcIiwgdGV4dDogd29ybGQubmFtZSB9KTtcbiAgICBjb25zdCBkYXkgPSBuYW1lTGluZS5jcmVhdGVTcGFuKHsgY2xzOiBbXCJjaHJvbm8td29ybGQtZGF5XCIsIFwiY2hyb25vLWlzLWhpZGRlblwiXSB9KTtcbiAgICBjb25zdCBtZXRhID0gaW5mby5jcmVhdGVEaXYoeyBjbHM6IFwiY2hyb25vLXdvcmxkLW1ldGFcIiB9KTtcblxuICAgIGNvbnN0IHRpbWUgPSByb3cuY3JlYXRlRGl2KHsgY2xzOiBcImNocm9uby13b3JsZC10aW1lXCIgfSk7XG4gICAgY29uc3QgdGltZVRleHQgPSB0aW1lLmNyZWF0ZVNwYW4oeyBjbHM6IFwiY2hyb25vLXdvcmxkLWNsb2NrXCIgfSk7XG4gICAgY29uc3QgcGVyaW9kID0gdGltZS5jcmVhdGVTcGFuKHsgY2xzOiBcImNocm9uby13b3JsZC1wZXJpb2RcIiB9KTtcblxuICAgIGNvbnN0IGFjdGlvbnMgPSByb3cuY3JlYXRlRGl2KHsgY2xzOiBcImNocm9uby13b3JsZC1hY3Rpb25zXCIgfSk7XG4gICAgY29uc3QgYnV0dG9ucyA9IHt9IGFzIFJlY29yZDxSb3dBY3Rpb24sIEhUTUxCdXR0b25FbGVtZW50PjtcbiAgICBmb3IgKGNvbnN0IHsgYWN0aW9uLCBpY29uLCBsYWJlbCB9IG9mIFJPV19BQ1RJT05TKSB7XG4gICAgICBjb25zdCBidXR0b24gPSBhY3Rpb25zLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcbiAgICAgICAgY2xzOiBcImNocm9uby1pY29uLWJ1dHRvblwiLFxuICAgICAgICBhdHRyOiB7IHR5cGU6IFwiYnV0dG9uXCIsIFwiYXJpYS1sYWJlbFwiOiBgJHtsYWJlbH0gJHt3b3JsZC5uYW1lfWAgfSxcbiAgICAgIH0pO1xuICAgICAgc2V0SWNvbihidXR0b24sIGljb24pO1xuICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgIHZvaWQgdGhpcy5oYW5kbGVSb3dBY3Rpb24od29ybGQuem9uZSwgYWN0aW9uKTtcbiAgICAgIH0pO1xuICAgICAgYnV0dG9uc1thY3Rpb25dID0gYnV0dG9uO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICByb3csXG4gICAgICB0aW1lOiB0aW1lVGV4dCxcbiAgICAgIHBlcmlvZCxcbiAgICAgIGRheSxcbiAgICAgIG1ldGEsXG4gICAgICBidXR0b25zLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIGhhbmRsZVJvd0FjdGlvbih6b25lOiBzdHJpbmcsIGFjdGlvbjogUm93QWN0aW9uKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgbGlzdCA9IHRoaXMuY2hyb25vLnNldHRpbmdzLndvcmxkQ2xvY2tzO1xuICAgIGNvbnN0IG5leHQgPVxuICAgICAgYWN0aW9uID09PSBcInJlbW92ZVwiXG4gICAgICAgID8gcmVtb3ZlV29ybGRDbG9jayhsaXN0LCB6b25lKVxuICAgICAgICA6IG1vdmVXb3JsZENsb2NrKGxpc3QsIHpvbmUsIGFjdGlvbiA9PT0gXCJ1cFwiID8gLTEgOiAxKTtcbiAgICBhd2FpdCB0aGlzLmNocm9uby51cGRhdGVTZXR0aW5ncyh7IHdvcmxkQ2xvY2tzOiBuZXh0IH0pO1xuICAgIHRoaXMuZm9jdXNBZnRlckFjdGlvbih6b25lLCBhY3Rpb24pO1xuICB9XG5cbiAgLyoqIEtlZXBzIGtleWJvYXJkIGZvY3VzIG9uIGEgc2Vuc2libGUgY29udHJvbCBhZnRlciB0aGUgbGlzdCBpcyByZWRyYXduLiAqL1xuICBwcml2YXRlIGZvY3VzQWZ0ZXJBY3Rpb24oem9uZTogc3RyaW5nLCBhY3Rpb246IFJvd0FjdGlvbik6IHZvaWQge1xuICAgIGNvbnN0IGUgPSB0aGlzLmVscztcbiAgICBpZiAoIWUpIHJldHVybjtcbiAgICBjb25zdCByb3cgPSB0aGlzLnJvd3MuZ2V0KHpvbmUpO1xuICAgIGlmIChhY3Rpb24gIT09IFwicmVtb3ZlXCIgJiYgcm93KSB7XG4gICAgICByb3cuYnV0dG9uc1thY3Rpb25dLmZvY3VzKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGhhc1dvcmxkcyA9IHRoaXMuY2hyb25vLnNldHRpbmdzLndvcmxkQ2xvY2tzLmxlbmd0aCA+IDA7XG4gICAgKGhhc1dvcmxkcyA/IGUuYWRkQnV0dG9uIDogZS5lbXB0eUFkZCkuZm9jdXMoKTtcbiAgfVxuXG4gIHByaXZhdGUgYWRkQ2l0eShjaXR5OiBDaXR5T3B0aW9uKTogdm9pZCB7XG4gICAgY29uc3QgbGlzdCA9IHRoaXMuY2hyb25vLnNldHRpbmdzLndvcmxkQ2xvY2tzO1xuICAgIGlmIChsaXN0Lmxlbmd0aCA+PSBNQVhfV09STERfQ0xPQ0tTKSB7XG4gICAgICBuZXcgTm90aWNlKGBZb3UgY2FuIHNhdmUgdXAgdG8gJHtNQVhfV09STERfQ0xPQ0tTfSB3b3JsZCBjbG9ja3MuYCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG5leHQgPSBhZGRXb3JsZENsb2NrKGxpc3QsIHsgem9uZTogY2l0eS56b25lLCBuYW1lOiBjaXR5Lm5hbWUgfSk7XG4gICAgdm9pZCB0aGlzLmNocm9uby51cGRhdGVTZXR0aW5ncyh7IHdvcmxkQ2xvY2tzOiBuZXh0IH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBvcGVuUGlja2VyKCk6IHZvaWQge1xuICAgIGNvbnN0IHRha2VuID0gbmV3IFNldCh0aGlzLmNocm9uby5zZXR0aW5ncy53b3JsZENsb2Nrcy5tYXAoKHcpID0+IHcuem9uZSkpO1xuICAgIG5ldyBDaXR5UGlja2VyTW9kYWwodGhpcy5hcHAsIHRha2VuLCAoY2l0eSkgPT4gdGhpcy5hZGRDaXR5KGNpdHkpKS5vcGVuKCk7XG4gIH1cblxuICBwcml2YXRlIGJ1aWxkKHJvb3Q6IEhUTUxFbGVtZW50KTogVmlld0VsZW1lbnRzIHtcbiAgICAvLyAtLS0tIFRoaXMgZGV2aWNlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGNvbnN0IGxvY2FsID0gcm9vdC5jcmVhdGVEaXYoeyBjbHM6IFwiY2hyb25vLWxvY2FsXCIgfSk7XG4gICAgY29uc3Qgem9uZSA9IGxvY2FsLmNyZWF0ZURpdih7IGNsczogXCJjaHJvbm8tbG9jYWwtem9uZVwiIH0pO1xuICAgIGNvbnN0IHpvbmVOYW1lID0gem9uZS5jcmVhdGVTcGFuKHsgY2xzOiBcImNocm9uby16b25lLW5hbWVcIiB9KTtcbiAgICB6b25lLmNyZWF0ZVNwYW4oeyBjbHM6IFwiY2hyb25vLXpvbmUtc2VwXCIsIHRleHQ6IFwiXHUwMEI3XCIsIGF0dHI6IHsgXCJhcmlhLWhpZGRlblwiOiBcInRydWVcIiB9IH0pO1xuICAgIGNvbnN0IHpvbmVPZmZzZXQgPSB6b25lLmNyZWF0ZVNwYW4oeyBjbHM6IFwiY2hyb25vLXpvbmUtb2Zmc2V0XCIgfSk7XG5cbiAgICBjb25zdCBjbG9jayA9IGxvY2FsLmNyZWF0ZURpdih7XG4gICAgICBjbHM6IFwiY2hyb25vLWNsb2NrXCIsXG4gICAgICBhdHRyOiB7IHJvbGU6IFwidGltZXJcIiB9LFxuICAgIH0pO1xuICAgIGNvbnN0IGRpZ2l0cyA9IGNsb2NrLmNyZWF0ZURpdih7XG4gICAgICBjbHM6IFwiY2hyb25vLWRpZ2l0c1wiLFxuICAgICAgYXR0cjogeyBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0sXG4gICAgfSk7XG4gICAgY29uc3QgaG91ciA9IGRpZ2l0cy5jcmVhdGVTcGFuKHsgY2xzOiBcImNocm9uby1ob3VyXCIgfSk7XG4gICAgZGlnaXRzLmNyZWF0ZVNwYW4oeyBjbHM6IFwiY2hyb25vLWNvbG9uXCIsIHRleHQ6IFwiOlwiIH0pO1xuICAgIGNvbnN0IG1pbnV0ZSA9IGRpZ2l0cy5jcmVhdGVTcGFuKHsgY2xzOiBcImNocm9uby1taW51dGVcIiB9KTtcbiAgICBjb25zdCBzZWNvbmRzID0gZGlnaXRzLmNyZWF0ZVNwYW4oeyBjbHM6IFwiY2hyb25vLXNlY29uZHNcIiB9KTtcbiAgICBzZWNvbmRzLmNyZWF0ZVNwYW4oeyBjbHM6IFwiY2hyb25vLWNvbG9uXCIsIHRleHQ6IFwiOlwiIH0pO1xuICAgIGNvbnN0IHNlY29uZCA9IHNlY29uZHMuY3JlYXRlU3Bhbih7IGNsczogXCJjaHJvbm8tc2Vjb25kXCIgfSk7XG4gICAgY29uc3QgcGVyaW9kID0gY2xvY2suY3JlYXRlU3Bhbih7XG4gICAgICBjbHM6IFwiY2hyb25vLXBlcmlvZFwiLFxuICAgICAgYXR0cjogeyBcImFyaWEtaGlkZGVuXCI6IFwidHJ1ZVwiIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBwcm9ncmVzcyA9IGxvY2FsLmNyZWF0ZURpdih7XG4gICAgICBjbHM6IFwiY2hyb25vLXByb2dyZXNzXCIsXG4gICAgICBhdHRyOiB7IFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSxcbiAgICB9KTtcbiAgICBjb25zdCBwcm9ncmVzc0ZpbGwgPSBwcm9ncmVzcy5jcmVhdGVEaXYoeyBjbHM6IFwiY2hyb25vLXByb2dyZXNzLWZpbGxcIiB9KTtcblxuICAgIGNvbnN0IGRhdGUgPSBsb2NhbC5jcmVhdGVEaXYoe1xuICAgICAgY2xzOiBcImNocm9uby1kYXRlXCIsXG4gICAgICBhdHRyOiB7IFwiYXJpYS1oaWRkZW5cIjogXCJ0cnVlXCIgfSxcbiAgICB9KTtcbiAgICBjb25zdCB3ZWVrZGF5ID0gZGF0ZS5jcmVhdGVEaXYoeyBjbHM6IFwiY2hyb25vLXdlZWtkYXlcIiB9KTtcbiAgICBjb25zdCBkYXRldGV4dCA9IGRhdGUuY3JlYXRlRGl2KHsgY2xzOiBcImNocm9uby1kYXRldGV4dFwiIH0pO1xuXG4gICAgLy8gLS0tLSBXb3JsZCBjbG9ja3MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGNvbnN0IHdvcmxkU2VjdGlvbiA9IHJvb3QuY3JlYXRlRGl2KHsgY2xzOiBcImNocm9uby13b3JsZFwiIH0pO1xuICAgIGNvbnN0IGhlYWQgPSB3b3JsZFNlY3Rpb24uY3JlYXRlRGl2KHsgY2xzOiBcImNocm9uby13b3JsZC1oZWFkXCIgfSk7XG4gICAgaGVhZC5jcmVhdGVEaXYoeyBjbHM6IFwiY2hyb25vLXNlY3Rpb24tdGl0bGVcIiwgdGV4dDogXCJXb3JsZCBjbG9ja3NcIiB9KTtcbiAgICBjb25zdCBhZGRCdXR0b24gPSBoZWFkLmNyZWF0ZUVsKFwiYnV0dG9uXCIsIHtcbiAgICAgIGNsczogXCJjaHJvbm8taWNvbi1idXR0b25cIixcbiAgICAgIGF0dHI6IHsgdHlwZTogXCJidXR0b25cIiwgXCJhcmlhLWxhYmVsXCI6IFwiQWRkIGEgd29ybGQgY2xvY2tcIiB9LFxuICAgIH0pO1xuICAgIHNldEljb24oYWRkQnV0dG9uLCBcInBsdXNcIik7XG4gICAgdGhpcy5yZWdpc3RlckRvbUV2ZW50KGFkZEJ1dHRvbiwgXCJjbGlja1wiLCAoKSA9PiB0aGlzLm9wZW5QaWNrZXIoKSk7XG5cbiAgICBjb25zdCB3b3JsZExpc3QgPSB3b3JsZFNlY3Rpb24uY3JlYXRlRWwoXCJ1bFwiLCB7XG4gICAgICBjbHM6IFwiY2hyb25vLXdvcmxkLWxpc3RcIixcbiAgICAgIGF0dHI6IHsgXCJhcmlhLWxhYmVsXCI6IFwiV29ybGQgY2xvY2tzXCIgfSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGVtcHR5ID0gd29ybGRTZWN0aW9uLmNyZWF0ZURpdih7IGNsczogXCJjaHJvbm8tZW1wdHlcIiB9KTtcbiAgICBzZXRJY29uKGVtcHR5LmNyZWF0ZURpdih7IGNsczogXCJjaHJvbm8tZW1wdHktaWNvblwiIH0pLCBcImdsb2JlXCIpO1xuICAgIGVtcHR5LmNyZWF0ZURpdih7IGNsczogXCJjaHJvbm8tZW1wdHktdGl0bGVcIiwgdGV4dDogXCJObyB3b3JsZCBjbG9ja3MgeWV0XCIgfSk7XG4gICAgZW1wdHkuY3JlYXRlRGl2KHtcbiAgICAgIGNsczogXCJjaHJvbm8tZW1wdHktdGV4dFwiLFxuICAgICAgdGV4dDogXCJBZGQgYSBjaXR5IG9yIHRpbWUgem9uZSB0byBzZWUgaXRzIHRpbWUsIGRheSBhbmQgb2Zmc2V0IG5leHQgdG8geW91cnMuXCIsXG4gICAgfSk7XG4gICAgY29uc3QgZW1wdHlBZGQgPSBlbXB0eS5jcmVhdGVFbChcImJ1dHRvblwiLCB7XG4gICAgICBjbHM6IFwiY2hyb25vLWJ1dHRvblwiLFxuICAgICAgdGV4dDogXCJBZGQgYSBjaXR5XCIsXG4gICAgICBhdHRyOiB7IHR5cGU6IFwiYnV0dG9uXCIgfSxcbiAgICB9KTtcbiAgICB0aGlzLnJlZ2lzdGVyRG9tRXZlbnQoZW1wdHlBZGQsIFwiY2xpY2tcIiwgKCkgPT4gdGhpcy5vcGVuUGlja2VyKCkpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJvb3QsXG4gICAgICBsb2NhbDoge1xuICAgICAgICB6b25lLFxuICAgICAgICB6b25lTmFtZSxcbiAgICAgICAgem9uZU9mZnNldCxcbiAgICAgICAgY2xvY2ssXG4gICAgICAgIGhvdXIsXG4gICAgICAgIG1pbnV0ZSxcbiAgICAgICAgc2Vjb25kcyxcbiAgICAgICAgc2Vjb25kLFxuICAgICAgICBwZXJpb2QsXG4gICAgICAgIHByb2dyZXNzLFxuICAgICAgICBwcm9ncmVzc0ZpbGwsXG4gICAgICAgIGRhdGUsXG4gICAgICAgIHdlZWtkYXksXG4gICAgICAgIGRhdGV0ZXh0LFxuICAgICAgfSxcbiAgICAgIHdvcmxkU2VjdGlvbixcbiAgICAgIGFkZEJ1dHRvbixcbiAgICAgIHdvcmxkTGlzdCxcbiAgICAgIGVtcHR5LFxuICAgICAgZW1wdHlBZGQsXG4gICAgfTtcbiAgfVxufVxuIiwgImltcG9ydCB7IEFwcCwgTW9kYWwgfSBmcm9tIFwib2JzaWRpYW5cIjtcbmltcG9ydCB7IHNlYXJjaENpdGllcywgdHlwZSBDaXR5T3B0aW9uIH0gZnJvbSBcIi4vdGltZVpvbmVzXCI7XG5cbi8qKiBTZWFyY2hhYmxlIGxpc3Qgb2YgY2l0aWVzIGFuZCBJQU5BIHRpbWUgem9uZXMuIEtleWJvYXJkIGFycm93cyBtb3ZlIGJldHdlZW4gcmVzdWx0cy4gKi9cbmV4cG9ydCBjbGFzcyBDaXR5UGlja2VyTW9kYWwgZXh0ZW5kcyBNb2RhbCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIGFwcDogQXBwLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgdGFrZW46IFJlYWRvbmx5U2V0PHN0cmluZz4sXG4gICAgcHJpdmF0ZSByZWFkb25seSBvblBpY2s6IChjaXR5OiBDaXR5T3B0aW9uKSA9PiB2b2lkXG4gICkge1xuICAgIHN1cGVyKGFwcCk7XG4gIH1cblxuICBvbk9wZW4oKTogdm9pZCB7XG4gICAgY29uc3QgeyBjb250ZW50RWwgfSA9IHRoaXM7XG4gICAgdGhpcy5zZXRUaXRsZShcIkFkZCBhIGNpdHlcIik7XG4gICAgY29udGVudEVsLmFkZENsYXNzKFwiY2hyb25vLXBpY2tlclwiKTtcblxuICAgIGNvbnN0IGlucHV0ID0gY29udGVudEVsLmNyZWF0ZUVsKFwiaW5wdXRcIiwge1xuICAgICAgY2xzOiBcImNocm9uby1waWNrZXItaW5wdXRcIixcbiAgICAgIGF0dHI6IHtcbiAgICAgICAgdHlwZTogXCJzZWFyY2hcIixcbiAgICAgICAgcGxhY2Vob2xkZXI6IFwiQ2l0eSwgY291bnRyeSBvciB0aW1lIHpvbmVcIixcbiAgICAgICAgXCJhcmlhLWxhYmVsXCI6IFwiU2VhcmNoIGNpdGllcyBhbmQgdGltZSB6b25lc1wiLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBjb25zdCByZXN1bHRzID0gY29udGVudEVsLmNyZWF0ZUVsKFwidWxcIiwge1xuICAgICAgY2xzOiBcImNocm9uby1waWNrZXItcmVzdWx0c1wiLFxuICAgICAgYXR0cjogeyBcImFyaWEtbGFiZWxcIjogXCJNYXRjaGluZyBjaXRpZXNcIiB9LFxuICAgIH0pO1xuICAgIGNvbnN0IGhpbnQgPSBjb250ZW50RWwuY3JlYXRlRGl2KHsgY2xzOiBcImNocm9uby1waWNrZXItaGludFwiIH0pO1xuXG4gICAgY29uc3QgcmVuZGVyID0gKCk6IHZvaWQgPT4ge1xuICAgICAgcmVzdWx0cy5lbXB0eSgpO1xuICAgICAgY29uc3QgbWF0Y2hlcyA9IHNlYXJjaENpdGllcyhpbnB1dC52YWx1ZSk7XG4gICAgICBoaW50LnNldFRleHQoXG4gICAgICAgIG1hdGNoZXMubGVuZ3RoID09PSAwXG4gICAgICAgICAgPyBcIk5vIG1hdGNoZXMuIFRyeSBhIGNpdHkgbmFtZSBvciBhIHRpbWUgem9uZSBzdWNoIGFzIEV1cm9wZS9QYXJpcy5cIlxuICAgICAgICAgIDogXCJcIlxuICAgICAgKTtcblxuICAgICAgZm9yIChjb25zdCBjaXR5IG9mIG1hdGNoZXMpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHJlc3VsdHMuY3JlYXRlRWwoXCJsaVwiKTtcbiAgICAgICAgY29uc3QgaXNUYWtlbiA9IHRoaXMudGFrZW4uaGFzKGNpdHkuem9uZSk7XG4gICAgICAgIGNvbnN0IGJ1dHRvbiA9IGl0ZW0uY3JlYXRlRWwoXCJidXR0b25cIiwge1xuICAgICAgICAgIGNsczogXCJjaHJvbm8tcGlja2VyLW9wdGlvblwiLFxuICAgICAgICAgIGF0dHI6IHsgdHlwZTogXCJidXR0b25cIiB9LFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgdGV4dCA9IGJ1dHRvbi5jcmVhdGVEaXYoeyBjbHM6IFwiY2hyb25vLXBpY2tlci10ZXh0XCIgfSk7XG4gICAgICAgIHRleHQuY3JlYXRlU3Bhbih7IGNsczogXCJjaHJvbm8tcGlja2VyLW5hbWVcIiwgdGV4dDogY2l0eS5uYW1lIH0pO1xuICAgICAgICB0ZXh0LmNyZWF0ZVNwYW4oe1xuICAgICAgICAgIGNsczogXCJjaHJvbm8tcGlja2VyLWRldGFpbFwiLFxuICAgICAgICAgIHRleHQ6IGNpdHkuY291bnRyeSA/IGAke2NpdHkuY291bnRyeX0gXHUwMEI3ICR7Y2l0eS56b25lfWAgOiBjaXR5LnpvbmUsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoaXNUYWtlbikge1xuICAgICAgICAgIGJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgYnV0dG9uLmNyZWF0ZVNwYW4oeyBjbHM6IFwiY2hyb25vLXBpY2tlci1hZGRlZFwiLCB0ZXh0OiBcIkFkZGVkXCIgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICB0aGlzLm9uUGljayhjaXR5KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLnJlZ2lzdGVyRG9tRXZlbnQoaW5wdXQsIFwiaW5wdXRcIiwgcmVuZGVyKTtcbiAgICB0aGlzLnJlZ2lzdGVyRG9tRXZlbnQoaW5wdXQsIFwia2V5ZG93blwiLCAoZXZ0OiBLZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZ0LmtleSA9PT0gXCJBcnJvd0Rvd25cIikge1xuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5lbmFibGVkT3B0aW9ucyhyZXN1bHRzKVswXT8uZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLnJlZ2lzdGVyRG9tRXZlbnQocmVzdWx0cywgXCJrZXlkb3duXCIsIChldnQ6IEtleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgIGlmIChldnQua2V5ICE9PSBcIkFycm93RG93blwiICYmIGV2dC5rZXkgIT09IFwiQXJyb3dVcFwiKSByZXR1cm47XG4gICAgICBjb25zdCBvcHRpb25zID0gdGhpcy5lbmFibGVkT3B0aW9ucyhyZXN1bHRzKTtcbiAgICAgIGNvbnN0IGluZGV4ID0gb3B0aW9ucy5pbmRleE9mKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgYXMgSFRNTEJ1dHRvbkVsZW1lbnQpO1xuICAgICAgaWYgKGluZGV4IDwgMCkgcmV0dXJuO1xuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBjb25zdCBzdGVwID0gZXZ0LmtleSA9PT0gXCJBcnJvd0Rvd25cIiA/IDEgOiAtMTtcbiAgICAgIGNvbnN0IG5leHQgPSBvcHRpb25zW2luZGV4ICsgc3RlcF07XG4gICAgICBpZiAobmV4dCkgbmV4dC5mb2N1cygpO1xuICAgICAgZWxzZSBpZiAoc3RlcCA8IDApIGlucHV0LmZvY3VzKCk7XG4gICAgfSk7XG5cbiAgICByZW5kZXIoKTtcbiAgICBpbnB1dC5mb2N1cygpO1xuICB9XG5cbiAgcHJpdmF0ZSBlbmFibGVkT3B0aW9ucyhsaXN0OiBIVE1MRWxlbWVudCk6IEhUTUxCdXR0b25FbGVtZW50W10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKFxuICAgICAgbGlzdC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxCdXR0b25FbGVtZW50PihcImJ1dHRvbi5jaHJvbm8tcGlja2VyLW9wdGlvbjpub3QoOmRpc2FibGVkKVwiKVxuICAgICk7XG4gIH1cblxuICBvbkNsb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuY29udGVudEVsLmVtcHR5KCk7XG4gIH1cbn1cbiIsICJpbXBvcnQgeyBNQVhfV09STERfQ0xPQ0tTIH0gZnJvbSBcIi4vY29uc3RhbnRzXCI7XG5pbXBvcnQgdHlwZSB7IFdvcmxkQ2xvY2tFbnRyeSB9IGZyb20gXCIuL3NldHRpbmdzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNXb3JsZENsb2NrKGxpc3Q6IHJlYWRvbmx5IFdvcmxkQ2xvY2tFbnRyeVtdLCB6b25lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIGxpc3Quc29tZSgoZW50cnkpID0+IGVudHJ5LnpvbmUgPT09IHpvbmUpO1xufVxuXG4vKiogUmV0dXJucyB0aGUgbGlzdCB1bmNoYW5nZWQgd2hlbiB0aGUgem9uZSBpcyBhbHJlYWR5IHByZXNlbnQgb3IgdGhlIGxpc3QgaXMgZnVsbC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRXb3JsZENsb2NrKFxuICBsaXN0OiByZWFkb25seSBXb3JsZENsb2NrRW50cnlbXSxcbiAgZW50cnk6IFdvcmxkQ2xvY2tFbnRyeVxuKTogV29ybGRDbG9ja0VudHJ5W10ge1xuICBpZiAoaGFzV29ybGRDbG9jayhsaXN0LCBlbnRyeS56b25lKSB8fCBsaXN0Lmxlbmd0aCA+PSBNQVhfV09STERfQ0xPQ0tTKSB7XG4gICAgcmV0dXJuIFsuLi5saXN0XTtcbiAgfVxuICByZXR1cm4gWy4uLmxpc3QsIGVudHJ5XTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVdvcmxkQ2xvY2soXG4gIGxpc3Q6IHJlYWRvbmx5IFdvcmxkQ2xvY2tFbnRyeVtdLFxuICB6b25lOiBzdHJpbmdcbik6IFdvcmxkQ2xvY2tFbnRyeVtdIHtcbiAgcmV0dXJuIGxpc3QuZmlsdGVyKChlbnRyeSkgPT4gZW50cnkuem9uZSAhPT0gem9uZSk7XG59XG5cbi8qKiBTd2FwcyB0aGUgZW50cnkgd2l0aCBpdHMgbmVpZ2hib3VyLiBUaGUgbGlzdCBpcyByZXR1cm5lZCB1bmNoYW5nZWQgYXQgZWl0aGVyIGVkZ2UuICovXG5leHBvcnQgZnVuY3Rpb24gbW92ZVdvcmxkQ2xvY2soXG4gIGxpc3Q6IHJlYWRvbmx5IFdvcmxkQ2xvY2tFbnRyeVtdLFxuICB6b25lOiBzdHJpbmcsXG4gIGRpcmVjdGlvbjogLTEgfCAxXG4pOiBXb3JsZENsb2NrRW50cnlbXSB7XG4gIGNvbnN0IGluZGV4ID0gbGlzdC5maW5kSW5kZXgoKGVudHJ5KSA9PiBlbnRyeS56b25lID09PSB6b25lKTtcbiAgY29uc3QgdGFyZ2V0ID0gaW5kZXggKyBkaXJlY3Rpb247XG4gIGNvbnN0IG5leHQgPSBbLi4ubGlzdF07XG4gIGlmIChpbmRleCA8IDAgfHwgdGFyZ2V0IDwgMCB8fCB0YXJnZXQgPj0gbmV4dC5sZW5ndGgpIHJldHVybiBuZXh0O1xuICBbbmV4dFtpbmRleF0sIG5leHRbdGFyZ2V0XV0gPSBbbmV4dFt0YXJnZXRdLCBuZXh0W2luZGV4XV07XG4gIHJldHVybiBuZXh0O1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBQUFBLG1CQUF3RDs7O0FDY3hELElBQU0sVUFBMkQ7QUFBQSxFQUMvRCxDQUFDLFlBQVksaUJBQWlCLGtCQUFrQjtBQUFBLEVBQ2hELENBQUMsV0FBVyxpQkFBaUIs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RW5CO0FBa0VJLGVBQUssY0FBTCxtQkFBZ0I7QUFDaEIsU0FBSyxZQUFZO0FBQ2pCLGVBQUssV0FBTCxtQkFBYTtBQUFBLEVBQ2Y7QUFBQTtBQUFBLEVBR0EsTUFBTSxlQUE4QjtBQXhFdEM7QUF5RUksUUFBSTtBQUNGLFlBQU0sRUFBRSxVQUFVLElBQUksS0FBSztBQUMzQixVQUFJLFFBQ0YsZUFBVSxnQkFBZ0IsZ0JBQWdCLEVBQUUsQ0FBQyxNQUE3QyxZQUFrRDtBQUVwRCxVQUFJLENBQUMsTUFBTTtBQUNULGVBQU8sVUFBVSxhQUFhLEtBQUs7QUFDbkMsWUFBSSxDQUFDLE1BQU07QUFDVCxjQUFJLHdCQUFPLDZDQUE2QztBQUN4RDtBQUFBLFFBQ0Y7QUFDQSxjQUFNLEtBQUssYUFBYSxFQUFFLE1BQU0sa0JBQWtCLFFBQVEsS0FBSyxDQUFDO0FBQUEsTUFDbEU7QUFDQSxZQUFNLFVBQVUsV0FBVyxJQUFJO0FBQUEsSUFDakMsU0FBUyxPQUFPO0FBQ2QsY0FBUSxNQUFNLDBDQUEwQyxLQUFLO0FBQzdELFVBQUksd0JBQU8sK0RBQStEO0FBQUEsSUFDNUU7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE1BQU0sZUFBZSxPQUErQztBQUNsRSxTQUFLLFdBQVcsaUJBQWlCLEVBQUUsR0FBRyxLQUFLLFVBQVUsR0FBRyxNQUFNLENBQUM7QUFDL0QsU0FBSyxPQUFPLFVBQVUsS0FBSyxRQUFRO0FBQ25DLFNBQUssV0FBVztBQUVoQixRQUFJO0FBQ0YsWUFBTSxLQUFLLFNBQVMsaUJBQWlCLEtBQUssUUFBUSxDQUFDO0FBQUEsSUFDckQsU0FBUyxPQUFPO0FBQ2QsY0FBUSxNQUFNLG9DQUFvQyxLQUFLO0FBQ3ZELFVBQUksd0JBQU8seUNBQXlDO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQUEsRUFFQSxNQUFjLGVBQThCO0FBQzFDLFFBQUk7QUFDRixXQUFLLFdBQVcsaUJBQWlCLE1BQU0sS0FBSyxTQUFTLENBQUM7QUFBQSxJQUN4RCxTQUFTLE9BQU87QUFDZCxjQUFRLE1BQU0sb0RBQW9ELEtBQUs7QUFDdkUsV0FBSyxXQUFXLG1CQUFtQjtBQUFBLElBQ3JDO0FBQUEsRUFDRjtBQUFBLEVBRVEsYUFBbUI7QUFwSDdCO0FBcUhJLGVBQVcsUUFBUSxLQUFLLElBQUksVUFBVSxnQkFBZ0IsZ0JBQWdCLEdBQUc7QUFFdkUsVUFBSSxLQUFLLGdCQUFnQixXQUFZLE1BQUssS0FBSyxjQUFjO0FBQUEsSUFDL0Q7QUFDQSxlQUFLLGNBQUwsbUJBQWdCO0FBQUEsRUFDbEI7QUFDRjsiLAogICJuYW1lcyI6IFsiaW1wb3J0X29ic2lkaWFuIiwgImltcG9ydF9vYnNpZGlhbiIsICJpbXBvcnRfb2JzaWRpYW4iXQp9Cg==
