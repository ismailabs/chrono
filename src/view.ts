import { ItemView, WorkspaceLeaf } from "obsidian";
import type ChronoPlugin from "./main";
import type { ClockSnapshot } from "./clock";
import type { HourFormat } from "./settings";
import {
  GLITCH_MAX_DELAY_MS,
  GLITCH_MIN_DELAY_MS,
  VIEW_TYPE_CHRONO,
} from "./constants";

type BarKind = "hour" | "minute" | "second";

interface BarElements {
  /** Collapsible wrapper, animates the whole row open and closed. */
  wrap: HTMLElement;
  /** The row itself. Carries the glitch burst class and the tick count. */
  row: HTMLElement;
  /** The coloured fill. Its width follows --chrono-p. */
  fill: HTMLElement;
  /** Last progress written, used to detect the bar wrapping back to zero. */
  last: number;
}

interface ViewElements {
  root: HTMLElement;
  card: HTMLElement;
  time: HTMLElement;
  hour: HTMLElement;
  minute: HTMLElement;
  seconds: HTMLElement;
  second: HTMLElement;
  period: HTMLElement;
  barsWrap: HTMLElement;
  bars: Record<BarKind, BarElements>;
  dateWrap: HTMLElement;
  weekday: HTMLElement;
  date: HTMLElement;
  zoneWrap: HTMLElement;
  zoneName: HTMLElement;
  zoneOffset: HTMLElement;
  segment: HTMLElement;
  btn12: HTMLButtonElement;
  btn24: HTMLButtonElement;
  chipSeconds: HTMLButtonElement;
  chipDate: HTMLButtonElement;
  chipBars: HTMLButtonElement;
  chipGlitch: HTMLButtonElement;
}

const BAR_KINDS: BarKind[] = ["hour", "minute", "second"];

/** Only writes to the DOM when the text actually changed. */
function writeText(el: HTMLElement, value: string): void {
  if (el.textContent !== value) el.textContent = value;
}

/**
 * Like writeText, but also mirrors the value into data-text (the glitch
 * ghost layers read it) and reports whether anything changed.
 */
function writeDigits(el: HTMLElement, value: string): boolean {
  if (el.textContent === value) return false;
  el.textContent = value;
  el.setAttr("data-text", value);
  return true;
}

/**
 * Plays a one-shot CSS animation again from the start. Removing the class,
 * forcing a style flush, then adding it back is the standard way to do it.
 */
