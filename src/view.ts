import { ItemView, Notice, setIcon, WorkspaceLeaf } from "obsidian";
import type ChronoPlugin from "./main";
import type { ClockSnapshot, WorldReading } from "./clock";
import { MAX_WORLD_CLOCKS, VIEW_TYPE_CHRONO } from "./constants";
import { CityPickerModal } from "./cityPicker";
import type { WorldClockEntry } from "./settings";
import {
  addWorldClock,
  moveWorldClock,
  removeWorldClock,
} from "./worldClockList";
import type { CityOption } from "./timeZones";

type RowAction = "up" | "down" | "remove";

interface WorldRow {
  row: HTMLElement;
  time: HTMLElement;
  period: HTMLElement;
  day: HTMLElement;
  meta: HTMLElement;
  buttons: Record<RowAction, HTMLButtonElement>;
}

interface LocalElements {
  zone: HTMLElement;
  zoneName: HTMLElement;
  zoneOffset: HTMLElement;
  clock: HTMLElement;
  hour: HTMLElement;
  minute: HTMLElement;
  seconds: HTMLElement;
  second: HTMLElement;
  period: HTMLElement;
  progress: HTMLElement;
  progressFill: HTMLElement;
  date: HTMLElement;
  weekday: HTMLElement;
  datetext: HTMLElement;
}

interface ViewElements {
  root: HTMLElement;
  local: LocalElements;
  worldSection: HTMLElement;
  addButton: HTMLButtonElement;
  worldList: HTMLElement;
  empty: HTMLElement;
  emptyAdd: HTMLButtonElement;
}

/** Only writes to the DOM when the text actually changed. */
function writeText(el: HTMLElement, value: string): void {
  if (el.textContent !== value) el.textContent = value;
}

const ROW_ACTIONS: { action: RowAction; icon: string; label: string }[] = [
  { action: "up", icon: "chevron-up", label: "Move up" },
  { action: "down", icon: "chevron-down", label: "Move down" },
  { action: "remove", icon: "x", label: "Remove" },
];

export class ChronoView extends ItemView {
  private els: ViewElements | null = null;
  private rows = new Map<string, WorldRow>();
  private rowKey = "";
  private unsubscribe: (() => void) | null = null;
  private lastLabel = "";

  constructor(
    leaf: WorkspaceLeaf,
    private readonly chrono: ChronoPlugin
  ) {
    super(leaf);
  }

  getViewType(): string {
    return VIEW_TYPE_CHRONO;
  }

  getDisplayText(): string {
    return "Chrono";
  }

  getIcon(): string {
    return "clock";
  }

  async onOpen(): Promise<void> {
    this.contentEl.empty();
    this.contentEl.addClass("chrono-root");
    this.els = this.build(this.contentEl.createDiv({ cls: "chrono-view" }));
    this.applySettings();

    this.unsubscribe = this.chrono.engine.subscribe((snapshot) => {
      // Skip DOM work while the tab is in the background.
      if (this.containerEl.isShown()) this.render(snapshot);
    });
  }

  async onClose(): Promise<void> {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.rows.clear();
    this.rowKey = "";
    this.lastLabel = "";
    this.els = null;
    this.contentEl.empty();
  }

