import type ChronoPlugin from "./main";
import type { ClockSnapshot } from "./clock";

/** Optional clock in Obsidian's status bar. Click to open the full view. */
export class StatusBarClock {
  private readonly el: HTMLElement;
  private unsubscribe: (() => void) | null = null;
  private lastText = "";
  private lastLabel = "";

  constructor(private readonly chrono: ChronoPlugin) {
    this.el = chrono.addStatusBarItem();
    this.el.addClass("chrono-statusbar");
    this.el.setAttr("role", "button");
    this.el.setAttr("tabindex", "0");
    this.el.setAttr("data-tooltip-position", "top");

    chrono.registerDomEvent(this.el, "click", () => {
      void chrono.activateView();
    });
    chrono.registerDomEvent(this.el, "keydown", (evt: KeyboardEvent) => {
      if (evt.key === "Enter" || evt.key === " ") {
        evt.preventDefault();
        void chrono.activateView();
      }
    });

    this.applySettings();
  }

  /** Shows or hides the item, and only subscribes to ticks while visible. */
  applySettings(): void {
    const visible = this.chrono.settings.showStatusBar;
    this.el.toggleClass("chrono-is-hidden", !visible);

    if (visible) {
      this.render(this.chrono.engine.snapshot());
      if (!this.unsubscribe) {
        this.unsubscribe = this.chrono.engine.subscribe((snapshot) =>
          this.render(snapshot)
        );
      }
    } else {
      this.unsubscribe?.();
      this.unsubscribe = null;
    }
  }

  destroy(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  private render(snapshot: ClockSnapshot): void {
    if (snapshot.statusText !== this.lastText) {
      this.el.setText(snapshot.statusText);
      this.lastText = snapshot.statusText;
    }
    if (snapshot.label !== this.lastLabel) {
      this.el.setAttr("aria-label", snapshot.label);
      this.lastLabel = snapshot.label;
    }
  }
}