function restartAnimation(els: HTMLElement[], cls: string): void {
  if (els.length === 0) return;
  for (const el of els) el.removeClass(cls);
  void els[0].offsetWidth;
  for (const el of els) el.addClass(cls);
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/** A row that animates open and closed without JavaScript measuring. */
function createCollapse(
  parent: HTMLElement,
  extraClass: string
): { wrap: HTMLElement; inner: HTMLElement } {
  const wrap = parent.createDiv({ cls: ["chrono-collapse", extraClass] });
  const inner = wrap.createDiv({ cls: "chrono-collapse-inner" });
  return { wrap, inner };
}

function setCollapsed(wrap: HTMLElement, collapsed: boolean): void {
  wrap.toggleClass("is-collapsed", collapsed);
  wrap.setAttr("aria-hidden", String(collapsed));
}

export class ChronoView extends ItemView {
  private els: ViewElements | null = null;
  private unsubscribe: (() => void) | null = null;
  private lastLabel = "";
  private ambientTimer: number | null = null;

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

    this.scheduleAmbientGlitch();
  }

  async onClose(): Promise<void> {
    this.clearAmbientGlitch();
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.els = null;
    this.contentEl.empty();
  }

  /** Syncs controls and layout with the current settings, then redraws. */
  applySettings(): void {
    const e = this.els;
    if (!e) return;
    const settings = this.chrono.settings;

    e.root.setAttr("data-glitch", settings.glitchEffects ? "on" : "off");

    e.time.setAttr("data-seconds", String(settings.showSeconds));
    e.seconds.toggleClass("chrono-is-hidden", !settings.showSeconds);

    // The bar block stays open while any of its three rows is showing.
    setCollapsed(e.barsWrap, !settings.showBars && !settings.showSeconds);
    setCollapsed(e.bars.hour.wrap, !settings.showBars);
    setCollapsed(e.bars.minute.wrap, !settings.showBars);
    setCollapsed(e.bars.second.wrap, !settings.showSeconds);
    e.bars.hour.row.setCssProps({
      "--chrono-segs": settings.hourFormat === "12" ? "12" : "24",
    });

    setCollapsed(e.dateWrap, !settings.showDate);
    setCollapsed(e.zoneWrap, !settings.showTimezone);

    e.segment.setAttr("data-value", settings.hourFormat);
    const is12 = settings.hourFormat === "12";
    e.btn12.setAttr("aria-checked", String(is12));
    e.btn12.setAttr("tabindex", is12 ? "0" : "-1");
    e.btn24.setAttr("aria-checked", String(!is12));
    e.btn24.setAttr("tabindex", is12 ? "-1" : "0");

    e.chipSeconds.setAttr("aria-checked", String(settings.showSeconds));
    e.chipDate.setAttr("aria-checked", String(settings.showDate));
    e.chipBars.setAttr("aria-checked", String(settings.showBars));
    e.chipGlitch.setAttr("aria-checked", String(settings.glitchEffects));

    this.render(this.chrono.engine.snapshot());
  }

  private render(snapshot: ClockSnapshot): void {
    const e = this.els;
    if (!e) return;

    // Digits that changed this frame get a glitch burst.
    const changed: HTMLElement[] = [];
    if (writeDigits(e.hour, snapshot.hour)) changed.push(e.hour);
    if (writeDigits(e.minute, snapshot.minute)) changed.push(e.minute);
    if (writeDigits(e.second, snapshot.second)) changed.push(e.second);
    restartAnimation(changed, "is-glitching");

    writeText(e.period, snapshot.period);
    e.period.toggleClass("chrono-is-hidden", snapshot.period === "");

    writeText(e.weekday, snapshot.weekday);
    writeText(e.date, snapshot.date);
    writeText(e.zoneName, snapshot.zoneName);
    writeText(e.zoneOffset, snapshot.zoneOffset);

    const settings = this.chrono.settings;
    if (settings.showBars) {
      this.updateBar(e.bars.hour, snapshot.hourProgress);
      this.updateBar(e.bars.minute, snapshot.minuteProgress);
    }
    if (settings.showSeconds) this.updateBar(e.bars.second, snapshot.progress);

    if (snapshot.label !== this.lastLabel) {
      e.card.setAttr("aria-label", snapshot.label);
      this.lastLabel = snapshot.label;
    }
  }

  private updateBar(bar: BarElements, value: number): void {
    // When a bar rolls over it jumps back to zero. Skip the transition for
    // that jump and give the row a glitch burst instead of a slow rewind.
    const wrapped = value < bar.last;
    if (wrapped) bar.fill.addClass("chrono-no-transition");
    bar.fill.setCssProps({ "--chrono-p": value.toFixed(4) });
    if (wrapped) {
      void bar.fill.offsetWidth; // flush so the jump is applied without animating
      bar.fill.removeClass("chrono-no-transition");
      restartAnimation([bar.row], "is-glitching");
    }
    bar.last = value;
  }

  // ---- Ambient glitching -----------------------------------------------
  // Random, unprompted bursts so the clock feels alive between ticks.

  private scheduleAmbientGlitch(): void {
    this.clearAmbientGlitch();
    const delay =
      GLITCH_MIN_DELAY_MS +
      Math.random() * (GLITCH_MAX_DELAY_MS - GLITCH_MIN_DELAY_MS);
    this.ambientTimer = window.setTimeout(() => {
      this.ambientTimer = null;
      this.fireAmbientGlitch();
      if (this.els) this.scheduleAmbientGlitch();
    }, delay);
  }

  private clearAmbientGlitch(): void {
    if (this.ambientTimer !== null) {
      window.clearTimeout(this.ambientTimer);
      this.ambientTimer = null;
    }
  }

  private fireAmbientGlitch(): void {
    const e = this.els;
    if (!e) return;
    const settings = this.chrono.settings;
    if (!settings.glitchEffects || prefersReducedMotion()) return;
    if (!this.containerEl.isShown()) return;

    const roll = Math.random();
    if (roll < 0.12) {
      // Rare: the whole time readout tears sideways.
      restartAnimation([e.time], "is-tearing");
      return;
    }

    if (roll < 0.55) {
      const rows = BAR_KINDS.filter((kind) =>
        kind === "second" ? settings.showSeconds : settings.showBars
      ).map((kind) => e.bars[kind].row);
      if (rows.length > 0) {
        restartAnimation([rows[Math.floor(Math.random() * rows.length)]], "is-glitching");
        return;
      }
    }

    const digits = settings.showSeconds
      ? [e.hour, e.minute, e.second]
      : [e.hour, e.minute];
    restartAnimation([digits[Math.floor(Math.random() * digits.length)]], "is-glitching");
  }

  // ---- DOM ---------------------------------------------------------------

  private build(root: HTMLElement): ViewElements {
    // ---- Clock card -------------------------------------------------
    const card = root.createDiv({
      cls: "chrono-card",
      attr: { role: "timer" },
    });

    const time = card.createDiv({
      cls: "chrono-time",
      attr: { "aria-hidden": "true" },
    });
    const hour = time.createSpan({ cls: ["chrono-hour", "chrono-glitch-text"] });
    time.createSpan({ cls: "chrono-colon", text: ":" });
    const minute = time.createSpan({
      cls: ["chrono-minute", "chrono-glitch-text"],
    });
    const seconds = time.createSpan({ cls: "chrono-seconds" });
    seconds.createSpan({ cls: "chrono-colon", text: ":" });
    const second = seconds.createSpan({
      cls: ["chrono-second", "chrono-glitch-text"],
    });
    const period = time.createSpan({ cls: "chrono-period" });

    // ---- Hour / minute / second bars --------------------------------
    const barsBlock = createCollapse(card, "chrono-bars-wrap");
    const barsEl = barsBlock.inner.createDiv({
      cls: "chrono-bars",
      attr: { "aria-hidden": "true" },
    });

    const makeBar = (kind: BarKind, label: string, segments: number): BarElements => {
      const collapse = createCollapse(barsEl, "chrono-bar-wrap");
      const row = collapse.inner.createDiv({
        cls: ["chrono-bar", `chrono-bar-${kind}`],
      });
      row.setCssProps({ "--chrono-segs": String(segments) });
      row.createSpan({ cls: "chrono-bar-label", text: label });
      const track = row.createDiv({ cls: "chrono-bar-track" });
      const fill = track.createDiv({ cls: "chrono-bar-fill" });
      fill.createSpan({ cls: "chrono-bar-head" });
      return { wrap: collapse.wrap, row, fill, last: 0 };
    };

    const bars: Record<BarKind, BarElements> = {
      hour: makeBar("hour", "HRS", 24),
      minute: makeBar("minute", "MIN", 12),
      second: makeBar("second", "SEC", 12),
    };

    const dateBlock = createCollapse(card, "chrono-date-wrap");
    const dateRow = dateBlock.inner.createDiv({
      cls: "chrono-date",
      attr: { "aria-hidden": "true" },
    });
    const weekday = dateRow.createDiv({ cls: "chrono-weekday" });
    const date = dateRow.createDiv({ cls: "chrono-datetext" });

    const zoneBlock = createCollapse(card, "chrono-zone-wrap");
    const zone = zoneBlock.inner.createDiv({ cls: "chrono-zone" });
    const zoneName = zone.createSpan({ cls: "chrono-zone-name" });
    const zoneOffset = zone.createSpan({ cls: "chrono-zone-offset" });

    // ---- Quick controls ---------------------------------------------
    const controls = root.createDiv({ cls: "chrono-controls" });

    const segment = controls.createDiv({
      cls: "chrono-segment",
      attr: { role: "radiogroup", "aria-label": "Hour format" },
    });
    segment.createDiv({
      cls: "chrono-segment-thumb",
      attr: { "aria-hidden": "true" },
    });
    const btn12 = segment.createEl("button", {
      cls: ["chrono-btn", "chrono-segment-btn"],
      text: "12-hour",
      attr: { type: "button", role: "radio" },
    });
    const btn24 = segment.createEl("button", {
      cls: ["chrono-btn", "chrono-segment-btn"],
      text: "24-hour",
      attr: { type: "button", role: "radio" },
    });

    const makeChip = (label: string): HTMLButtonElement => {
      const chip = controls.createEl("button", {
        cls: ["chrono-btn", "chrono-chip"],
        attr: { type: "button", role: "switch" },
      });
      chip.createSpan({
        cls: "chrono-chip-dot",
        attr: { "aria-hidden": "true" },
      });
      chip.createSpan({ text: label });
      return chip;
    };
    const chipSeconds = makeChip("Seconds");
    const chipDate = makeChip("Date");
    const chipBars = makeChip("Bars");
    const chipGlitch = makeChip("Glitch");

    // ---- Events (auto-removed when the view unloads) ----------------
    this.registerDomEvent(btn12, "click", () => {
      void this.chrono.updateSettings({ hourFormat: "12" });
    });
    this.registerDomEvent(btn24, "click", () => {
      void this.chrono.updateSettings({ hourFormat: "24" });
    });
    this.registerDomEvent(chipSeconds, "click", () => {
      void this.chrono.updateSettings({
        showSeconds: !this.chrono.settings.showSeconds,
      });
    });
    this.registerDomEvent(chipDate, "click", () => {
      void this.chrono.updateSettings({
        showDate: !this.chrono.settings.showDate,
      });
    });
    this.registerDomEvent(chipBars, "click", () => {
      void this.chrono.updateSettings({
        showBars: !this.chrono.settings.showBars,
      });
    });
    this.registerDomEvent(chipGlitch, "click", () => {
      void this.chrono.updateSettings({
        glitchEffects: !this.chrono.settings.glitchEffects,
      });
    });
    this.registerDomEvent(segment, "keydown", (evt: KeyboardEvent) => {
      let next: HourFormat | null = null;
      if (["ArrowLeft", "ArrowUp", "Home"].includes(evt.key)) next = "12";
      if (["ArrowRight", "ArrowDown", "End"].includes(evt.key)) next = "24";
      if (!next) return;
      evt.preventDefault();
      void this.chrono.updateSettings({ hourFormat: next });
      (next === "12" ? btn12 : btn24).focus();
    });

    return {
      root,
      card,
      time,
      hour,
      minute,
      seconds,
      second,
      period,
      barsWrap: barsBlock.wrap,
      bars,
      dateWrap: dateBlock.wrap,
      weekday,
      date,
      zoneWrap: zoneBlock.wrap,
      zoneName,
      zoneOffset,
      segment,
      btn12,
      btn24,
      chipSeconds,
      chipDate,
      chipBars,
      chipGlitch,
    };
  }
}