  /** Syncs layout with the current settings, then redraws. */
  applySettings(): void {
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

  private render(snapshot: ClockSnapshot): void {
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
      "--chrono-progress": snapshot.dayProgress.toFixed(5),
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

  private renderWorld(row: WorldRow, world: WorldReading, showSeconds: boolean): void {
    const core = `${world.hour}:${world.minute}`;
    writeText(row.time, showSeconds ? `${core}:${world.second}` : core);
    writeText(row.period, world.period);
    row.period.toggleClass("chrono-is-hidden", world.period === "");

    const dayWord =
      world.dayOffset === 1 ? "Tomorrow" : world.dayOffset === -1 ? "Yesterday" : "";
    writeText(row.day, dayWord);
    row.day.toggleClass("chrono-is-hidden", dayWord === "");
    writeText(row.meta, `${world.weekday}, ${world.date} · ${world.offset}`);
  }

  /** Rebuilds the list only when the set or order of saved zones changes. */
  private syncWorldRows(): void {
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

  private buildRow(list: HTMLElement, world: WorldClockEntry): WorldRow {
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
    const buttons = {} as Record<RowAction, HTMLButtonElement>;
    for (const { action, icon, label } of ROW_ACTIONS) {
      const button = actions.createEl("button", {
        cls: "chrono-icon-button",
        attr: { type: "button", "aria-label": `${label} ${world.name}` },
      });
      setIcon(button, icon);
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
      buttons,
    };
  }

  private async handleRowAction(zone: string, action: RowAction): Promise<void> {
    const list = this.chrono.settings.worldClocks;
    const next =
      action === "remove"
        ? removeWorldClock(list, zone)
        : moveWorldClock(list, zone, action === "up" ? -1 : 1);
    await this.chrono.updateSettings({ worldClocks: next });
    this.focusAfterAction(zone, action);
  }

  /** Keeps keyboard focus on a sensible control after the list is redrawn. */
  private focusAfterAction(zone: string, action: RowAction): void {
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

  private addCity(city: CityOption): void {
    const list = this.chrono.settings.worldClocks;
    if (list.length >= MAX_WORLD_CLOCKS) {
      new Notice(`You can save up to ${MAX_WORLD_CLOCKS} world clocks.`);
      return;
    }
    const next = addWorldClock(list, { zone: city.zone, name: city.name });
    void this.chrono.updateSettings({ worldClocks: next });
  }

  private openPicker(): void {
    const taken = new Set(this.chrono.settings.worldClocks.map((w) => w.zone));
    new CityPickerModal(this.app, taken, (city) => this.addCity(city)).open();
  }

  private build(root: HTMLElement): ViewElements {
    // ---- This device ------------------------------------------------
    const local = root.createDiv({ cls: "chrono-local" });
    const zone = local.createDiv({ cls: "chrono-local-zone" });
    const zoneName = zone.createSpan({ cls: "chrono-zone-name" });
    zone.createSpan({ cls: "chrono-zone-sep", text: "·", attr: { "aria-hidden": "true" } });
    const zoneOffset = zone.createSpan({ cls: "chrono-zone-offset" });

    const clock = local.createDiv({
      cls: "chrono-clock",
      attr: { role: "timer" },
    });
    const digits = clock.createDiv({
      cls: "chrono-digits",
      attr: { "aria-hidden": "true" },
    });
    const hour = digits.createSpan({ cls: "chrono-hour" });
    digits.createSpan({ cls: "chrono-colon", text: ":" });
    const minute = digits.createSpan({ cls: "chrono-minute" });
    const seconds = digits.createSpan({ cls: "chrono-seconds" });
    seconds.createSpan({ cls: "chrono-colon", text: ":" });
    const second = seconds.createSpan({ cls: "chrono-second" });
    const period = clock.createSpan({
      cls: "chrono-period",
      attr: { "aria-hidden": "true" },
    });

    const progress = local.createDiv({
      cls: "chrono-progress",
      attr: { "aria-hidden": "true" },
    });
    const progressFill = progress.createDiv({ cls: "chrono-progress-fill" });

    const date = local.createDiv({
      cls: "chrono-date",
      attr: { "aria-hidden": "true" },
    });
    const weekday = date.createDiv({ cls: "chrono-weekday" });
    const datetext = date.createDiv({ cls: "chrono-datetext" });

    // ---- World clocks ----------------------------------------------
    const worldSection = root.createDiv({ cls: "chrono-world" });
    const head = worldSection.createDiv({ cls: "chrono-world-head" });
    head.createDiv({ cls: "chrono-section-title", text: "World clocks" });
    const addButton = head.createEl("button", {
      cls: "chrono-icon-button",
      attr: { type: "button", "aria-label": "Add a world clock" },
    });
    setIcon(addButton, "plus");
    this.registerDomEvent(addButton, "click", () => this.openPicker());

    const worldList = worldSection.createEl("ul", {
      cls: "chrono-world-list",
      attr: { "aria-label": "World clocks" },
    });

    const empty = worldSection.createDiv({ cls: "chrono-empty" });
    setIcon(empty.createDiv({ cls: "chrono-empty-icon" }), "globe");
    empty.createDiv({ cls: "chrono-empty-title", text: "No world clocks yet" });
    empty.createDiv({
      cls: "chrono-empty-text",
      text: "Add a city or time zone to see its time, day and offset next to yours.",
    });
    const emptyAdd = empty.createEl("button", {
      cls: "chrono-button",
      text: "Add a city",
      attr: { type: "button" },
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
        datetext,
      },
      worldSection,
      addButton,
      worldList,
      empty,
      emptyAdd,
    };
  }
}
